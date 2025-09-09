import  jwt from 'jsonwebtoken';
import {jwtSecret} from '../config/index.js';
import { createLogger } from './logger.js';

const logger = createLogger('TOKEN_SERVICE');

export const createToken = async (payload, options) => {
    
    logger.debug('Creating token with payload:', payload);
    if (!jwtSecret) {
        logger.error('JWT Secret is not defined');
        throw new Error('JWT Secret is not defined');
    }
    return await jwt.sign(payload, jwtSecret, options);
};

export const verifyToken = async (token) => {
    try {
        logger.debug('Verifying token:', token);
        return await jwt.verify(token, jwtSecret);
    } catch (error) {
        logger.error('Error verifying token:', error);  
        throw error;
    }
};
