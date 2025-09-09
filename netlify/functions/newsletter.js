import { Pool } from 'pg';

// Database connection pool
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  const pool = getPool();

  try {
    const { httpMethod, path } = event;

    // POST /newsletter - Subscribe to newsletter
    if (httpMethod === 'POST') {
      const { email, name, source } = JSON.parse(event.body);

      if (!email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Email is required',
            success: false 
          }),
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Invalid email format',
            success: false 
          }),
        };
      }

      // Check if email already exists
      const existingSubscriber = await pool.query(
        'SELECT id FROM newsletter_subscribers WHERE email = $1',
        [email.toLowerCase().trim()]
      );

      if (existingSubscriber.rows.length > 0) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            message: 'Already subscribed',
            success: true,
            alreadySubscribed: true
          }),
        };
      }

      // Insert new subscriber
      const result = await pool.query(
        `INSERT INTO newsletter_subscribers (email, name, source, subscribed_at, is_active) 
         VALUES ($1, $2, $3, NOW(), true) 
         RETURNING id, email, name, subscribed_at`,
        [email.toLowerCase().trim(), name || null, source || 'website']
      );

      // Here you can integrate with external email services
      await sendToEmailService(email, name, source);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Successfully subscribed to newsletter',
          data: result.rows[0]
        }),
      };
    }

    // GET /newsletter - Get all subscribers (admin only)
    if (httpMethod === 'GET') {
      const result = await pool.query(
        `SELECT id, email, name, source, subscribed_at, is_active 
         FROM newsletter_subscribers 
         ORDER BY subscribed_at DESC`
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: result.rows,
          count: result.rows.length
        }),
      };
    }

    // DELETE /newsletter?email=... - Unsubscribe
    if (httpMethod === 'DELETE') {
      const email = event.queryStringParameters?.email;
      
      if (!email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Email parameter is required',
            success: false 
          }),
        };
      }

      const result = await pool.query(
        'UPDATE newsletter_subscribers SET is_active = false, unsubscribed_at = NOW() WHERE email = $1 RETURNING *',
        [email.toLowerCase().trim()]
      );

      if (result.rows.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'Email not found',
            success: false 
          }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Successfully unsubscribed'
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };

  } catch (error) {
    console.error('Newsletter function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        success: false 
      }),
    };
  }
};

// Function to integrate with external email services
async function sendToEmailService(email, name, source) {
  try {
    // Integration options (choose one):
    
    // 1. BREVO (formerly Sendinblue) - Free tier: 300 emails/day
    if (process.env.BREVO_API_KEY) {
      await sendToBrevo(email, name, source);
    }
    
    // 2. ConvertKit - Free tier: 1,000 subscribers
    else if (process.env.CONVERTKIT_API_KEY) {
      await sendToConvertKit(email, name, source);
    }
    
    // 3. EmailJS - Free tier: 200 emails/month
    else if (process.env.EMAILJS_SERVICE_ID) {
      await sendToEmailJS(email, name, source);
    }
    
    // 4. Resend - Free tier: 3,000 emails/month
    else if (process.env.RESEND_API_KEY) {
      await sendToResend(email, name, source);
    }
    
    // 5. Just store in database (no external service)
    else {
      console.log('Newsletter subscription stored in database:', { email, name, source });
    }
    
  } catch (error) {
    console.error('Failed to send to email service:', error);
    // Don't throw error - we still want to save to database
  }
}

// Brevo (Sendinblue) integration
async function sendToBrevo(email, name, source) {
  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      email: email,
      attributes: {
        FIRSTNAME: name || '',
        SOURCE: source || 'website'
      },
      listIds: [parseInt(process.env.BREVO_LIST_ID || '1')]
    })
  });
  
  if (!response.ok) {
    throw new Error(`Brevo API error: ${response.status}`);
  }
}

// ConvertKit integration
async function sendToConvertKit(email, name, source) {
  const response = await fetch(`https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: process.env.CONVERTKIT_API_KEY,
      email: email,
      first_name: name || '',
      fields: {
        source: source || 'website'
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`ConvertKit API error: ${response.status}`);
  }
}

// Resend integration
async function sendToResend(email, name, source) {
  const response = await fetch('https://api.resend.com/audiences/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      audience_id: process.env.RESEND_AUDIENCE_ID,
      email: email,
      first_name: name || '',
      unsubscribed: false
    })
  });
  
  if (!response.ok) {
    throw new Error(`Resend API error: ${response.status}`);
  }
}

// EmailJS integration (client-side service)
async function sendToEmailJS(email, name, source) {
  // EmailJS is typically used client-side, but can be used server-side too
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: 'your-business@email.com', // Your business email
        subscriber_email: email,
        subscriber_name: name || 'Anonymous',
        source: source || 'website'
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`EmailJS API error: ${response.status}`);
  }
}
