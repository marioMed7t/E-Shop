// @desc   this class is responsible about operation error (error that i can predect)
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? "Fail" : "Error";
    this.isOperational = true;
  }
}

module.exports = ApiError;
