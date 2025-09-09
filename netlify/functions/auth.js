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
