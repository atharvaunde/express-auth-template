const {
    registerUser,
    loginUser,
    verifyOTP,
    logoutUser,
    requestPasswordReset,
    resetPassword,
} = require('../services/auth.service');

exports.registerUser = async (req, res, next) => {
    try {
        const result = await registerUser(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.error('Error in registerUser controller', error);
        return next(error);
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        const result = await loginUser(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.error('Error in loginUser controller', error);
        return next(error);
    }
};

exports.verifyOTP = async (req, res, next) => {
    try {
        const result = await verifyOTP(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.error('Error in verifyOTP controller', error);
        return next(error);
    }
};

exports.logoutUser = async (req, res, next) => {
    try {
        const result = await logoutUser(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.error('Error in logoutUser controller', error);
        return next(error);
    }
};

exports.requestPasswordReset = async (req, res, next) => {
    try {
        const result = await requestPasswordReset(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.error('Error in requestPasswordReset controller', error);
        return next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const result = await resetPassword(req);
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.error('Error in resetPassword controller', error);
        return next(error);
    }
};
