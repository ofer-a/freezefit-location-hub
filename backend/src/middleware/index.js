import { jwtUtils, responseUtils } from '../utils/index.js';

/**
 * Authentication middleware
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = jwtUtils.extractTokenFromHeader(authHeader);

  if (!token) {
    return responseUtils.unauthorized(res, 'No token provided');
  }

  const decoded = jwtUtils.verifyToken(token);
  if (!decoded) {
    return responseUtils.unauthorized(res, 'Invalid token');
  }

  req.user = decoded;
  next();
};

/**
 * Rate limiting middleware (simple implementation)
 */
const rateLimitMiddleware = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old requests
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    }

    // Check if rate limit exceeded
    const userRequests = requests.get(key) || [];
    if (userRequests.length >= max) {
      return responseUtils.error(res, 'Rate limit exceeded', 429);
    }

    // Add current request
    userRequests.push(now);
    requests.set(key, userRequests);

    next();
  };
};

/**
 * Validation middleware
 */
const validateMiddleware = (validationRules) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(validationRules)) {
      const value = req.body[field];

      for (const rule of rules) {
        const result = rule(value, field);
        if (result !== true) {
          errors.push(result);
        }
      }
    }

    if (errors.length > 0) {
      return responseUtils.validationError(res, errors);
    }

    next();
  };
};

/**
 * Error handling middleware
 */
const errorMiddleware = (error, req, res, next) => {
  console.error('Error:', error);

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return responseUtils.unauthorized(res, 'Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    return responseUtils.unauthorized(res, 'Token expired');
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return responseUtils.validationError(res, error.message);
  }

  // Default error
  return responseUtils.error(res, 'Internal server error', 500);
};

/**
 * Not found middleware
 */
const notFoundMiddleware = (req, res) => {
  return responseUtils.notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
};

export {
  authMiddleware,
  rateLimitMiddleware,
  validateMiddleware,
  errorMiddleware,
  notFoundMiddleware
};
