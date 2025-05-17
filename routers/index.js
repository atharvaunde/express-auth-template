const authRoutes = require('./auth.route');
const healthRoutes = require('./health.route');

module.exports = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api/health', healthRoutes);
};
