#!/usr/bin/env node
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupNewsletter() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔄 Setting up newsletter database...');
    
    // Read and execute the newsletter migration
    const migrationPath = path.join(__dirname, '../migrations/add-newsletter-table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    console.log('✅ Newsletter table created successfully');
    
    // Verify the table was created
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'newsletter_subscribers' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Newsletter table structure:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    // Check existing subscribers
    const subscribersResult = await pool.query('SELECT COUNT(*) as count FROM newsletter_subscribers');
    console.log(`📧 Current subscribers: ${subscribersResult.rows[0].count}`);
    
    console.log('\n🎉 Newsletter setup complete!');
    console.log('\n📖 Next steps:');
    console.log('1. Choose an email service from EMAIL-SERVICES.md');
    console.log('2. Add API keys to your .env file');
    console.log('3. Test the newsletter subscription on your homepage');
    
  } catch (error) {
    console.error('❌ Newsletter setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupNewsletter().catch(console.error);
