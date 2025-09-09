import winston from "winston";
import { appMode } from "../config/index.js";

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "green",
        http: "magenta",
        debug: "blue",
    },
};
winston.addColors(customLevels.colors);

// פורמט עם צבעים לקונסול
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`)
);

// פורמט ללא צבעים לקבצים
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    winston.format.printf((info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
);

// Logger ראשי לקונסול ו-combined
const baseLogger = winston.createLogger({
    levels: customLevels.levels,
    transports: [
        new winston.transports.Console({
            level: appMode === 'development' ? 'debug' : 'info',
            format: consoleFormat
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log',
            format: fileFormat
        }),
    ],
});

// Loggers נפרדים לכל רמה - כל אחד יכתב רק את הרמה שלו
const errorFileLogger = winston.createLogger({
    levels: customLevels.levels,
    level: 'error',
    format: fileFormat,
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
    ]
});

const warnFileLogger = winston.createLogger({
    levels: customLevels.levels,
    level: 'warn',
    format: fileFormat,
    transports: [
        new winston.transports.File({ filename: 'logs/warn.log', level: 'warn' })
    ]
});

const infoFileLogger = winston.createLogger({
    levels: customLevels.levels,
    level: 'info',
    format: fileFormat,
    transports: [
        new winston.transports.File({ filename: 'logs/info.log', level: 'info' })
    ]
});

const httpFileLogger = winston.createLogger({
    levels: customLevels.levels,
    level: 'http',
    format: fileFormat,
    transports: [
        new winston.transports.File({ filename: 'logs/http.log', level: 'http' })
    ]
});

const debugFileLogger = winston.createLogger({
    levels: customLevels.levels,
    level: 'debug',
    format: fileFormat,
    transports: [
        new winston.transports.File({ filename: 'logs/debug.log', level: 'debug' })
    ]
});

// פונקציות עזר שיכתבו לכל הloggers הרלוונטיים
const logToAll = (level, message) => {
    // תמיד לוג לקונסול ו-combined
    baseLogger.log(level, message);
    
    // לוג לקובץ הספציפי של הרמה
    switch(level) {
        case 'error':
            errorFileLogger.error(message);
            break;
        case 'warn':
            warnFileLogger.warn(message);
            break;
        case 'info':
            infoFileLogger.info(message);
            break;
        case 'http':
            httpFileLogger.http(message);
            break;
        case 'debug':
            debugFileLogger.debug(message);
            break;
    }
};

export const createLogger = (context) => {
    return {
        error: (message) => logToAll('error', `${context}: ${message}`),
        warn: (message) => logToAll('warn', `${context}: ${message}`),
        info: (message) => logToAll('info', `${context}: ${message}`),
        http: (message) => logToAll('http', `${context}: ${message}`),
        debug: (message) => logToAll('debug', `${context}: ${message}`),
    }
}

const defaultLogger = {
    error: (message) => logToAll('error', message),
    warn: (message) => logToAll('warn', message),
    info: (message) => logToAll('info', message),
    http: (message) => logToAll('http', message),
    debug: (message) => logToAll('debug', message),
}

export default defaultLogger;
