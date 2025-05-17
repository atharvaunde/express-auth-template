// Centralized error handler
const errorHandler = (err, req, res, next) => {
    const statusCode = 500;
    res.status(statusCode).json(err);
};

module.exports = errorHandler;
