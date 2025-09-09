// Netlify Function for workshops API
import { query, createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const { httpMethod, path, pathParameters } = event;
    
    switch (httpMethod) {
      case 'GET':
        if (pathParameters && pathParameters.id) {
          // Get single workshop
          const result = await query('SELECT * FROM workshops WHERE id = $1', [pathParameters.id]);
          return createResponse(200, result.rows[0] || null);
        } else if (path.includes('/institute/')) {
          // Get workshops by institute
          const instituteId = path.split('/institute/')[1];
          const result = await query(
            'SELECT * FROM workshops WHERE institute_id = $1 AND is_active = true ORDER BY workshop_date, workshop_time',
            [instituteId]
          );
          return createResponse(200, result.rows);
        } else {
          // Get all active workshops
          const result = await query('SELECT * FROM workshops WHERE is_active = true ORDER BY workshop_date, workshop_time');
          return createResponse(200, result.rows);
        }

      case 'POST':
        const { institute_id, title, description, workshop_date, workshop_time, duration, price, max_participants } = JSON.parse(event.body);
        const insertResult = await query(
          `INSERT INTO workshops (institute_id, title, description, workshop_date, workshop_time, duration, price, max_participants) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [institute_id, title, description, workshop_date, workshop_time, duration, price, max_participants]
        );
        return createResponse(201, insertResult.rows[0]);

      case 'PUT':
        if (pathParameters && pathParameters.id) {
          const body = JSON.parse(event.body);
          const fields = [];
          const values = [];
          let paramCount = 1;

          Object.entries(body).forEach(([key, value]) => {
            if (value !== undefined && key !== 'id') {
              fields.push(`${key} = $${paramCount}`);
              values.push(value);
              paramCount++;
            }
          });

          if (fields.length === 0) {
            return createResponse(400, null, 'No fields to update');
          }

          values.push(pathParameters.id);
          const updateResult = await query(
            `UPDATE workshops SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
            values
          );
          return createResponse(200, updateResult.rows[0] || null);
        }
        return createResponse(400, null, 'Workshop ID required');

      case 'DELETE':
        if (pathParameters && pathParameters.id) {
          const deleteResult = await query('DELETE FROM workshops WHERE id = $1', [pathParameters.id]);
          return createResponse(200, { success: true, deleted: deleteResult.rowCount > 0 });
        }
        return createResponse(400, null, 'Workshop ID required');

      default:
        return createResponse(405, null, 'Method not allowed');
    }

  } catch (error) {
    console.error('Workshops API error:', error);
    return createResponse(500, null, error.message);
  }
};
