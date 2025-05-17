const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

router.get('/ping', async (req, res) => {
    /**
     * #swagger.tags = ['Health']
     * #swagger.description = 'Ping health check route'
     * #swagger.responses[200] = {
     *   description: 'Ping check successful',
     *   schema: {
     *     success: true,
     *     statusCode: 200,
     *     message: 'Ping check successful',
     *     data: {}
     *   }
     * }
     */
    const result = await healthController.pingCheck();
    res.status(result.statusCode).json(result);
});

module.exports = router;
