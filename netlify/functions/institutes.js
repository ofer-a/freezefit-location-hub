// Netlify Function for institutes API
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
          // Get single institute
          const result = await query('SELECT * FROM institutes WHERE id = $1', [pathParameters.id]);
          return createResponse(200, result.rows[0] || null);
        } else if (path.includes('/owner/')) {
          // Get institutes by owner
          const ownerId = path.split('/owner/')[1];
          const result = await query('SELECT * FROM institutes WHERE owner_id = $1', [ownerId]);
          return createResponse(200, result.rows);
        } else {
          // Get all institutes
          const result = await query('SELECT * FROM institutes ORDER BY institute_name');
          return createResponse(200, result.rows);
        }

      case 'POST':
        const { owner_id, institute_name, address, service_name, image_url } = JSON.parse(event.body);
        const insertResult = await query(
          `INSERT INTO institutes (owner_id, institute_name, address, service_name, image_url) 
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [owner_id, institute_name, address, service_name, image_url]
        );
        return createResponse(201, insertResult.rows[0]);

      case 'PUT':
        if (!pathParameters || !pathParameters.id) {
          return createResponse(400, null, 'Institute ID is required');
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
          `UPDATE institutes SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
          values
        );
        return createResponse(200, updateResult.rows[0] || null);

      case 'DELETE':
        if (!pathParameters || !pathParameters.id) {
          return createResponse(400, null, 'Institute ID is required');
        }
        const deleteResult = await query('DELETE FROM institutes WHERE id = $1', [pathParameters.id]);
        return createResponse(200, { deleted: deleteResult.rowCount > 0 });

      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Institute API error:', error);
    return createResponse(500, null, error.message);
  }
};
