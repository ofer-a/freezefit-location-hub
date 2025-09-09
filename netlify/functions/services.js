// Netlify Function for services API
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
          // Get single service
          const result = await query('SELECT * FROM services WHERE id = $1', [pathParameters.id]);
          return createResponse(200, result.rows[0] || null);
        } else if (path.includes('/institute/')) {
          // Get services by institute
          const instituteId = path.split('/institute/')[1];
          const result = await query('SELECT * FROM services WHERE institute_id = $1 ORDER BY name', [instituteId]);
          return createResponse(200, result.rows);
        } else {
          // Get all services
          const result = await query('SELECT * FROM services ORDER BY name');
          return createResponse(200, result.rows);
        }

      case 'POST':
        const { institute_id, name, description, price, duration } = JSON.parse(event.body);
        const insertResult = await query(
          `INSERT INTO services (institute_id, name, description, price, duration) 
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [institute_id, name, description, price, duration]
        );
        return createResponse(201, insertResult.rows[0]);

      case 'PUT':
        if (!pathParameters || !pathParameters.id) {
          return createResponse(400, null, 'Service ID is required');
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

        values.push(pathParameters.id);
        const updateResult = await query(
          `UPDATE services SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
          values
        );
        return createResponse(200, updateResult.rows[0] || null);

      case 'DELETE':
        if (!pathParameters || !pathParameters.id) {
          return createResponse(400, null, 'Service ID is required');
        }
        const deleteResult = await query('DELETE FROM services WHERE id = $1', [pathParameters.id]);
        return createResponse(200, { deleted: deleteResult.rowCount > 0 });

      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Service API error:', error);
    return createResponse(500, null, error.message);
  }
};
