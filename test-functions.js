#!/usr/bin/env node
// Simple test to verify Netlify functions are working

async function testFunctions() {
  const baseUrl = process.argv[2] || 'http://localhost:8888';
  
  console.log(`🧪 Testing Netlify functions at: ${baseUrl}`);
  console.log('=' .repeat(50));
  
  const endpoints = [
    '/institutes',
    '/profiles/11111111-1111-1111-1111-111111111111',
    '/appointments/user/11111111-1111-1111-1111-111111111111'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${baseUrl}/.netlify/functions${endpoint}`);
      
      const response = await fetch(`${baseUrl}/.netlify/functions${endpoint}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ SUCCESS (${response.status}):`, JSON.stringify(data, null, 2));
      } else {
        console.log(`❌ FAILED (${response.status}):`, data);
      }
    } catch (error) {
      console.log(`❌ ERROR:`, error.message);
    }
  }
}

// Check if we have fetch available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ or you can install node-fetch');
  console.log('Usage: node test-functions.js [base-url]');
  console.log('Example: node test-functions.js https://your-site.netlify.app');
  process.exit(1);
}

testFunctions().catch(console.error);
