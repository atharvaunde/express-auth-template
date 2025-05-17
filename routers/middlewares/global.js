const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const hpp = require('hpp');
const express = require('express'); // Ensure express is required

module.exports = (app) => {
    // MongoDB session store to persist sessions
    const store = new MongoDBStore({
        uri: process.env.MONGO_URI_SESSIONS,
        collection: 'mySessions',
    });

    // Security and performance middlewares
    app.use(compression());
    app.use(helmet());
    app.use(hpp());

    // Body parsing
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Rate limiter
    app.use(
        rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100,
            message: 'Too many requests from this IP, please try again later',
            standardHeaders: true,
            legacyHeaders: false,
        }),
    );

    // CORS setup
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    app.use(
        cors({
            origin: allowedOrigins,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
            maxAge: 86400, // 24 hours
        }),
    );

    // Session setup
    app.use(
        session({
            secret: process.env.SESSION_SECRET || 'defaultsecret',
            name: 'sessionId',
            resave: false,
            saveUninitialized: false,
            store: store,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                sameSite: 'lax',
                domain: process.env.COOKIE_DOMAIN || 'localhost',
            },
        }),
    );

    // Optional: Expose specific headers if needed
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization');
        next();
    });
};
