#!/usr/bin/env node
// Production Health Check for Netlify Functions

const FUNCTIONS_TO_TEST = [
  '/auth/login',
  '/newsletter', 
  '/institutes',
  '/appointments/user/11111111-1111-1111-1111-111111111111',
  '/profiles/11111111-1111-1111-1111-111111111111',
  '/reviews/institute/aaaaaaaa-1111-1111-1111-111111111111',
  '/messages/user/11111111-1111-1111-1111-111111111111'
];

async function healthCheck(baseUrl = 'https://your-site.netlify.app') {
  console.log('🏥 Production Health Check for Netlify Functions');
  console.log('================================================\n');
  
  const results = [];
  
  for (const endpoint of FUNCTIONS_TO_TEST) {
    console.log(`🔍 Testing: ${baseUrl}/.netlify/functions${endpoint}`);
    
    try {
      const response = await fetch(`${baseUrl}/.netlify/functions${endpoint}`, {
        method: endpoint === '/auth/login' ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: endpoint === '/auth/login' ? JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        }) : undefined
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { text };
      }
      
      const result = {
        endpoint,
        status: response.status,
        ok: response.ok,
        data: data,
        error: !response.ok ? `HTTP ${response.status}` : null
      };
      
      results.push(result);
      
      if (response.ok) {
        console.log(`✅ ${response.status} - OK`);
      } else {
        console.log(`❌ ${response.status} - ${response.statusText}`);
        console.log(`   Error: ${text.substring(0, 100)}...`);
      }
      
    } catch (error) {
      const result = {
        endpoint,
        status: 0,
        ok: false,
        data: null,
        error: error.message
      };
      
      results.push(result);
      console.log(`💥 FAILED - ${error.message}`);
    }
    
    console.log('');
  }
  
  // Summary
  console.log('📊 SUMMARY:');
  console.log('===========');
  
  const working = results.filter(r => r.ok).length;
  const total = results.length;
  
  console.log(`✅ Working: ${working}/${total}`);
  console.log(`❌ Failed: ${total - working}/${total}`);
  
  if (working === total) {
    console.log('\n🎉 All functions are healthy!');
  } else {
    console.log('\n⚠️  Some functions have issues:');
    results.filter(r => !r.ok).forEach(r => {
      console.log(`   - ${r.endpoint}: ${r.error}`);
    });
  }
  
  return results;
}

// Export for use or run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const baseUrl = process.argv[2] || 'https://your-site.netlify.app';
  healthCheck(baseUrl).catch(console.error);
}

export default healthCheck;
