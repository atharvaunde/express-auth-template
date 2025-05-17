// Centralized error handler
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json(err);
};

module.exports = errorHandler;
