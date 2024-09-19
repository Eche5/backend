const passport = require("passport");
const db = require("../utils/db");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { jwt_secret } = require("../config");
const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = jwt_secret;

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [jwt_payload._id],
      (error, results) => {
        if (error) {
          return done(error, false);
        }
        if (results.length > 0) {
          return done(null, results[0]);
        } else {
          return done(null, false);
        }
      }
    );
  })
);

module.exports = passport;
