/*const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const db = require('../models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = db.User;


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        const [user, created] = await User.findOrCreate({
            where: { email: profile.emails[0].value },
            defaults: {
                name: profile.displayName,
                email: profile.emails[0].value,
                password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
                isVerified: true 
            }
        });
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
  }
));


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
            return done(new Error("Email can't be fetched from facebook"), null);
        }

        const userEmail = profile.emails[0].value;
        const userName = profile.displayName;

        const [user, created] = await User.findOrCreate({
            where: { email: userEmail },
            defaults: {
                name: userName,
                email: userEmail,
                password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
                isVerified: true 
            }
        });

        return done(null, user);

    } catch (error) {
        return done(error, null);
    }
  }
));
    */

