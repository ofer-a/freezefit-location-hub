import { Pool } from 'pg';

// Database connection pool
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  const pool = getPool();

  try {
    const { httpMethod, path } = event;
    const pathParts = path.split('/').filter(Boolean);

    // GET /messages/user/:userId - Get messages for a user
    if (httpMethod === 'GET' && pathParts[1] === 'user' && pathParts[2]) {
      const userId = pathParts[2];
      
      const result = await pool.query(
        `SELECT * FROM messages 
         WHERE user_id = $1 
         ORDER BY created_at DESC`,
        [userId]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: result.rows
        }),
      };
    }

    // POST /messages - Create a new message
    if (httpMethod === 'POST') {
      const { user_id, institute_id, subject, content, sender_type } = JSON.parse(event.body);

      if (!user_id || !subject || !content) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'user_id, subject, and content are required',
            success: false 
          }),
        };
      }

      const result = await pool.query(
        `INSERT INTO messages (user_id, institute_id, subject, content, sender_type, is_read, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, false, NOW(), NOW()) 
         RETURNING *`,
        [user_id, institute_id || null, subject, content, sender_type || 'customer']
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          data: result.rows[0]
        }),
      };
    }

    // PUT /messages/:id/read - Mark message as read
    if (httpMethod === 'PUT' && pathParts[2] === 'read') {
      const messageId = pathParts[1];
      
      const result = await pool.query(
        `UPDATE messages 
         SET is_read = true, updated_at = NOW() 
         WHERE id = $1 
         RETURNING *`,
        [messageId]
      );

      if (result.rows.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'Message not found',
            success: false 
          }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: result.rows[0]
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };

  } catch (error) {
    console.error('Messages function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        success: false 
      }),
    };
  }
};
