// Test function to send welcome email directly
import { createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  if (event.httpMethod !== 'POST') {
    return createResponse(405, null, 'Method not allowed - use POST');
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { email, name, role } = body;

    // Default values if not provided
    const testEmail = email || 'john@softulla.com';
    const testName = name || 'John';
    const testRole = role || 'customer';

    console.log(`Testing welcome email for: ${testEmail}`);

    // Check if Brevo API key is configured
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    
    if (!BREVO_API_KEY || BREVO_API_KEY === 'your_brevo_api_key_here') {
      return createResponse(400, {
        success: false,
        error: 'BREVO_API_KEY not configured in environment variables',
        details: 'Email service is not set up'
      });
    }

    // Welcome email content based on user role
    const welcomeContent = {
      customer: {
        subject: '🎉 ברוכים הבאים ל-FreezeFit! (TEST)',
        htmlContent: `
          <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #ffeaa7;">
                <p style="margin: 0; color: #856404; font-weight: bold;">🧪 זהו אימייל בדיקה - TEST EMAIL</p>
              </div>
              
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0066cc; margin-bottom: 10px;">ברוכים הבאים ל-FreezeFit! 🧊</h1>
                <p style="font-size: 18px; color: #666;">היי ${testName}!</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h2 style="color: #0066cc; margin-top: 0;">🎊 ההרשמה הושלמה בהצלחה!</h2>
                <p>אנחנו שמחים שהצטרפת לקהילת FreezeFit. עכשיו תוכל/י:</p>
                <ul style="padding-right: 20px;">
                  <li>🔍 לחפש מכוני קריותרפיה באזורך</li>
                  <li>📅 לקבוע תורים בקלות</li>
                  <li>⭐ לקרוא ביקורות ולהשאיר המלצות</li>
                  <li>💬 להישאר בקשר עם המטפלים</li>
                </ul>
              </div>
              
              <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #0066cc; margin-top: 0;">🧊 מה זה קריותרפיה?</h3>
                <p>קריותרפיה היא טיפול טבעי המשתמש בקור לשיפור הבריאות והרווחה. הטיפול יכול לעזור עם:</p>
                <ul style="padding-right: 20px;">
                  <li>הפחתת דלקות וכאבים</li>
                  <li>שיפור התאוששות שרירים</li>
                  <li>חיזוק מערכת החיסון</li>
                  <li>הגברת רמות האנרגיה</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.SITE_URL || 'https://freezefit.netlify.app'}/find-institute" 
                   style="background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  🔍 מצא מכון טיפול
                </a>
              </div>
              
              <div style="border-top: 2px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
                <p>זהו אימייל בדיקה. צריכים עזרה? אנחנו כאן בשבילכם! 💙</p>
                <p>צוות FreezeFit</p>
              </div>
            </div>
          </div>
        `
      },
      provider: {
        subject: '🏢 ברוכים הבאים ל-FreezeFit - פורטל ספקים! (TEST)',
        htmlContent: `
          <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #ffeaa7;">
                <p style="margin: 0; color: #856404; font-weight: bold;">🧪 זהו אימייל בדיקה - TEST EMAIL</p>
              </div>
              
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0066cc; margin-bottom: 10px;">ברוכים הבאים ל-FreezeFit! 🏢</h1>
                <p style="font-size: 18px; color: #666;">היי ${testName}!</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h2 style="color: #0066cc; margin-top: 0;">🎊 ההרשמה לפורטל הספקים הושלמה!</h2>
                <p>אנחנו שמחים שהצטרפת לרשת FreezeFit. כעת תוכל/י:</p>
                <ul style="padding-right: 20px;">
                  <li>📋 לנהל את פרטי המכון שלך</li>
                  <li>📅 לנהל תורים ולקוחות</li>
                  <li>📊 לצפות בדוחות ואנליטיקות</li>
                  <li>💬 לתקשר עם לקוחות</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.SITE_URL || 'https://freezefit.netlify.app'}/dashboard" 
                   style="background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  🏢 לעבור לדשבורד
                </a>
              </div>
              
              <div style="border-top: 2px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
                <p>זהו אימייל בדיקה. צריכים עזרה? אנחנו כאן בשבילכם! 💼</p>
                <p>צוות FreezeFit</p>
              </div>
            </div>
          </div>
        `
      }
    };

    const content = welcomeContent[testRole] || welcomeContent.customer;

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
          email: testEmail,
          name: testName
        }],
        subject: content.subject,
        htmlContent: content.htmlContent,
        tags: ['test-email', 'welcome-email', `role-${testRole}`]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brevo API error:', response.status, errorText);
      return createResponse(400, {
        success: false,
        error: 'Failed to send email',
        details: `Brevo API error: ${response.status} - ${errorText}`
      });
    }

    const result = await response.json();
    console.log(`Welcome email sent successfully to ${testEmail}`, result);

    return createResponse(200, {
      success: true,
      message: `Test welcome email sent successfully to ${testEmail}`,
      email_details: {
        recipient: testEmail,
        name: testName,
        role: testRole,
        subject: content.subject
      },
      brevo_response: result
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
