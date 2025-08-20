const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const db = require('../models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = db.User;


// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        // User ko email se dhoondna ya naya banana
        const [user, created] = await User.findOrCreate({
            where: { email: profile.emails[0].value },
            defaults: {
                name: profile.displayName,
                email: profile.emails[0].value,
                // Social login wale user ke liye ek random, unusable password
                password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
                isVerified: true // Social logins hamesha verified hote hain
            }
        });
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
  }
));

// Facebook Strategy (bilkul waisi hi)
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails'] // Yeh line bohat zaroori hai
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        // Facebook kabhi kabhi email nahi deta, isliye check karna zaroori hai
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
            // Agar email na mile, to error ke saath wapas jao
            return done(new Error("Facebook se email hasil nahi ho saka."), null);
        }

        const userEmail = profile.emails[0].value;
        const userName = profile.displayName;

        // User ko email se dhoondna ya naya banana
        const [user, created] = await User.findOrCreate({
            where: { email: userEmail },
            defaults: {
                name: userName,
                email: userEmail,
                // Social login wale user ke liye ek random, unusable password
                password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
                isVerified: true // Social logins hamesha verified hote hain
            }
        });

        return done(null, user);

    } catch (error) {
        return done(error, null);
    }
  }
));