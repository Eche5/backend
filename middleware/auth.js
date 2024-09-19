const passport = require("../config/passport");
const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  passport.authenticate("jwt", (err, user, info) => {
    if (err) {
      return res.status(400).json({
        success: false,
        code: 400,
        status: "error",
        data: {
          msg: "Authentication failed",
          error: err.message,
        },
      });
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        code: 401,
        status: "error",
        data: {
          msg: "User is not authenticated",
          info,
        },
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};
