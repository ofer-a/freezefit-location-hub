// Simple email test function - sends welcome email to john@softulla.com
import { createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  if (event.httpMethod !== 'POST') {
    return createResponse(405, null, 'Use POST to send test email');
  }

  try {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    
    // Check if API key is configured
    if (!BREVO_API_KEY) {
      return createResponse(400, {
        success: false,
        error: 'BREVO_API_KEY not configured in environment variables',
        missing_variables: ['BREVO_API_KEY'],
        instructions: 'Add the BREVO_API_KEY environment variable in Netlify Dashboard → Site Settings → Environment Variables',
        needed_vars: {
          BREVO_API_KEY: 'Get from NETLIFY-ENV-SETUP.md file',
          DATABASE_URL: 'Get from NETLIFY-ENV-SETUP.md file', 
          JWT_SECRET: 'Get from NETLIFY-ENV-SETUP.md file',
          NODE_ENV: 'Set to "production"'
        }
      });
    }

    // Send test email to john@softulla.com
    const emailContent = {
      subject: '🎉 FreezeFit Email Test - Success!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #c3e6cb;">
            <h2 style="margin: 0; color: #155724;">✅ Email Test Successful!</h2>
          </div>
          
          <p>Hi John,</p>
          
          <p>This is a test email from your FreezeFit application. If you're receiving this email, it means:</p>
          
          <ul>
            <li>✅ Netlify Functions are working</li>
            <li>✅ Brevo API is properly configured</li>
            <li>✅ Environment variables are set correctly</li>
            <li>✅ Welcome emails will work for new user registrations</li>
          </ul>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #0066cc; margin-top: 0;">Next Steps:</h3>
            <p>Your welcome email system is ready! New users will automatically receive welcome emails when they register.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://freezefit.netlify.app" 
               style="background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Visit FreezeFit
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
            <p>FreezeFit Email System Test</p>
          </div>
        </div>
      `
    };

    // Send email via Brevo
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: 'FreezeFit Test',
          email: 'welcome@freezefit.com'
        },
        to: [{
          email: 'john@softulla.com',
          name: 'John'
        }],
        subject: emailContent.subject,
        htmlContent: emailContent.htmlContent,
        tags: ['email-test']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return createResponse(400, {
        success: false,
        error: `Brevo API error: ${response.status}`,
        details: errorText
      });
    }

    const result = await response.json();

    return createResponse(200, {
      success: true,
      message: 'Test email sent successfully to john@softulla.com',
      email_sent_to: 'john@softulla.com',
      brevo_message_id: result.messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Email test error:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};
