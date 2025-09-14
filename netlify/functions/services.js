// Netlify Function for services API
import { query, createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const { httpMethod, path, pathParameters, queryStringParameters } = event;
    
    // Extract service ID from path if pathParameters.id is not available
    let serviceId = pathParameters?.id;
    if (!serviceId && path.includes('/services/') && !path.includes('/institute/')) {
      serviceId = path.split('/services/')[1];
    }
    
    switch (httpMethod) {
      case 'GET':
        if (path.includes('/institute/')) {
          // Get services by institute with optional type filter
          const instituteId = path.split('/institute/')[1];
          
          // Parse query parameters from event
          const type = queryStringParameters?.type || null;
          
          let sqlQuery, queryParams;
          
          if (type) {
            sqlQuery = 'SELECT * FROM services WHERE institute_id = $1 AND type = $2 ORDER BY name';
            queryParams = [instituteId, type];
          } else {
            sqlQuery = 'SELECT * FROM services WHERE institute_id = $1 ORDER BY name';
            queryParams = [instituteId];
          }
          
          const result = await query(sqlQuery, queryParams);
          return createResponse(200, result.rows);
        } else if (serviceId) {
          // Get single service
          const result = await query('SELECT * FROM services WHERE id = $1', [serviceId]);
          return createResponse(200, result.rows[0] || null);
        } else {
          // Get all services
          const result = await query('SELECT * FROM services ORDER BY name');
          return createResponse(200, result.rows);
        }

      case 'POST':
        const { institute_id, name, description, price, duration, type } = JSON.parse(event.body);
        const insertResult = await query(
          `INSERT INTO services (institute_id, name, description, price, duration, type) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [institute_id, name, description, price, duration, type || 'service']
        );
        return createResponse(201, insertResult.rows[0]);

      case 'PUT':
        if (!serviceId) {
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

        values.push(serviceId);
        const updateResult = await query(
          `UPDATE services SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
          values
        );
        return createResponse(200, updateResult.rows[0] || null);

      case 'DELETE':
        if (!serviceId) {
          return createResponse(400, null, 'Service ID is required');
        }
        const deleteResult = await query('DELETE FROM services WHERE id = $1', [serviceId]);
        return createResponse(200, { deleted: deleteResult.rowCount > 0 });

      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Service API error:', error);
    return createResponse(500, null, error.message);
  }
};
