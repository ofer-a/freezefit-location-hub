// Shared database client for Netlify Functions
import { Pool } from 'pg';

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please set DATABASE_URL in your Netlify environment variables');
}

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5, // Reduced for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const query = async (text, params) => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not configured');
  }
  
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  } finally {
    client.release();
  }
};

// Helper function for API responses
export const createResponse = (statusCode, data, error = null) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify({ data, error, success: !error })
  };
};

// Handle CORS preflight
export const handleCORS = () => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: ''
  };
};
