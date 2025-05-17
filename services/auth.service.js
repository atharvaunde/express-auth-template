const { Users } = require('../models');
const { createError, handleError } = require('../utils/error');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { promisify } = require('util');
const { sendEmail } = require('../utils/mailer');

const validateFields = (fields) => {
    for (const [key, value] of Object.entries(fields)) {
        if (!value) throw createError(400, `${key} is required`);
    }
};

const generateOTP = () => ({
    otp: Math.floor(100000 + Math.random() * 900000),
    otpExpiresAt: Date.now() + 10 * 60 * 1000,
});

// Register
exports.registerUser = async (payload) => {
    try {
        const { name, email, password } = payload?.body || {};
        validateFields({ name, email, password });

        if (await Users.findOne({ email })) throw createError(400, 'Email already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await Users.create({ name, email, password: hashedPassword });

        return {
            message: 'User registered successfully',
            data: user,
            statusCode: 201,
            success: true,
        };
    } catch (error) {
        console.error('Error in registerUser:', error);
        handleError(error);
    }
};

// Login
exports.loginUser = async (payload) => {
    try {
        const { email, password } = payload?.body || {};
        validateFields({ email, password });

        const user = await Users.findOne({ email });
        if (!user) throw createError(400, 'Invalid email or password');

        const { otp, otpExpiresAt } = generateOTP();
        await Users.updateOne({ email }, { $set: { otp, otpExpiresAt } });

        await sendEmail(email, 'Your Login OTP', `<p>Your OTP is <b>${otp}</b>. It will expire in 10 minutes.</p>`);

        return {
            message: 'OTP sent successfully',
            data: process.env.NODE_ENV === 'development' ? { otp, otpExpiresAt } : {},
            statusCode: 200,
            success: true,
        };
    } catch (error) {
        console.error('Error in loginUser:', error);
        handleError(error);
    }
};

// Verify OTP
exports.verifyOTP = async (payload) => {
    try {
        const { email, otp } = payload?.body || {};
        validateFields({ email, otp });

        const user = await Users.findOne({ email });
        if (!user || !user.otp || !user.otpExpiresAt) throw createError(400, 'Invalid OTP request');

        if (Date.now() > user.otpExpiresAt) throw createError(400, 'OTP has expired');
        if (user.otp !== parseInt(otp)) throw createError(400, 'Invalid OTP');

        await Users.updateOne({ email }, { $unset: { otp: 1, otpExpiresAt: 1 } });

        const sessionUser = { id: user._id, email: user.email, name: user.name };
        payload.req.session.user = sessionUser;

        return {
            message: 'OTP verified successfully',
            data: { user: sessionUser },
            statusCode: 200,
            success: true,
        };
    } catch (error) {
        console.error('Error in verifyOTP:', error);
        handleError(error);
    }
};

// Logout
exports.logoutUser = async (payload) => {
    try {
        await promisify(payload.req.session.destroy).bind(payload.req.session)();
        return {
            message: 'Logged out successfully',
            statusCode: 200,
            success: true,
        };
    } catch (error) {
        console.error('Error in logoutUser:', error);
        handleError(error);
    }
};

// Request Password Reset
exports.requestPasswordReset = async (payload) => {
    try {
        const { email } = payload?.body || {};
        validateFields({ email });

        const user = await Users.findOne({ email });
        if (!user) throw createError(400, 'User not found');

        const resetToken = crypto.randomBytes(32).toString('hex');
        const { otp, otpExpiresAt } = generateOTP();

        await Users.updateOne({ email }, { $set: { resetToken, otp, otpExpiresAt } });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await sendEmail(
            email,
            'Your Password Reset OTP',
            `<p>Your OTP is <b>${otp}</b> for password reset. It will expire in 10 minutes.</p>`,
        );

        return {
            message: 'Password reset instructions sent',
            data: process.env.NODE_ENV === 'development' ? { resetUrl, otp } : {},
            statusCode: 200,
            success: true,
        };
    } catch (error) {
        console.error('Error in requestPasswordReset:', error);
        handleError(error);
    }
};

// Reset Password
exports.resetPassword = async (payload) => {
    try {
        const { token, otp, newPassword, confirmPassword } = payload?.body || {};
        validateFields({ token, otp, newPassword, confirmPassword });

        if (newPassword !== confirmPassword) throw createError(400, 'Passwords do not match');

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            throw createError(
                400,
                'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character',
            );
        }

        const user = await Users.findOne({ resetToken: token });
        if (!user || !user.otp || !user.otpExpiresAt) throw createError(400, 'Invalid reset request');

        if (Date.now() > user.otpExpiresAt) throw createError(400, 'OTP has expired');
        if (user.otp != parseInt(otp)) throw createError(400, 'Invalid OTP');

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Users.updateOne(
            { email: user.email },
            {
                $set: { password: hashedPassword },
                $unset: { resetToken: 1, otp: 1, otpExpiresAt: 1 },
            },
        );

        if (payload.req.session) {
            await promisify(payload.req.session.destroy).bind(payload.req.session)();
        }

        await sendEmail(
            email,
            'Password Reset Successful',
            `<p>Your password has been reset successfully. If you did not request this, please contact support.</p>`,
        );

        return {
            message: 'Password reset successful',
            statusCode: 200,
            success: true,
        };
    } catch (error) {
        console.error('Error in resetPassword:', error);
        handleError(error);
    }
};
