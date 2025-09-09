import pkg from 'pg';
import config from '../config/index.js';
import { createLogger } from './logger.js';

const { Pool } = pkg;
const logger = createLogger('DATABASE');

// Create connection pool
const pool = new Pool({
  connectionString: config.database.url,
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.username,
  password: config.database.password,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
});

// Test database connection
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Database helper functions
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Database query error', { text, error: error.message });
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    logger.error('A client has been checked out for more than 5 seconds!');
  }, 5000);
  
  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  
  return client;
};

// Initialize database tables
export const initDatabase = async () => {
  try {
    logger.info('Initializing database tables...');
    
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'provider', 'admin')),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create institutes table
    await query(`
      CREATE TABLE IF NOT EXISTS institutes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address VARCHAR(500) NOT NULL,
        city VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
        image_url VARCHAR(500),
        services JSONB DEFAULT '[]',
        opening_hours JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        owner_id UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);');
    await query('CREATE INDEX IF NOT EXISTS idx_institutes_city ON institutes(city);');
    await query('CREATE INDEX IF NOT EXISTS idx_institutes_location ON institutes(latitude, longitude);');
    await query('CREATE INDEX IF NOT EXISTS idx_institutes_owner ON institutes(owner_id);');
    
    logger.info('Database tables initialized successfully');
    
    // Test query
    const result = await query('SELECT COUNT(*) as count FROM users;');
    logger.info(`Database connection successful. Users count: ${result.rows[0].count}`);
    
  } catch (error) {
    logger.error('Failed to initialize database', error);
    throw error;
  }
};

// Graceful shutdown
export const closeDatabase = async () => {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (error) {
    logger.error('Error closing database connection pool', error);
  }
};

export default pool;
