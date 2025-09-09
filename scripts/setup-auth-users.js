#!/usr/bin/env node

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = 'postgresql://neondb_owner:npg_im61ZIwxsjWn@ep-rapid-night-agzgtgcn-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupAuthUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Connecting to Neon database...');
    
    // Add password_hash column if it doesn't exist
    console.log('📊 Adding authentication fields...');
    await client.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)');
    
    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role)');
    
    console.log('✅ Database schema updated');
    
    // Hash passwords for demo users
    const customerPassword = await bcrypt.hash('123456', 10);
    const providerPassword = await bcrypt.hash('123456', 10);
    
    // Update existing profiles with hashed passwords
    console.log('👥 Setting up demo users...');
    
    // Update customer users
    const customerUsers = [
      { id: '11111111-1111-1111-1111-111111111111', email: 'avi.cohen@example.com', name: 'אבי כהן' },
      { id: '22222222-2222-2222-2222-222222222222', email: 'sara.levi@example.com', name: 'שרה לוי' },
      { id: '33333333-3333-3333-3333-333333333333', email: 'dan.golan@example.com', name: 'דן גולן' },
      { id: '44444444-4444-4444-4444-444444444444', email: 'yossi.cohen@example.com', name: 'יוסי כהן' },
      { id: '55555555-5555-5555-5555-555555555555', email: 'rachel.david@example.com', name: 'רחל דוד' }
    ];
    
    // Update provider users
    const providerUsers = [
      { id: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', email: 'owner.cryostem@example.com', name: 'מנהל מרכז קריוסטיים' },
      { id: 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', email: 'owner.cryoplus@example.com', name: 'מנהל קריו פלוס' },
      { id: 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', email: 'owner.icefit@example.com', name: 'מנהל אייס פיט' },
      { id: 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaaa', email: 'owner.cryojer@example.com', name: 'מנהל קריו ירושלים' },
      { id: 'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaaa', email: 'owner.haifacryo@example.com', name: 'מנהל חיפה קריותרפי' },
      { id: 'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaaa', email: 'owner.northcryo@example.com', name: 'מנהל צפון קריו' }
    ];
    
    // Update customer users with passwords
    for (const user of customerUsers) {
      await client.query(
        'UPDATE profiles SET password_hash = $1 WHERE id = $2',
        [customerPassword, user.id]
      );
    }
    
    // Update provider users with passwords
    for (const user of providerUsers) {
      await client.query(
        'UPDATE profiles SET password_hash = $1 WHERE id = $2',
        [providerPassword, user.id]
      );
    }
    
    console.log('✅ Demo users updated with authentication');
    
    // Create additional easy-to-remember demo users
    console.log('👤 Creating easy demo users...');
    
    const easyDemoUsers = [
      {
        email: 'customer@demo.com',
        full_name: 'לקוח לדוגמה',
        role: 'customer',
        password: customerPassword
      },
      {
        email: 'provider@demo.com',
        full_name: 'ספק שירות לדוגמה',
        role: 'provider',
        password: providerPassword
      }
    ];
    
    for (const user of easyDemoUsers) {
      try {
        await client.query(
          `INSERT INTO profiles (email, full_name, role, password_hash) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (email) DO UPDATE SET 
           password_hash = EXCLUDED.password_hash,
           updated_at = NOW()`,
          [user.email, user.full_name, user.role, user.password]
        );
      } catch (error) {
        console.log(`User ${user.email} might already exist, updating password...`);
      }
    }
    
    console.log('✅ Easy demo users created/updated');
    
    // Display login credentials
    console.log('\n🔐 Demo Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Customer Login:');
    console.log('   Email: customer@demo.com');
    console.log('   Password: 123456');
    console.log('');
    console.log('📧 Provider Login:');
    console.log('   Email: provider@demo.com');
    console.log('   Password: 123456');
    console.log('');
    console.log('📧 Other Customer Examples:');
    console.log('   Email: avi.cohen@example.com');
    console.log('   Email: sara.levi@example.com');
    console.log('   Password: 123456 (for all)');
    console.log('');
    console.log('📧 Provider Examples:');
    console.log('   Email: owner.cryostem@example.com');
    console.log('   Email: owner.cryoplus@example.com');
    console.log('   Password: 123456 (for all)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('🎉 Authentication setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupAuthUsers();
