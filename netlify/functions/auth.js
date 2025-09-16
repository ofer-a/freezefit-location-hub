// Netlify Function for authentication
import { query, createResponse, handleCORS } from './db-client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const { httpMethod, path } = event;
    const body = event.body ? JSON.parse(event.body) : {};
    
    switch (httpMethod) {
      case 'POST':
        if (path.includes('/register')) {
          return await handleRegister(body);
        } else if (path.includes('/login')) {
          return await handleLogin(body);
        } else if (path.includes('/verify-token')) {
          return await handleVerifyToken(body);
        } else if (path.includes('/reset-password')) {
          return await handleResetPassword(body);
        } else if (path.includes('/send-reset-email')) {
          return await handleSendResetEmail(body);
        } else if (path.includes('/change-password')) {
          return await handleChangePassword(body);
        } else {
          // Default to login if no specific path is provided
          return await handleLogin(body);
        }
        break;
        
      default:
        return createResponse(405, null, 'Method not allowed');
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return createResponse(500, null, error.message);
  }
};

// Register new user
async function handleRegister(body) {
  const { name, email, password, role } = body;
  
  if (!name || !email || !password || !role) {
    return createResponse(400, null, 'All fields are required');
  }

  try {
    // Check if user already exists
    const existingUser = await query('SELECT * FROM profiles WHERE email = $1', [email.toLowerCase()]);
    
    if (existingUser.rows.length > 0) {
      return createResponse(400, null, 'משתמש עם אימייל זה כבר קיים במערכת');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const result = await query(
      `INSERT INTO profiles (email, full_name, role, password_hash) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, full_name, role, created_at`,
      [email.toLowerCase(), name, role, hashedPassword]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.full_name, user.role);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Don't fail registration if email fails
    }

    return createResponse(201, {
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role
      },
      token,
      redirectTo: user.role === 'provider' ? '/dashboard' : '/profile'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return createResponse(500, null, 'שגיאה בהרשמה, נסה שוב');
  }
}

// Login user
async function handleLogin(body) {
  const { email, password } = body;
  
  if (!email || !password) {
    return createResponse(400, null, 'Email and password are required');
  }

  try {
    // Find user
    const result = await query(
      'SELECT id, email, full_name, role, password_hash FROM profiles WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return createResponse(401, null, 'אימייל או סיסמה לא נכונים');
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return createResponse(401, null, 'אימייל או סיסמה לא נכונים');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return createResponse(200, {
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role
      },
      token,
      redirectTo: user.role === 'provider' ? '/dashboard' : '/profile'
    });

  } catch (error) {
    console.error('Login error:', error);
    return createResponse(500, null, 'שגיאה בהתחברות, נסה שוב');
  }
}

// Verify JWT token
async function handleVerifyToken(body) {
  const { token } = body;
  
  if (!token) {
    return createResponse(400, null, 'Token is required');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get fresh user data
    const result = await query(
      'SELECT id, email, full_name, role FROM profiles WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return createResponse(401, null, 'User not found');
    }

    const user = result.rows[0];

    return createResponse(200, {
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return createResponse(401, null, 'Invalid token');
  }
}

// Reset password
async function handleResetPassword(body) {
  const { email, newPassword } = body;
  
  if (!email || !newPassword) {
    return createResponse(400, null, 'Email and new password are required');
  }

  try {
    // Find user
    const userResult = await query('SELECT id FROM profiles WHERE email = $1', [email.toLowerCase()]);
    
    if (userResult.rows.length === 0) {
      return createResponse(404, null, 'לא נמצא משתמש עם האימייל הזה');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await query(
      'UPDATE profiles SET password_hash = $1, updated_at = NOW() WHERE email = $2',
      [hashedPassword, email.toLowerCase()]
    );

    return createResponse(200, { message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password reset error:', error);
    return createResponse(500, null, 'שגיאה באיפוס סיסמה, נסה שוב');
  }
}

// Send password reset email with temporary password
async function handleSendResetEmail(body) {
  const { email } = body;
  
  if (!email) {
    return createResponse(400, null, 'Email is required');
  }

  try {
    // Check if user exists
    const userResult = await query('SELECT id, full_name FROM profiles WHERE email = $1', [email.toLowerCase()]);
    
    if (userResult.rows.length === 0) {
      return createResponse(404, null, 'לא נמצא משתמש עם האימייל הזה');
    }

    const user = userResult.rows[0];

    // Generate temporary password (8 characters with mix of letters and numbers)
    const tempPassword = generateTemporaryPassword();
    
    // Hash the temporary password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update user's password in database
    await query(
      'UPDATE profiles SET password_hash = $1, updated_at = NOW() WHERE email = $2',
      [hashedPassword, email.toLowerCase()]
    );

    // Send email with temporary password using Brevo
    await sendPasswordResetEmail(email, user.full_name, tempPassword);

    return createResponse(200, { 
      message: 'Temporary password sent to your email',
      success: true 
    });

  } catch (error) {
    console.error('Send reset email error:', error);
    return createResponse(500, null, 'שגיאה בשליחת אימייל איפוס סיסמה, נסה שוב');
  }
}

// Generate temporary password
function generateTemporaryPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Send password reset email using Brevo
async function sendPasswordResetEmail(email, fullName, tempPassword) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  
  if (!BREVO_API_KEY || BREVO_API_KEY === 'your_brevo_api_key_here') {
    console.log('Brevo API key not configured, skipping password reset email');
    return;
  }

  try {
    // Use Brevo Template ID 8 (Password Reset Template - "איפוס סיסמא משתמש")
    const templateId = 8;

    // Prepare template parameters - this template uses {{temporary_password}} variable
    const templateParams = {
      temporary_password: tempPassword
    };

    // Send email via Brevo using template
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        templateId: templateId,
        to: [{ email: email, name: fullName || 'משתמש' }],
        params: templateParams,
        tags: ['password-reset']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API error: ${response.status} - ${errorText}`);
    }

  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

// Change password (for logged-in users)
async function handleChangePassword(body) {
  const { user_id, currentPassword, newPassword } = body;
  
  if (!user_id || !currentPassword || !newPassword) {
    return createResponse(400, null, 'User ID, current password, and new password are required');
  }

  try {
    // Find user and get current password hash
    const userResult = await query('SELECT password_hash FROM profiles WHERE id = $1', [user_id]);
    
    if (userResult.rows.length === 0) {
      return createResponse(404, null, 'משתמש לא נמצא');
    }

    const { password_hash } = userResult.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, password_hash);
    
    if (!isCurrentPasswordValid) {
      return createResponse(400, null, 'הסיסמה הנוכחית שגויה');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await query(
      'UPDATE profiles SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedNewPassword, user_id]
    );

    return createResponse(200, { message: 'Password changed successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    return createResponse(500, null, 'שגיאה בשינוי סיסמה, נסה שוב');
  }
}

// Send welcome email using Brevo Template
async function sendWelcomeEmail(email, name, role) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  
  if (!BREVO_API_KEY || BREVO_API_KEY === 'your_brevo_api_key_here') {
    console.log('Brevo API key not configured, skipping welcome email');
    return;
  }

  try {
    // Use Brevo Template ID 6 ("מייל ברוך הבא" - Welcome Email)
    const templateId = 6;
    
    // Prepare template parameters
    const templateParams = {
      FIRSTNAME: name || 'חבר/ה יקר/ה'
    };

    // Send email via Brevo using template
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        templateId: templateId,
        to: [{
          email: email,
          name: name || 'משתמש חדש'
        }],
        params: templateParams,
        tags: ['welcome-email', `role-${role}`, 'registration']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`Welcome email sent successfully to ${email} using template ${templateId}. Message ID: ${result.messageId}`);
    
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw - we don't want to fail registration if email fails
  }
}
