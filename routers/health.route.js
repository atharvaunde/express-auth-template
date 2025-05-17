const express = require('express');
const router = express.Router();
const { pingCheck } = require('../controllers/health.controller');

router.get('/ping', pingCheck);

module.exports = router;
