// Netlify Function for messages API
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
          // Get single message
          const result = await query('SELECT * FROM messages WHERE id = $1', [pathParameters.id]);
          return createResponse(200, result.rows[0] || null);
        } else if (path.includes('/user/')) {
          // Get messages by user
          const userId = path.split('/user/')[1];
          const result = await query(
            'SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
          );
          return createResponse(200, result.rows);
        } else {
          // Get all messages
          const result = await query('SELECT * FROM messages ORDER BY created_at DESC');
          return createResponse(200, result.rows);
        }

      case 'POST':
        const { user_id, institute_id, sender_type, message_type, subject, content, is_read } = JSON.parse(event.body);
        const insertResult = await query(
          `INSERT INTO messages (user_id, institute_id, sender_type, message_type, subject, content, is_read) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [user_id, institute_id, sender_type, message_type, subject, content, is_read || false]
        );
        return createResponse(201, insertResult.rows[0]);

      case 'PUT':
        if (!pathParameters || !pathParameters.id) {
          return createResponse(400, null, 'Message ID is required');
        }
        
        if (path.includes('/read')) {
          // Mark message as read
          const updateResult = await query(
            'UPDATE messages SET is_read = true, updated_at = NOW() WHERE id = $1 RETURNING *',
            [pathParameters.id]
          );
          return createResponse(200, updateResult.rows[0] || null);
        } else {
          // Update message
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
            `UPDATE messages SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
            values
          );
          return createResponse(200, updateResult.rows[0] || null);
        }

      case 'DELETE':
        if (!pathParameters || !pathParameters.id) {
          return createResponse(400, null, 'Message ID is required');
        }
        const deleteResult = await query('DELETE FROM messages WHERE id = $1', [pathParameters.id]);
        return createResponse(200, { deleted: deleteResult.rowCount > 0 });

      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Message API error:', error);
    return createResponse(500, null, error.message);
  }
};
