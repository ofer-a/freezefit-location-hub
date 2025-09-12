// Netlify Function for business hours API
import { query, createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const { httpMethod, path, pathParameters } = event;
    
    // Extract ID from path if not in pathParameters
    let businessHoursId = pathParameters?.id;
    if (!businessHoursId && path.includes('/business-hours/')) {
      const pathParts = path.split('/');
      const businessHoursIndex = pathParts.indexOf('business-hours');
      if (businessHoursIndex !== -1 && pathParts[businessHoursIndex + 1]) {
        // Only extract as businessHoursId if it's not a special path like /institute/
        const nextPart = pathParts[businessHoursIndex + 1];
        if (nextPart !== 'institute') {
          businessHoursId = nextPart;
        }
      }
    }
    
    switch (httpMethod) {
      case 'GET':
        if (path.includes('/institute/')) {
          // Get business hours by institute
          const instituteId = path.split('/institute/')[1];
          const result = await query('SELECT * FROM business_hours WHERE institute_id = $1 ORDER BY day_of_week', [instituteId]);
          return createResponse(200, result.rows);
        } else if (businessHoursId) {
          // Get single business hour entry
          const result = await query('SELECT * FROM business_hours WHERE id = $1', [businessHoursId]);
          return createResponse(200, result.rows[0] || null);
        } else {
          // Get all business hours
          const result = await query('SELECT * FROM business_hours ORDER BY institute_id, day_of_week');
          return createResponse(200, result.rows);
        }

      case 'POST':
        const { institute_id, day_of_week, open_time, close_time, is_open } = JSON.parse(event.body);
        const insertResult = await query(
          `INSERT INTO business_hours (institute_id, day_of_week, open_time, close_time, is_open) 
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [institute_id, day_of_week, open_time, close_time, is_open]
        );
        return createResponse(201, insertResult.rows[0]);

      case 'PUT':
        if (!businessHoursId) {
          return createResponse(400, null, 'Business hours ID is required');
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

        values.push(businessHoursId);
        const updateResult = await query(
          `UPDATE business_hours SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
          values
        );
        return createResponse(200, updateResult.rows[0] || null);

      case 'DELETE':
        if (!businessHoursId) {
          return createResponse(400, null, 'Business hours ID is required');
        }
        const deleteResult = await query('DELETE FROM business_hours WHERE id = $1', [businessHoursId]);
        return createResponse(200, { deleted: deleteResult.rowCount > 0 });

      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Business hours API error:', error);
    return createResponse(500, null, error.message);
  }
};
