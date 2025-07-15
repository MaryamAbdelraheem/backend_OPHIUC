// utils/errors/globalErrorHandler.js
const { ValidationError, UniqueConstraintError, DatabaseError } = require('sequelize');
const ApiError = require('../utils/errors/ApiError');

// Handle Sequelize Validation Error
const handleSequelizeValidationError = (err) => {
    const messages = err.errors.map((e) => e.message);
    return new ApiError(`Validation error: ${messages.join(', ')}`, 400);
};

// Handle Sequelize Unique Constraint Error
const handleSequelizeUniqueError = (err) => {
    const messages = err.errors.map((e) => `${e.path} must be unique`);
    return new ApiError(`Duplicate field: ${messages.join(', ')}`, 400);
};

// Handle Sequelize Database Error
const handleSequelizeDatabaseError = (err) => {
    return new ApiError('Database error occurred', 500);
};

// Dev mode error response
const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message,
        error: err,
        stack: err.stack
    });
};

// Production mode error response
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        console.error('ERROR ', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
};

// Global Error Handler
exports.globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    let error = err;

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    } else if (process.env.NODE_ENV === 'production') {
        if (err instanceof ValidationError) error = handleSequelizeValidationError(err);
        if (err instanceof UniqueConstraintError) error = handleSequelizeUniqueError(err);
        if (err instanceof DatabaseError) error = handleSequelizeDatabaseError(err);

        sendErrorProd(error, res);
    }
};

// Not found handler
exports.notFoundHandler = (req, res, next) => {
    next(new ApiError(`Can't find the requested URL: ${req.originalUrl}`, 404));
};