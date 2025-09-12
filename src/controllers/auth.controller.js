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
            return res.status(400).send({ message: "Error: Please provide a valid name, email, phone, and a password of at least 8 characters." });
        }
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).send({ message: "Error: This email address is already registered." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
        const newUser = await User.create({ name, email, phone, password: hashedPassword, verificationToken: hashedOtp });
        const message = `Your verification code for E-Pharmacy is: ${otp}`;
        await sendEmail({ email: newUser.email, subject: 'Verify Your Email', message });
        res.status(201).send({ message: "Registration successful! An OTP has been sent to your email.", data: { email: newUser.email } });
    } catch (error) {
        res.status(500).send({ message: "An error occurred during registration." });
    }
};

exports.handleOtp = async (req, res) => {
    try {
        const { email, otp, type } = req.body;
        if (!email || !type) {
            return res.status(400).send({ message: "Email and type are required." });
        }
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).send({ message: "No user found with this email address." });
        }
        if (!otp) { 
            if (type === 'registration' && user.isVerified) {
                return res.status(400).send({ message: "This account is already verified." });
            }
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const hashedOtp = crypto.createHash('sha256').update(newOtp).digest('hex');
            let subject, message;
            if (type === 'registration') {
                user.verificationToken = hashedOtp;
                subject = 'Your New Verification Code';
                message = `Your new verification code is: ${newOtp}`;
            } else {
                user.resetPasswordToken = hashedOtp;
                user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
                subject = 'Your Password Reset OTP';
                message = `Your new OTP to reset password is: ${newOtp}`;
            }
            await user.save();
            await sendEmail({ email: user.email, subject, message });
            return res.status(200).send({ message: "A new OTP has been sent to your email." });
        }
        if (otp) { 
            const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
            const whereCondition = { email };
            if (type === 'registration') {
                whereCondition.verificationToken = hashedOtp;
            } else {
                whereCondition.resetPasswordToken = hashedOtp;
                whereCondition.resetPasswordExpires = { [Op.gt]: Date.now() };
            }
            const validUser = await User.findOne({ where: whereCondition });
            if (!validUser) {
                return res.status(400).send({ message: "The OTP is invalid or has expired." });
            }
            if (type === 'registration') {
                validUser.isVerified = true;
                validUser.verificationToken = null;
                await validUser.save();
                return res.status(200).send({ message: "Email verified successfully! You can now log in." });
            }
            if (type === 'password_reset') {
                validUser.resetPasswordToken = undefined;
                validUser.resetPasswordExpires = undefined;
                await validUser.save();
                const resetToken = jwt.sign({ id: validUser.id, purpose: 'final-password-reset' }, process.env.JWT_SECRET, { expiresIn: '10m' });
                return res.status(200).send({ message: "OTP verified. You can now set a new password.", data: { resetToken } });
            }
        }
    } catch (error) {
        res.status(500).send({ message: "An error occurred." });
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

        

        res.status(200).send({
            message: "Login successful!",
            data: { 
                 id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified,
                accessToken: token 
            }
        });

    } catch (error) {
        console.error("Error in login function", error);
        res.status(500).send({ message: "An error occurred during login. Please try again later." });
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
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        await sendEmail({ email: user.email, subject: 'Your Password Reset OTP', message: `Your OTP to reset password is: ${otp}` });
        res.status(200).send({ message: "An OTP has been sent to your email.", data: { email: user.email } });
    } catch (error) {
        res.status(500).send({ message: "An error occurred." });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, password } = req.body;
        if (!resetToken || !password || password.length < 8) {
            return res.status(400).send({ message: "A valid reset token and a new password of at least 8 characters are required." });
        }
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (jwtError) {
            return res.status(401).send({ message: "The reset session has expired. Please try again." });
        }
        if (decoded.purpose !== 'final-password-reset') {
            return res.status(401).send({ message: "Invalid token." });
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
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.redirect(`${process.env.CLIENT_URL}/login/success?token=${token}`);
};