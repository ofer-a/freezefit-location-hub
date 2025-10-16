// Netlify Function for therapists API
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
        if (path.includes('/institute/')) {
          // Get therapists by institute
          const includeInactive = path.includes('/include-inactive');
          let instituteId;
          
          if (includeInactive) {
            // Extract institute ID from path like /institute/123/include-inactive
            instituteId = path.split('/institute/')[1].split('/include-inactive')[0];
          } else {
            instituteId = path.split('/institute/')[1];
          }
          
          let queryStr = 'SELECT * FROM therapists WHERE institute_id = $1';
          let params = [instituteId];
          
          if (!includeInactive) {
            queryStr += ' AND is_active = true';
          }
          
          queryStr += ' ORDER BY is_active DESC, name';
          
          const result = await query(queryStr, params);
          return createResponse(200, result.rows);
        } else if (pathParameters && pathParameters.id) {
          // Get single therapist
          const result = await query('SELECT * FROM therapists WHERE id = $1', [pathParameters.id]);
          return createResponse(200, result.rows[0] || null);
        } else {
          // Get all therapists
          const result = await query('SELECT * FROM therapists ORDER BY name');
          return createResponse(200, result.rows);
        }

      case 'POST':
        const { institute_id, name, experience, certification, additional_certification, bio, image_url, is_active } = JSON.parse(event.body);
        const insertResult = await query(
          `INSERT INTO therapists (institute_id, name, experience, certification, additional_certification, bio, image_url, is_active) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [institute_id, name, experience, certification, additional_certification, bio, image_url, is_active !== undefined ? is_active : true]
        );
        return createResponse(201, insertResult.rows[0]);

      case 'PUT':
        let updateTherapistId = pathParameters?.id;
        if (!updateTherapistId && path) {
          const pathParts = path.split('/');
          updateTherapistId = pathParts[pathParts.length - 1];
        }
        
        if (!updateTherapistId) {
          return createResponse(400, null, 'Therapist ID is required');
        }
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

        values.push(updateTherapistId);
        const updateResult = await query(
          `UPDATE therapists SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
          values
        );
        return createResponse(200, updateResult.rows[0] || null);

      case 'DELETE':
        // Extract ID from path if pathParameters.id is not available
        let therapistId = pathParameters?.id;
        if (!therapistId && path) {
          const pathParts = path.split('/');
          therapistId = pathParts[pathParts.length - 1];
        }
        
        if (!therapistId) {
          return createResponse(400, null, 'Therapist ID is required');
        }
        
        // Since appointments are not linked to specific therapists in the current system,
        // we can safely delete therapists without checking for appointments
        const deleteResult = await query('DELETE FROM therapists WHERE id = $1', [therapistId]);
        return createResponse(200, { 
          deleted: deleteResult.rowCount > 0,
          hasAppointments: false,
          message: deleteResult.rowCount > 0 ? 'Therapist deleted successfully' : 'Therapist not found'
        });

      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Therapist API error:', error);
    return createResponse(500, null, error.message);
  }
};
