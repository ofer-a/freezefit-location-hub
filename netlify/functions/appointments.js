// Netlify Function for appointments API
import { query, createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const { httpMethod, path, pathParameters } = event;
    
    // Extract ID from path if not in pathParameters
    let appointmentId = pathParameters?.id;
    if (!appointmentId && path.includes('/appointments/')) {
      const pathParts = path.split('/');
      const appointmentsIndex = pathParts.indexOf('appointments');
      if (appointmentsIndex !== -1 && pathParts[appointmentsIndex + 1]) {
        // Only extract as appointmentId if it's not a special path like /user/ or /institute/
        const nextPart = pathParts[appointmentsIndex + 1];
        if (nextPart !== 'user' && nextPart !== 'institute') {
          appointmentId = nextPart;
        }
      }
    }
    
    switch (httpMethod) {
      case 'GET':
        if (appointmentId) {
          // Get single appointment
          const result = await query('SELECT * FROM appointments WHERE id = $1', [appointmentId]);
          return createResponse(200, result.rows[0] || null);
        } else if (path.includes('/user/')) {
          // Get appointments by user with institute and therapist names
          const userId = path.split('/user/')[1];
          const result = await query(`
            SELECT
              a.*,
              i.institute_name,
              t.name as therapist_name
            FROM appointments a
            LEFT JOIN institutes i ON a.institute_id = i.id
            LEFT JOIN therapists t ON a.therapist_id = t.id
            WHERE a.user_id = $1
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
          `, [userId]);
          return createResponse(200, result.rows);
        } else if (path.includes('/institute/')) {
          // Get appointments by institute with user names
          const instituteId = path.split('/institute/')[1];
          const result = await query(`
            SELECT
              a.*,
              p.full_name as user_name,
              p.email as user_email
            FROM appointments a
            LEFT JOIN profiles p ON a.user_id = p.id
            WHERE a.institute_id = $1
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
          `, [instituteId]);
          return createResponse(200, result.rows);
        } else {
          // Get all appointments
          const result = await query('SELECT * FROM appointments ORDER BY appointment_date DESC, appointment_time DESC');
          return createResponse(200, result.rows);
        }

      case 'POST':
        const { user_id, institute_id, therapist_id, therapist_name, institute_name, service_name, appointment_date, appointment_time, status, price } = JSON.parse(event.body);
        const insertResult = await query(
          `INSERT INTO appointments (user_id, institute_id, therapist_id, therapist_name, institute_name, service_name, appointment_date, appointment_time, status, price)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
          [user_id, institute_id, therapist_id, therapist_name, institute_name, service_name, appointment_date, appointment_time, status || 'pending', price]
        );
        return createResponse(201, insertResult.rows[0]);

      case 'PUT':
        if (!appointmentId) {
          return createResponse(400, null, 'Appointment ID is required');
        }
        
        if (path.includes('/status')) {
          // Update appointment status
          const { status } = JSON.parse(event.body);
          const updateResult = await query(
            'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, appointmentId]
          );
          return createResponse(200, updateResult.rows[0] || null);
        } else {
          // Update appointment
          const updates = JSON.parse(event.body);
          const fields = [];
          const values = [];
          let paramCount = 1;

          Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
              fields.push(`${key} = $${paramCount}`);
              values.push(value);
              paramCount++;
            }
          });

          if (fields.length === 0) {
            return createResponse(400, null, 'No valid fields to update');
          }

          values.push(appointmentId);
          const updateResult = await query(
            `UPDATE appointments SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
            values
          );
          return createResponse(200, updateResult.rows[0] || null);
        }

      case 'DELETE':
        if (!appointmentId) {
          return createResponse(400, null, 'Appointment ID is required');
        }
        const deleteResult = await query('DELETE FROM appointments WHERE id = $1', [appointmentId]);
        return createResponse(200, { deleted: deleteResult.rowCount > 0 });

      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Appointment API error:', error);
    return createResponse(500, null, error.message);
  }
};
