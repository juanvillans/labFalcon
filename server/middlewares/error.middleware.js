/**
 * Error handling middleware for Express application
 * Handles common errors including MongoDB, validation, and HTTP errors
 */

// Custom error class for application-specific errors
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Handle MongoDB Cast Error (Invalid ObjectId)
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

// Handle MongoDB Duplicate Field Error
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

// Handle Mongoose Validation Error
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

// Handle JSON Web Token Error
const handleJWTError = () =>
    new AppError('Invalid token. Please log in again!', 401);

// Handle JWT Expired Error
const handleJWTExpiredError = () =>
    new AppError('Your token has expired! Please log in again.', 401);

// Send error response in development
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

// Send error response in production
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
};

// Main error handling middleware
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        // Handle specific error types
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

// Middleware to handle 404 errors for undefined routes
export const notFound = (req, res, next) => {
    const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
    next(err);
};

// Async error wrapper to catch errors in async functions
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// Common error responses
export const commonErrors = {
    // Authentication errors
    unauthorized: () => new AppError('You are not logged in! Please log in to get access.', 401),
    forbidden: () => new AppError('You do not have permission to perform this action', 403),
    botDetected: () => new AppError('Bots are not allowed', 403),

    // Resource errors
    notFound: (resource = 'Resource') => new AppError(`${resource} not found`, 404),
    alreadyExists: (resource = 'Resource') => new AppError(`${resource} already exists`, 409),

    // Validation errors
    invalidInput: (message = 'Invalid input data') => new AppError(message, 400),
    missingFields: (fields) => new AppError(`Missing required fields: ${fields.join(', ')}`, 400),

    // Server errors
    serverError: (message = 'Internal server error') => new AppError(message, 500),
    databaseError: () => new AppError('Database connection error', 500),

    // Rate limiting
    tooManyRequests: () => new AppError('Too many requests from this IP, please try again later.', 429)
};

export default errorHandler;