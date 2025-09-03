const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { jwt_secret, jwt_expires } = require("../config");
const Mailgen = require("mailgen");
const crypto = require("crypto");

const nodemailer = require("nodemailer");
const Users = require("../models/users");
const { Op } = require("sequelize");
const Newsletter = require("../models/newsLetter");
const {
  generateResetEmailTemplate,
} = require("../utils/emails/sendResetEmail");
const sendEmail = require("../utils/sendMail");
const {
  sendVerificationEmail,
} = require("../utils/emails/sendVerificationEmail");
const { sendLoginDetailsEmail } = require("../utils/emails/sendLoginDetails");
exports.createUser = async (req, res) => {
  const { email, password, first_name, last_name, phonenumber, role } =
    req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({
      success: false,
      code: 422,
      status: "error",
      data: errors.array()[0],
    });
  }

  try {
    const existingsubscriber = await Newsletter.findAll({
      where: {
        email: email,
      },
    });
    if (existingsubscriber.length === 1) {
      await Newsletter.destroy({
        where: { email: email },
      });
    }
    const existinguser = await Users.findAll({
      where: {
        email: email,
      },
    });
    if (existinguser.length === 1) {
      return res.status(404).json({
        success: false,
        data: { msg: "User exists with this email" },
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Users.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phonenumber,
      role,
    });
    if (user) {
      const { subject, html } = sendVerificationEmail(user);
      await sendEmail({ to: email, subject, html });
      return res.status(201).json({
        success: true,
        user,
        message: "User created successfully",
      });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const generatePassword = () => {
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const specialChars = "@$!%*?&_";

  const allChars = lowerCase + upperCase + digits + specialChars;

  let password = "";
  password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
  password += upperCase[Math.floor(Math.random() * upperCase.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  for (let i = 4; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
};

exports.resendVerificationemail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findAll({ where: { email: email } });
    if (!user) {
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    } else {
      const { subject, html } = sendVerificationEmail(user[0]);
      await sendEmail({ to: email, subject, html });
      return res.status(200).json({
        message: "success",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "failed" });
  }
};
exports.verify = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await Users.findAll({ where: { id: id } });
    if (!user) {
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    } else if (user[0]?.is_verified) {
      return res.status(401).json({
        success: false,
        code: 401,
        status: "error",
        data: { msg: "User already verified" },
      });
    } else {
      await Users.update(
        { is_verified: true },
        {
          where: {
            id: id,
          },
        }
      );
      const token = jwt.sign({ _id: user[0].id }, jwt_secret, {
        expiresIn: jwt_expires,
      });

      res.status(200).json({
        success: true,
        code: 200,
        status: "success",
        data: {
          user: user[0],
          accessToken: token,
          msg: "User logged in successfully",
        },
      });
    }
  } catch (error) {
    return res.status(404).json({
      status: "failed",
      message: "login failed",
    });
  }
};

exports.createTeamMembers = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      code: 422,
      status: "error",
      data: errors.array()[0],
    });
  }
  const { email, first_name, last_name, phonenumber, role } = req.body;

  try {
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Users.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phonenumber,
      role,
    });
    if (!user) {
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    } else {
      const { subject, html } = sendLoginDetailsEmail(
        email,
        first_name,
        password
      );
      await sendEmail({ to: email, subject, html });

      res.status(201).json({
        success: true,
        message: "Team member created successfully",
      });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({
        success: false,
        code: 422,
        status: "error",
        data: errors.array()[0],
      });
    }
    const { email, password } = req.body;
    const user = await Users.findAll({
      where: {
        email: email,
      },
    });
    const match = await bcrypt.compare(password, user[0]?.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        code: 401,
        status: "error",
        data: {
          path: "password",
          msg: "Email or password is incorrect.",
          value: password,
          location: "body",
          type: "field",
        },
      });
    } else if (match && !user[0].is_verified) {
      return res.status(400).json({
        success: false,
        code: 401,
        status: "error",
        data: {
          path: "isverified",
          msg: "please verify your email",
          value: user.is_verified,
          location: "body",
          type: "field",
        },
      });
    } else {
      const token = jwt.sign({ _id: user[0].id }, jwt_secret, {
        expiresIn: jwt_expires,
      });

      return res.status(200).json({
        success: true,
        code: 200,
        status: "success",
        data: {
          user: user[0],
          accessToken: token,
          msg: "User logged in successfully",
        },
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.LogOut = (req, res) => {
  const cookie = req.cookies;

  if (!cookie) return res.sendStatus(204); //No content

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  res.json({ message: "Cookie cleared" });
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        code: 422,
        status: "error",
        data: errors.array()[0],
      });
    }

    const { email } = req.body;

    const user = await Users.findAll({
      where: {
        email: email,
      },
    });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpires = Date.now() + 3600000;
      const tokenEmail = await Users.update(
        {
          resetToken: resetToken,
          resetTokenExpires: Math.floor(resetTokenExpires / 1000),
        },
        {
          where: {
            email: user[0]?.email,
          },
        }
      );
      const { subject, html } = generateResetEmailTemplate(user, resetToken);
      await sendEmail({ to: email, subject, html });
      return res.status(200).json({
        success: true,
        code: 200,
        status: "success",
        data: {
          msg: "Reset link has been successfully sent",
        },
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        code: 422,
        status: "error",
        data: errors.array()[0],
      });
    }

    const { resetToken, password } = req.body;

    // Find user by reset token
    const user = await Users.findAll({
      where: {
        resetToken: resetToken,
        resetTokenExpires: {
          [Op.gt]: Math.floor(Date.now() / 1000), // Token expiration check
        },
      },
    });
    if (!user || user.length === 0) {
      return res.status(400).json({
        success: false,
        code: 401,
        status: "error",
        data: {
          path: "resetToken",
          msg: "Invalid or expired token",
          value: resetToken,
          location: "body",
          type: "field",
        },
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and reset token fields
    await Users.update(
      {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
      { where: { id: user[0]?.id } }
    );

    // Return success response
    return res.status(200).json({
      success: true,
      code: 200,
      status: "success",
      data: { msg: "Password reset was successful" },
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Error resetting password:", error);

    return res.status(500).json({
      success: false,
      code: 500,
      status: "error",
      data: { msg: "An internal server error occurred." },
    });
  }
};
