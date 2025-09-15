// Netlify Function for institute coordinates API
import { query, createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const { httpMethod, path, pathParameters } = event;
    
    // Extract institute ID from path
    let instituteId = pathParameters?.id;
    if (!instituteId && path.includes('/coordinates/')) {
      const pathParts = path.split('/');
      const coordinatesIndex = pathParts.indexOf('coordinates');
      if (coordinatesIndex !== -1 && pathParts[coordinatesIndex + 1]) {
        instituteId = pathParts[coordinatesIndex + 1];
      }
    }
    
    switch (httpMethod) {
      case 'GET':
        if (instituteId) {
          // Get coordinates for specific institute
          const result = await query(
            'SELECT * FROM institute_coordinates WHERE institute_id = $1', 
            [instituteId]
          );
          return createResponse(200, result.rows[0] || null);
        } else {
          // Get all coordinates
          const result = await query('SELECT * FROM institute_coordinates');
          return createResponse(200, result.rows);
        }

      case 'POST':
        const { institute_id, latitude, longitude, address_verified } = JSON.parse(event.body);
        const insertResult = await query(
          `INSERT INTO institute_coordinates (institute_id, latitude, longitude, address_verified) 
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [institute_id, latitude, longitude, address_verified || false]
        );
        return createResponse(201, insertResult.rows[0]);

      case 'PUT':
        if (!instituteId) {
          return createResponse(400, null, 'Institute ID is required');
        }
        const updates = JSON.parse(event.body);
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(updates).forEach(([key, value]) => {
          if (value !== undefined && key !== 'id' && key !== 'institute_id' && key !== 'created_at' && key !== 'updated_at') {
            fields.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
          }
        });

        if (fields.length === 0) {
          return createResponse(400, null, 'No valid fields to update');
        }

        values.push(instituteId);
        const updateResult = await query(
          `UPDATE institute_coordinates SET ${fields.join(', ')}, updated_at = NOW() WHERE institute_id = $${paramCount} RETURNING *`,
          values
        );
        return createResponse(200, updateResult.rows[0] || null);

      case 'DELETE':
        if (!instituteId) {
          return createResponse(400, null, 'Institute ID is required');
        }
        const deleteResult = await query('DELETE FROM institute_coordinates WHERE institute_id = $1', [instituteId]);
        return createResponse(200, { deleted: deleteResult.rowCount > 0 });

      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Coordinates API error:', error);
    return createResponse(500, null, error.message);
  }
};
