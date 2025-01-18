const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { jwt_secret } = require("../config");
const Users = require("../models/users");
const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = jwt_secret;

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    const user = await Users.findAll({
      where: {
        id: jwt_payload._id,
      },
    });

    if (user) {
      return done(null, user[0]);
    } else {
      return done(null, false);
    }
  })
);

module.exports = passport;
