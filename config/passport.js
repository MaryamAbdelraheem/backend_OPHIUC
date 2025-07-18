const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Patient } = require('../models/patientModel');

passport.use(
  new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let patient = await Patient.findOne({ where: { email: profile.emails[0].value } });

        if (!patient) {
          patient = await Patient.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            isComplete: false,
          });
        }

        done(null, patient);
      } catch (err) {
        done(err, false);
      }
    }
  )
);