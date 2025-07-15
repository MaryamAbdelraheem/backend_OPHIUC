// utils/errors/ApiError.js

class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        // Captures the stack trace excluding the constructor call
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;
  