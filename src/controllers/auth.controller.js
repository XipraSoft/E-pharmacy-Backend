const crypto = require('crypto'); 
const sendEmail = require('../utils/email'); 
const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const { Op } = require('sequelize');

const User = db.User;


// ... saare imports ...

// REGISTER (Updated)
// ... saare imports waise hi rahenge ...

// File: src/controllers/auth.controller.js

exports.register = async (req, res) => {
    try {
        // Step 1: Request ki body se Sahi data nikalna ('username' ke bajaye 'name' aur 'phone')
        const { name, email, phone, password } = req.body;

        // Step 2: Data Validation (name aur phone ke liye bhi)
        if (!name || !email || !phone || !password) {
            return res.status(400).send({ message: "Error: Name, email, phone, aur password zaroori hain." });
        }
        if (password.length < 8) {
            return res.status(400).send({ message: "Error: Password kam se kam 8 huroof ka hona chahiye." });
        }
        
        // Step 3: Check karna ke kahin email pehle se to maujood nahi hai
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(409).send({ message: "Error: Email pehle se register hai." });
        }

        // Step 4: Password ko hash karna
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Step 5: OTP banana aur hash karna
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        // Step 6: Naye user ko database mein create karna ('username' ke bajaye 'name' aur 'phone')
        const newUser = await User.create({ 
            name: name, 
            email: email, 
            phone: phone,
            password: hashedPassword, 
            verificationToken: hashedOtp
        });

        // Step 7: Email bhejna
        const message = `E-Pharmacy par register karne ke liye aapka verification code hai: ${otp}`;
        await sendEmail({
            email: newUser.email,
            subject: 'Apna Email Verify Karein',
            message
        });

        // Step 8: Kamyabi ka response
        res.status(201).send({ message: "Registration kamyab! Apne email ko verify karne ke liye inbox check karein." });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// NAYA FUNCTION: Verify OTP (Updated)
exports.verifyOtp = async (req, res) => {
    try {
        // 1. User se email aur OTP lena (body se)
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).send({ message: "Email aur OTP zaroori hain."});
        }

        // 2. OTP ko hash karna taake database se compare kar sakein
        // SAHI LINE
const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        // 3. User ko email aur hashed OTP se dhoondna
        const user = await User.findOne({
            where: {
                email: email,
                verificationToken: hashedOtp
            }
        });

        if (!user) {
            return res.status(400).send({ message: "Aapka dia hua OTP ghalat hai." });
        }
        
        // (Optional: Aap yahan expiry check bhi laga sakte hain)

        // 4. User ko verify karna
        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.status(200).send({ message: "Email kamyabi se verify ho gaya! Ab aap login kar sakte hain." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


// LOGIN (Updated)
// Ismein koi tabdeeli nahi hogi, lekin tasdeeq kar lein ke yeh check maujood hai
exports.login = async (req, res) => {
    try {
        console.log("Step 1: Login function shuru hua.");

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ message: "Error: Email aur password zaroori hain." });
        }

        console.log("Step 2: Database se user dhoondne ja raha hai...");
        const user = await User.findOne({ where: { email: email } });
        
        // Agar user nahi mila
        if (!user) {
            console.log("Step 2.1: User nahi mila. Response bhej raha hai.");
            return res.status(404).send({ message: "Error: Is email ke saath koi user nahi mila." });
        }
        console.log("Step 3: User mil gaya. ID:", user.id);

        // Nayi check: Kya user verified hai?
        if (!user.isVerified) {
            console.log("Step 3.1: User verified nahi hai. Response bhej raha hai.");
            return res.status(403).send({ message: "Login na-kamyab. Pehle apna email verify karein." });
        }
        console.log("Step 4: User verified hai. Password compare karne ja raha hai...");

        const isPasswordCorrect = bcrypt.compareSync(password, user.password);
        
        // Agar password ghalat hai
        if (!isPasswordCorrect) {
            console.log("Step 4.1: Password ghalat hai. Response bhej raha hai.");
            return res.status(401).send({ accessToken: null, message: "Error: Password ghalat hai." });
        }
        console.log("Step 5: Password sahi hai. Token banane ja raha hai...");

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });
        console.log("Step 6: Token ban gaya. Final response bhej raha hai...");

        res.status(200).send({
            id: user.id,
            username: user.username,
            accessToken: token
        });

    } catch (error) {
        console.error("LOGIN FUNCTION MEIN ERROR AAYA:", error);
        res.status(500).send({ message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {

     console.log("Controller ke andar req.body ki value:", req.body);

    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user) {
            return res.status(404).send({ message: 'Is email ke saath koi user nahi mila.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        user.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        const message = `Aapka password reset karne ke liye OTP hai: ${otp}\n\nYeh OTP sirf 10 minute ke liye valid hai.`;
        
        await sendEmail({
            email: user.email,
            subject: 'Aapka Password Reset OTP',
            message
        });

        res.status(200).send({ message: 'OTP aapke email par bhej diya gaya hai!' });

    } catch (err) {
        const user = await User.findOne({ where: { email: req.body.email } });
        if(user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
        }
        return res.status(500).send({ message: 'Email bhejne mein error aayi.' });
    }
};

// ==========================================================
// RESEND OTP FUNCTION
// ==========================================================
exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).send({ message: "Email zaroori hai."});
        }

        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).send({ message: "Is email ke saath koi user nahi mila." });
        }

        // Check karein ke user pehle se verified to nahi hai
        if (user.isVerified) {
            return res.status(400).send({ message: "Yeh account pehle se hi verified hai." });
        }

        // Naya OTP banana aur save karna
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
        
        user.verificationToken = hashedOtp;
        // (Optional) Aap expiry time bhi dobara set kar sakte hain
        await user.save();

        // Email bhejna
        const message = `Aapka naya verification code hai: ${otp}`;
        await sendEmail({
            email: user.email,
            subject: 'Aapka Naya Verification Code',
            message
        });

        res.status(200).send({ message: "Naya OTP aapke email par bhej diya gaya hai." });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => { 
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).send({ message: "Email, OTP, aur naya password zaroori hain."});
        }
        if (password.length < 8) {
            return res.status(400).send({ message: "Password kam se kam 8 huroof ka hona chahiye." });
        }

// SAHI LINE
const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');        
        const user = await User.findOne({
            where: {
                email: email,
                resetPasswordToken: hashedOtp,
                resetPasswordExpires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).send({ message: 'OTP ghalat hai ya expire ho chuka hai.' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).send({ message: 'Password kamyabi se reset ho gaya hai!' });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }};