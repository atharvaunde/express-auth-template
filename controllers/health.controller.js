const { pingCheck } = require('../services/health.service');

exports.pingCheck = async (req, res, next) => {
    try {
        const result = await pingCheck();
        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.log('Error in pingCheck controller', error);
        return next(error);
    }
};
