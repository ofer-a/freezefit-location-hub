// Netlify Function for messages API
import { query, createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const { httpMethod, path, pathParameters } = event;
    
    // Extract message ID from path if pathParameters.id is not available
    let messageId = pathParameters?.id;
    if (!messageId && path.includes('/messages/') && !path.includes('/user/')) {
      const pathParts = path.split('/');
      const messagesIndex = pathParts.indexOf('messages');
      if (messagesIndex !== -1 && pathParts[messagesIndex + 1]) {
        const nextPart = pathParts[messagesIndex + 1];
        if (nextPart !== 'user') {
          messageId = nextPart;
        }
      }
    }
    
    switch (httpMethod) {
      case 'GET':
        if (path.includes('/user/')) {
          // Get messages for a user
          const userId = path.split('/user/')[1];
          const result = await query(
            `SELECT * FROM messages 
             WHERE user_id = $1 
             ORDER BY created_at DESC`,
            [userId]
          );
          return createResponse(200, result.rows);
        } else if (messageId) {
          // Get single message
          const result = await query('SELECT * FROM messages WHERE id = $1', [messageId]);
          return createResponse(200, result.rows[0] || null);
        } else {
          // Get all messages
          const result = await query('SELECT * FROM messages ORDER BY created_at DESC');
          return createResponse(200, result.rows);
        }

      case 'POST':
        const { user_id, institute_id, subject, content, sender_type, message_type, is_read } = JSON.parse(event.body);
        
        if (!user_id || !subject || !content) {
          return createResponse(400, null, 'user_id, subject, and content are required');
        }

        const insertResult = await query(
          `INSERT INTO messages (user_id, institute_id, subject, content, sender_type, message_type, is_read, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
           RETURNING *`,
          [user_id, institute_id || null, subject, content, sender_type || 'customer', message_type || 'general', is_read || false]
        );
        return createResponse(201, insertResult.rows[0]);

      case 'PUT':
        if (!messageId) {
          return createResponse(400, null, 'Message ID is required');
        }
        
        const updates = JSON.parse(event.body);
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(updates).forEach(([key, value]) => {
          if (value !== undefined && key !== 'id' && key !== 'created_at') {
            fields.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
          }
        });

        if (fields.length === 0) {
          return createResponse(400, null, 'No valid fields to update');
        }

        values.push(messageId);
        const updateResult = await query(
          `UPDATE messages SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
          values
        );
        return createResponse(200, updateResult.rows[0] || null);

      case 'DELETE':
        if (!messageId) {
          return createResponse(400, null, 'Message ID is required');
        }
        const deleteResult = await query('DELETE FROM messages WHERE id = $1', [messageId]);
        return createResponse(200, { deleted: deleteResult.rowCount > 0 });

      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Messages API error:', error);
    return createResponse(500, null, error.message);
  }
};
