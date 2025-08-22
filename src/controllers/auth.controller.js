const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/email');
const { Op } = require('sequelize');

const User = db.User;

exports.register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password || password.length < 8) {
            return res.status(400).send({ message: "Error: Please provide valid name, email, phone, and a password of at least 8 characters." });
        }
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).send({ message: "Error: This email address is already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        const newUser = await User.create({ 
            name, email, phone, password: hashedPassword, verificationToken: hashedOtp 
        });

        const message = `Your verification code for E-Pharmacy is: ${otp}`;
        await sendEmail({ email: newUser.email, subject: 'Verify Your Email', message });

        res.status(201).send({ 
            message: "Registration successful! An OTP has been sent to your email for verification.",
            data: { email: newUser.email } 
        });
    } catch (error) {
        res.status(500).send({ message: "An error occurred during registration." });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).send({ message: "Email and OTP are required." });
        }

        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
        const user = await User.findOne({ where: { email, verificationToken: hashedOtp } });

        if (!user) {
            return res.status(400).send({ message: "The OTP you entered is incorrect. Please try again." });
        }
        
        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.status(200).send({ message: "Email verified successfully! You can now log in." });
    } catch (error) {
        res.status(500).send({ message: "An error occurred during OTP verification." });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) { return res.status(400).send({ message: "Email is required."}); }
        const user = await User.findOne({ where: { email } });
        if (!user) { return res.status(404).send({ message: "No user found with this email." }); }
        if (user.isVerified) { return res.status(400).send({ message: "This account is already verified." }); }
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationToken = crypto.createHash('sha256').update(otp).digest('hex');
        await user.save();
        
        await sendEmail({ email: user.email, subject: 'Your New Verification Code', message: `Your new verification code is: ${otp}` });
        res.status(200).send({ message: "A new OTP has been sent to your email." });
    } catch (error) {
        res.status(500).send({ message: "An error occurred while resending OTP." });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ message: "Email and password are required." });
        }
        const user = await User.findOne({ where: { email } });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).send({ message: "The email or password you entered is incorrect." });
        }
        if (!user.isVerified) {
            return res.status(403).send({ 
                message: "Your account is not verified. Please check your email for the verification OTP.",
                data: { isVerified: false, email: user.email }
            });
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).send({ message: "Login successful!", data: { user, accessToken: token } });
    } catch (error) {
        res.status(500).send({ message: "An error occurred during login." });
    }
};


exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) { return res.status(400).send({ message: "Email is required." }); }
        const user = await User.findOne({ where: { email } });
        if (!user) { return res.status(404).send({ message: "No user found with this email." }); }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();
        
        await sendEmail({ email: user.email, subject: 'Your Password Reset OTP', message: `Your OTP to reset password is: ${otp}` });
        res.status(200).send({ 
            message: "An OTP has been sent to your email to reset your password.",
            data: { email: user.email }
        });
    } catch (error) {
        res.status(500).send({ message: "An error occurred." });
    }
};

exports.verifyPasswordResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) { return res.status(400).send({ message: "Email and OTP are required." }); }

        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
        const user = await User.findOne({
            where: { email, resetPasswordToken: hashedOtp, resetPasswordExpires: { [Op.gt]: Date.now() } }
        });

        if (!user) {
            return res.status(400).send({ message: "The OTP is invalid or has expired." });
        }

        const tempToken = jwt.sign({ id: user.id, purpose: 'password-reset' }, process.env.JWT_SECRET, { expiresIn: '10m' });
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).send({ 
            message: "OTP verified successfully. You can now set a new password.",
            data: { tempToken }
        });
    } catch (error) {
        res.status(500).send({ message: "An error occurred." });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { tempToken, password } = req.body;
        if (!tempToken || !password) { return res.status(400).send({ message: "A temporary token and a new password are required." }); }
        if (password.length < 8) { return res.status(400).send({ message: "Password must be at least 8 characters long." }); }

        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch (jwtError) {
            return res.status(401).send({ message: "The temporary token is invalid or has expired." });
        }

        if (decoded.purpose !== 'password-reset') {
            return res.status(401).send({ message: "Invalid token purpose." });
        }

        const user = await User.findByPk(decoded.id);
        if (!user) { return res.status(404).send({ message: "User not found." }); }

        user.password = await bcrypt.hash(password, 10);
        await user.save();

        res.status(200).send({ message: "Your password has been reset successfully." });
    } catch (error) {
        res.status(500).send({ message: "An error occurred." });
    }
};

    exports.socialLoginSuccess = (req, res) => {
    const user = req.user;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: 86400 });
    res.redirect(`${process.env.CLIENT_URL}/social-login-success?token=${token}`);
};