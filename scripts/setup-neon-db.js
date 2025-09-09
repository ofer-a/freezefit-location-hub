#!/usr/bin/env node

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = 'postgresql://neondb_owner:npg_im61ZIwxsjWn@ep-rapid-night-agzgtgcn-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Connecting to Neon database...');
    
    // Read and execute schema migration
    const schemaPath = path.join(__dirname, '../migrations/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📊 Creating database schema...');
    await client.query(schemaSQL);
    console.log('✅ Schema created successfully');
    
    // Read and execute data migration
    const dataPath = path.join(__dirname, '../migrations/data.sql');
    const dataSQL = fs.readFileSync(dataPath, 'utf8');
    
    console.log('📦 Inserting sample data...');
    await client.query(dataSQL);
    console.log('✅ Sample data inserted successfully');
    
    // Verify the migration
    const result = await client.query('SELECT COUNT(*) FROM institutes');
    console.log(`🏢 Total institutes: ${result.rows[0].count}`);
    
    const therapistResult = await client.query('SELECT COUNT(*) FROM therapists');
    console.log(`👨‍⚕️ Total therapists: ${therapistResult.rows[0].count}`);
    
    const appointmentResult = await client.query('SELECT COUNT(*) FROM appointments');
    console.log(`📅 Total appointments: ${appointmentResult.rows[0].count}`);
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
