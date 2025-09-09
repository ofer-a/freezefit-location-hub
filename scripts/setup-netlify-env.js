#!/usr/bin/env node
import 'dotenv/config';
import { execSync } from 'child_process';
import fs from 'fs';

async function setupNetlifyEnv() {
  console.log('🚀 Setting up Netlify Environment Variables\n');

  // Check if netlify CLI is logged in
  try {
    execSync('netlify status', { stdio: 'pipe' });
    console.log('✅ Netlify CLI is authenticated\n');
  } catch (error) {
    console.log('❌ Netlify CLI not authenticated');
    console.log('🔧 Please run: netlify login');
    console.log('   Then run this script again\n');
    return;
  }

  // Production environment variables
  const productionVars = {
    'DATABASE_URL': process.env.DATABASE_URL,
    'JWT_SECRET': process.env.JWT_SECRET,
    'NODE_ENV': 'production',
    'BREVO_API_KEY': process.env.BREVO_API_KEY,
    'BREVO_LIST_ID': process.env.BREVO_LIST_ID
  };

  console.log('📋 Environment Variables to Set:');
  console.log('================================\n');

  for (const [key, value] of Object.entries(productionVars)) {
    if (!value || value.includes('your_') || value.includes('localhost')) {
      console.log(`⚠️  ${key}: Not set or needs production value`);
    } else {
      console.log(`✅ ${key}: Ready (${value.substring(0, 20)}...)`);
    }
  }

  console.log('\n🔧 Setting environment variables in Netlify...\n');

  // Set each environment variable
  for (const [key, value] of Object.entries(productionVars)) {
    if (value && !value.includes('your_') && !value.includes('localhost')) {
      try {
        // For production, adjust certain values
        let prodValue = value;
        if (key === 'NODE_ENV') {
          prodValue = 'production';
        }

        const command = `netlify env:set ${key} "${prodValue}"`;
        execSync(command, { stdio: 'pipe' });
        console.log(`✅ Set ${key}`);
      } catch (error) {
        console.log(`❌ Failed to set ${key}: ${error.message}`);
      }
    } else {
      console.log(`⚠️  Skipped ${key}: Value not ready`);
    }
  }

  console.log('\n📊 Verifying environment variables...\n');

  try {
    const result = execSync('netlify env:list', { encoding: 'utf8' });
    console.log(result);
  } catch (error) {
    console.log('❌ Could not verify environment variables');
  }

  console.log('\n🎉 Environment setup complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Deploy your site: netlify deploy --prod');
  console.log('2. Test your live site functionality');
  console.log('3. Check function logs: netlify functions:list');
}

// Manual setup instructions if automated setup fails
function showManualInstructions() {
  console.log('\n📋 Manual Setup Instructions');
  console.log('============================\n');
  console.log('If the automated setup fails, manually add these in Netlify UI:');
  console.log('Go to: Site settings → Environment variables\n');

  const vars = [
    { key: 'DATABASE_URL', value: process.env.DATABASE_URL, description: 'Neon database connection' },
    { key: 'JWT_SECRET', value: process.env.JWT_SECRET, description: 'Authentication secret' },
    { key: 'NODE_ENV', value: 'production', description: 'Environment mode' },
    { key: 'BREVO_API_KEY', value: process.env.BREVO_API_KEY, description: 'Email service API key' },
    { key: 'BREVO_LIST_ID', value: process.env.BREVO_LIST_ID, description: 'Email list ID' }
  ];

  vars.forEach(variable => {
    if (variable.value && !variable.value.includes('your_')) {
      console.log(`${variable.key}=${variable.value}`);
      console.log(`  └─ ${variable.description}\n`);
    } else {
      console.log(`${variable.key}=<MISSING>`);
      console.log(`  └─ ${variable.description} (NEEDS TO BE SET)\n`);
    }
  });
}

// Run the setup
setupNetlifyEnv().catch(error => {
  console.error('❌ Setup failed:', error.message);
  showManualInstructions();
});
