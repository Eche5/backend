const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { jwt_secret, jwt_expires } = require("../config");
const Mailgen = require("mailgen");
const crypto = require("crypto");

const nodemailer = require("nodemailer");
const Users = require("../models/users");
const { Op } = require("sequelize");

exports.createUser = async (req, res) => {
  const { email, password, first_name, last_name, phonenumber, role } =
    req.body;

  const errors = validationResult(req);
  console.log(errors.isEmpty());
  if (!errors.isEmpty()) {
    return res.status(401).json({
      success: false,
      code: 422,
      status: "error",
      data: errors.array()[0],
    });
  }

  try {
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
      await sendVerification(user);
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
    // console.log(error);
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

const sendVerification = async (user) => {
  const link = `https://www.pickupmanng.ng/verify/${user.id}`;

  const mailContent = `
 <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f3f3;">
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="background-color: #f3f3f3; padding: 20px;"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="600"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="background-color: #ffffff; border-radius: 8px; overflow: hidden;"
          >
            <!-- Header -->
            <tr style="background-color: #74787e;">
              <td style="padding: 15px;">
                <table width="100%">
                  <tr>
                    <td style="text-align: left;">
                      <img
                        src="https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Pickupman%206.png?alt=media&token=acc0ed05-77de-472e-a12a-2eb2d6fbbb9a"
                        width="120"
                        height="40"
                        alt="Pickupman Logo"
                        style="display: block; margin: 0;"
                      />
                    </td>
                   <td style="text-align: right;">
                     <p style="color: white; font-size: 14px; margin: 0;">
                       <a href="mailto:Support@Pickupmanng.ng" style="color: white; text-decoration: none;">
                          Support@Pickupmanng.ng
                       </a>
                     </p>
                    </td>

                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 40px; text-align: center;">
                <h2 style="color: #333; font-size: 16px; margin-bottom: 20px;">
                  Pickupmanng Account Verification
                </h2>
                <p style="color: #555; font-size: 18px;">Hi <strong>${user?.first_name}</strong>,</p>
                <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
                  Thank you for signing up! Please verify your email address by
                  clicking the button below.
                </p>
                <a
                  href="${link}"
                  style="display: inline-block; padding: 12px 24px; background-color: #333; color: white; text-decoration: none; font-size: 16px; border-radius: 5px; margin-bottom: 20px;"
                >
                  Verify Email
                </a>
                <p style="color: #777; font-size: 14px; margin-top: 10px;">
                  If you didn’t create an account, you can ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr style="background-color: #74787e;">
              <td style="padding: 20px; text-align: center; color: white;">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Pickupman%206.png?alt=media&token=acc0ed05-77de-472e-a12a-2eb2d6fbbb9a"
                  width="120"
                  height="40"
                  alt="Pickupman Logo"
                  style="margin-bottom: 10px;"
                />
                <p style="font-size: 14px;">
                  Pickupman NG is a leading cargo and shipping company in
                  Nigeria, specializing in efficient, reliable logistics
                  solutions.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
 `; 


  const message = {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Verify your email",
    html: mailContent,
  };

  const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    auth: {
      user: "emailapikey",
      pass: process.env.PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail(message);
    console.log("Email sent successfully:", info.accepted[0]);
    return true;
  } catch (err) {
    console.error("Error sending email:", err);
  }
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
      await sendVerification(user[0]);
      return res.status(200).json({
        message: "success",
      });
    }
  } catch (error) {
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
      console.log(id);
      const updatedUser = await Users.update(
        { is_verified: true },
        {
          where: {
            id: id,
          },
        }
      );
      console.log(updatedUser);
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
      await sendLoginDetails(email, first_name, password);
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

const sendLoginDetails = async (email, first_name, password) => {
  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Pickupmanng",
      link: "https://www.pickupmanng.ng",
      copyright: "Copyright © 2024 Pickupmanng. All rights reserved.",
      logo: "https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Pickupman%206.png?alt=media&token=acc0ed05-77de-472e-a12a-2eb2d6fbbb9a",
      logoHeight: "30px",
    },
  });

  let response = {
    body: {
      name: first_name,
      intro: "Welcome to Pickupmanng! Below are your login credentials.",
      table: {
        data: [
          {
            item: "Email",
            description: email,
          },
          {
            item: "Password",
            description: password,
          },
        ],
      },
      action: {
        instructions: "You can log in to your account using the button below:",
        button: {
          color: "#22BC66",
          text: "Login to Pickupmanng",
          link: "https://www.pickupmanng.ng",
        },
      },
      outro:
        "For security reasons, we recommend changing your password after logging in.",
      signature: "Best Regards",
    },
  };

  let mail = MailGenerator.generate(response);

  let message = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your Pickupmanng Login Details",
    html: mail,
  };

  const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    auth: {
      user: "emailapikey",
      pass: process.env.PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail(message);
    console.log("Email sent successfully:", info.accepted[0]);
    return true;
  } catch (err) {
    console.error("Error sending email:", err);
    return false;
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    console.log(errors.isEmpty());
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
      console.log(tokenEmail);
      await sendresetTokenemail(email, resetToken);
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

const sendresetTokenemail = async (email, resetToken) => {
  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Pickupmanng",
      link: "https://pickupmanng.ng/",
      copyright: "Copyright © 2024 Pickupmanng. All rights reserved.",
      logo: "https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Pickupman%206.png?alt=media&token=acc0ed05-77de-472e-a12a-2eb2d6fbbb9a",
      logoHeight: "30px",
    },
  });

  let response = {
    body: {
      name: email,
      intro:
        "You recently requested a password reset for your Pickupmanng account.",
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#22BC66",
          text: "Reset Password",
          link: `https://www.pickupmanng.ng/resetpassword/${resetToken}`,
        },
      },
      signature: "Best regards",
      outro: "If you did not request this, you can safely ignore this email.",
    },
  };

  let mail = MailGenerator.generate(response);
  let message = {
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset Request - Pickupmanng",
    html: mail,
  };

  const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    auth: {
      user: "emailapikey",
      pass: process.env.PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail(message);
    console.log("Email sent successfully:", info.accepted[0]);
    return true;
  } catch (err) {
    console.error("Error sending email:", err.message || err);
    return false;
  }
};
