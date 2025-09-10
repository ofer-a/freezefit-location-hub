// Debug function to check if environment variables are configured
// IMPORTANT: This only checks if variables exist, NOT their values (for security)

import { createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  if (event.httpMethod !== 'GET') {
    return createResponse(405, null, 'Method not allowed');
  }

  try {
    // Check if environment variables are set (WITHOUT revealing their values)
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      BREVO_API_KEY: !!process.env.BREVO_API_KEY,
      NODE_ENV: process.env.NODE_ENV || 'not set',
      SITE_URL: !!process.env.SITE_URL,
      
      // Show partial info for debugging (safe)
      database_configured: process.env.DATABASE_URL ? 'postgresql://***' : 'NOT SET',
      brevo_configured: process.env.BREVO_API_KEY ? 
        (process.env.BREVO_API_KEY.startsWith('xkeysib-') ? 'xkeysib-***' : 'INVALID FORMAT') : 
        'NOT SET',
      
      // System info
      function_region: process.env.AWS_REGION || 'unknown',
      nodejs_version: process.version,
      timestamp: new Date().toISOString()
    };

    return createResponse(200, {
      status: 'Environment check completed',
      configured_variables: envCheck,
      recommendations: {
        missing_vars: Object.entries(envCheck)
          .filter(([key, value]) => key.endsWith('_configured') && value === 'NOT SET')
          .map(([key]) => key.replace('_configured', '').toUpperCase()),
        
        all_good: Object.values(envCheck).slice(0, 5).every(val => val === true),
        
        next_steps: envCheck.DATABASE_URL && envCheck.JWT_SECRET && envCheck.BREVO_API_KEY 
          ? 'All variables configured! Check function logs for other issues.'
          : 'Add missing environment variables to Netlify dashboard'
      }
    });

  } catch (error) {
    console.error('Environment check error:', error);
    return createResponse(500, null, `Environment check failed: ${error.message}`);
  }
};
