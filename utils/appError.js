class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'failed' : 'error';
    this.isOperational = true; // This is true,, because the error is trigger by the coder

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
