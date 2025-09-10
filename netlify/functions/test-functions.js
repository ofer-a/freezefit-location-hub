// Test multiple functions and send welcome email
import { createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const testResults = {
      timestamp: new Date().toISOString(),
      function_region: process.env.AWS_REGION || 'unknown',
      nodejs_version: process.version
    };

    // Test environment variables
    testResults.environment = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      BREVO_API_KEY: !!process.env.BREVO_API_KEY,
      NODE_ENV: process.env.NODE_ENV || 'not set',
      brevo_format: process.env.BREVO_API_KEY ? 
        (process.env.BREVO_API_KEY.startsWith('xkeysib-') ? 'valid format' : 'invalid format') : 
        'not set'
    };

    // If it's a POST request, try to send welcome email
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const email = body.email || 'john@softulla.com';
      const name = body.name || 'John';
      const role = body.role || 'customer';

      const BREVO_API_KEY = process.env.BREVO_API_KEY;
      
      if (!BREVO_API_KEY || BREVO_API_KEY === 'your_brevo_api_key_here') {
        testResults.email_test = {
          success: false,
          error: 'BREVO_API_KEY not configured',
          recipient: email
        };
      } else {
        try {
          // Send welcome email
          const welcomeContent = {
            subject: '🎉 ברוכים הבאים ל-FreezeFit! (TEST)',
            htmlContent: `
              <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #ffeaa7;">
                    <p style="margin: 0; color: #856404; font-weight: bold;">🧪 זהו אימייל בדיקה - TEST EMAIL</p>
                  </div>
                  
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0066cc; margin-bottom: 10px;">ברוכים הבאים ל-FreezeFit! 🧊</h1>
                    <p style="font-size: 18px; color: #666;">היי ${name}!</p>
                  </div>
                  
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h2 style="color: #0066cc; margin-top: 0;">🎊 בדיקת מערכת אימייל</h2>
                    <p>אנחנו בודקים שהמערכת עובדת כראוי. אם אתה מקבל את המייל הזה, זה אומר שהכל עובד!</p>
                    <ul style="padding-right: 20px;">
                      <li>✅ Netlify Functions פועלות</li>
                      <li>✅ Brevo API מחובר</li>
                      <li>✅ Environment Variables מוגדרות</li>
                      <li>✅ אימיילי ברכה יעבדו</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.SITE_URL || 'https://freezefit.netlify.app'}/find-institute" 
                       style="background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                      🔍 מצא מכון טיפול
                    </a>
                  </div>
                  
                  <div style="border-top: 2px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
                    <p>זהו אימייל בדיקה טכנית. צוות FreezeFit 💙</p>
                  </div>
                </div>
              </div>
            `
          };

          const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
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
                email: email,
                name: name
              }],
              subject: welcomeContent.subject,
              htmlContent: welcomeContent.htmlContent,
              tags: ['test-email', 'function-test', `role-${role}`]
            })
          });

          if (emailResponse.ok) {
            const emailResult = await emailResponse.json();
            testResults.email_test = {
              success: true,
              message: `Test email sent to ${email}`,
              recipient: email,
              name: name,
              role: role,
              brevo_message_id: emailResult.messageId
            };
          } else {
            const errorText = await emailResponse.text();
            testResults.email_test = {
              success: false,
              error: 'Brevo API error',
              details: `${emailResponse.status}: ${errorText}`,
              recipient: email
            };
          }
        } catch (emailError) {
          testResults.email_test = {
            success: false,
            error: 'Email sending failed',
            details: emailError.message,
            recipient: email
          };
        }
      }
    }

    // Add summary
    testResults.summary = {
      all_env_vars_set: testResults.environment.DATABASE_URL && 
                       testResults.environment.JWT_SECRET && 
                       testResults.environment.BREVO_API_KEY,
      functions_working: true,
      email_configured: testResults.environment.BREVO_API_KEY && 
                       testResults.environment.brevo_format === 'valid format',
      ready_for_production: testResults.environment.DATABASE_URL && 
                           testResults.environment.JWT_SECRET && 
                           testResults.environment.BREVO_API_KEY
    };

    return createResponse(200, {
      status: 'Function test completed',
      results: testResults,
      instructions: {
        GET: 'Returns environment status',
        POST: 'Sends test email (include email, name, role in body)'
      }
    });

  } catch (error) {
    console.error('Test functions error:', error);
    return createResponse(500, {
      success: false,
      error: 'Test failed',
      details: error.message
    });
  }
};
