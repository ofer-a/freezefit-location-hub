// Netlify Function for activities API
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
          // Get activities by institute
          const instituteId = path.split('/institute/')[1];
          const limit = parseInt(event.queryStringParameters?.limit) || 20;
          
          const result = await query(
            `SELECT 
              a.*,
              p.full_name as user_name
             FROM activities a
             LEFT JOIN profiles p ON a.user_id = p.id
             WHERE a.institute_id = $1 
             ORDER BY a.created_at DESC 
             LIMIT $2`,
            [instituteId, limit]
          );
          return createResponse(200, result.rows);
        } else if (path.includes('/user/')) {
          // Get activities by user
          const userId = path.split('/user/')[1];
          const limit = parseInt(event.queryStringParameters?.limit) || 20;
          
          const result = await query(
            `SELECT 
              a.*,
              i.institute_name
             FROM activities a
             LEFT JOIN institutes i ON a.institute_id = i.id
             WHERE a.user_id = $1 
             ORDER BY a.created_at DESC 
             LIMIT $2`,
            [userId, limit]
          );
          return createResponse(200, result.rows);
        } else {
          // Get all recent activities
          const limit = parseInt(event.queryStringParameters?.limit) || 50;
          const result = await query(
            `SELECT 
              a.*,
              p.full_name as user_name,
              i.institute_name
             FROM activities a
             LEFT JOIN profiles p ON a.user_id = p.id
             LEFT JOIN institutes i ON a.institute_id = i.id
             ORDER BY a.created_at DESC 
             LIMIT $1`,
            [limit]
          );
          return createResponse(200, result.rows);
        }

      case 'POST':
        const { institute_id, user_id, activity_type, title, description, reference_id, metadata } = JSON.parse(event.body);
        
        if (!institute_id || !activity_type || !title) {
          return createResponse(400, null, 'Institute ID, activity type, and title are required');
        }

        const insertResult = await query(
          `INSERT INTO activities (institute_id, user_id, activity_type, title, description, reference_id, metadata) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [institute_id, user_id, activity_type, title, description, reference_id, metadata]
        );
        return createResponse(201, insertResult.rows[0]);

      case 'DELETE':
        if (pathParameters && pathParameters.id) {
          const deleteResult = await query('DELETE FROM activities WHERE id = $1', [pathParameters.id]);
          return createResponse(200, { success: true, deleted: deleteResult.rowCount > 0 });
        }
        return createResponse(400, null, 'Activity ID required');

      default:
        return createResponse(405, null, 'Method not allowed');
    }

  } catch (error) {
    console.error('Activities API error:', error);
    return createResponse(500, null, error.message);
  }
};
