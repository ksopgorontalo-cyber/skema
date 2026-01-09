/**
 * Winston Logger Configuration
 * 
 * Debug mode: Set LOG_LEVEL=debug in .env for verbose logging
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Get log level from environment (default: info, set to 'debug' for verbose)
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const logFormat = printf(({ level, message, timestamp, stack }) => {
    // Include stack trace for errors
    if (stack) {
        return `${timestamp} [${level}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level}]: ${message}`;
});

export const logger = winston.createLogger({
    level: LOG_LEVEL,
    format: combine(
        errors({ stack: true }), // Capture stack traces
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // Console output with colors
        new winston.transports.Console({
            format: combine(
                colorize(),
                errors({ stack: true }),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            ),
        }),
        // File output - errors only
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // File output - all logs
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Debug log file (only when debug mode)
        ...(LOG_LEVEL === 'debug' ? [
            new winston.transports.File({
                filename: 'logs/debug.log',
                level: 'debug',
                maxsize: 10485760, // 10MB
                maxFiles: 3,
            })
        ] : []),
    ],
});

// Log startup info
logger.info(`Logger initialized with level: ${LOG_LEVEL}`);
if (LOG_LEVEL === 'debug') {
    logger.debug('Debug mode enabled - verbose logging active');
}
