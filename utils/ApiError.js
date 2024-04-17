class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }

  getErrorObject() {
    return {
      statusCode: this.statusCode,
      message: this.message,
    };
  }
}

module.exports = ApiError;