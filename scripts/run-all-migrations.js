#!/usr/bin/env node

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL or NEON_DATABASE_URL not found in environment variables');
  console.error('Please check your .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runAllMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Connecting to Neon database...');
    
    // List of migrations to run in order
    const migrations = [
      'schema.sql',                    // Base schema
      'add-auth-fields.sql',          // Authentication
      'add-missing-data-tables.sql',  // Additional tables
      'add-image-storage.sql',        // Image storage support
      'add-loyalty-system.sql',       // Loyalty/rewards system
      'add-addons-system.sql',        // Add-ons system
      'add-newsletter-table.sql',     // Newsletter
      // 'data.sql' is excluded - run separately if you need sample data
    ];
    
    for (const migrationFile of migrations) {
      const migrationPath = path.join(__dirname, '../migrations', migrationFile);
      
      // Check if file exists
      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  Skipping ${migrationFile} (file not found)`);
        continue;
      }
      
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      console.log(`📊 Running migration: ${migrationFile}...`);
      
      try {
        await client.query(migrationSQL);
        console.log(`✅ ${migrationFile} completed successfully`);
      } catch (error) {
        // Some migrations might fail if already applied (e.g., column already exists)
        // We'll log the warning but continue
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate')) {
          console.log(`⚠️  ${migrationFile} - Some objects already exist (skipping)`);
        } else {
          console.error(`❌ ${migrationFile} failed:`, error.message);
          throw error;
        }
      }
    }
    
    // Verify critical tables exist
    console.log('\n🔍 Verifying database structure...');
    
    const tables = ['profiles', 'institutes', 'therapists', 'appointments', 
                   'loyalty_gifts', 'customer_loyalty', 'gallery_images'];
    
    for (const table of tables) {
      try {
        const result = await client.query(
          `SELECT COUNT(*) FROM ${table}`
        );
        console.log(`✅ ${table}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`⚠️  ${table}: Table not found or error`);
      }
    }
    
    // Verify image storage columns exist
    console.log('\n🖼️  Verifying image storage support...');
    const imageCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name IN ('image_data', 'image_mime_type')
    `);
    
    if (imageCheck.rows.length === 2) {
      console.log('✅ Image storage columns exist in profiles table');
    } else {
      console.log('⚠️  Image storage columns missing - profile images will not work');
    }
    
    console.log('\n🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runAllMigrations();

