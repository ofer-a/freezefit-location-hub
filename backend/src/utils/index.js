import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

/**
 * Password utilities
 */
const passwordUtils = {
  // Hash a password
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  },

  // Compare password with hash
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  },

  // Validate password strength
  isValidPassword(password) {
    return validator.isLength(password, { min: 8, max: 128 }) &&
           validator.matches(password, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/);
  }
};

/**
 * JWT utilities
 */
const jwtUtils = {
  // Generate JWT token
  generateToken(payload, expiresIn = '24h') {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    return jwt.sign(payload, secret, { expiresIn });
  },

  // Verify JWT token
  verifyToken(token) {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  },

  // Extract token from Authorization header
  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
};

/**
 * Validation utilities
 */
const validationUtils = {
  // Validate email
  isValidEmail(email) {
    return validator.isEmail(email);
  },

  // Validate phone number
  isValidPhone(phone) {
    return validator.isMobilePhone(phone);
  },

  // Sanitize string input
  sanitizeString(str) {
    return validator.escape(validator.trim(str));
  },

  // Validate UUID
  isValidUUID(uuid) {
    return validator.isUUID(uuid);
  }
};

/**
 * General utilities
 */
const generalUtils = {
  // Generate UUID
  generateUUID() {
    return uuidv4();
  },

  // Deep clone object
  deepClone(obj) {
    return _.cloneDeep(obj);
  },

  // Pick specific fields from object
  pickFields(obj, fields) {
    return _.pick(obj, fields);
  },

  // Remove undefined/null values from object
  cleanObject(obj) {
    return _.omitBy(obj, _.isNil);
  },

  // Capitalize first letter
  capitalize(str) {
    return _.capitalize(str);
  },

  // Generate random string
  generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

/**
 * Response utilities
 */
const responseUtils = {
  // Success response
  success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  },

  // Error response
  error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  },

  // Validation error response
  validationError(res, errors) {
    return this.error(res, 'Validation failed', 400, errors);
  },

  // Not found response
  notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  },

  // Unauthorized response
  unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }
};

export {
  passwordUtils,
  jwtUtils,
  validationUtils,
  generalUtils,
  responseUtils
};
