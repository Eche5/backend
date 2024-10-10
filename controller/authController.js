const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { jwt_secret, jwt_expires } = require("../config");
const db = require("../utils/db");
const Mailgen = require("mailgen");
const nodemailer = require("nodemailer");
exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      code: 422,
      status: "error",
      data: errors.array()[0],
    });
  }
  const { email, password, first_name, last_name, phonenumber, role } =
    req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (email, password, first_name, last_name, phonenumber, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [email, hashedPassword, first_name, last_name, phonenumber, role],
      (error, results) => {
        if (error) {
          console.error("Error inserting user:", error);
          return res
            .status(500)
            .json({ success: false, message: "Database errors" });
        } else {
          const selectQuery = `
       SELECT * FROM users WHERE email = ?
      `;

          db.query(selectQuery, [email], async (error, user) => {
            if (error) {
              console.error("Error inserting user:", error);
              return res
                .status(500)
                .json({ success: false, message: "Database error" });
            }
            await sendVerification(user);

            res.status(201).json({
              success: true,
              user,
              message: "User created successfully",
            });
          });
        }
      }
    );
  } catch (error) {
    console.error("Error creating user:", error);
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
  // Ensure at least one of each type
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
  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Pickupmanng",
      link: "https://mailgen.js/",
      copyright: "Copyright © 2024 pickupmanng. All rights reserved.",
      logo: "https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Pickupman%206.png?alt=media&token=acc0ed05-77de-472e-a12a-2eb2d6fbbb9a",
      logoHeight: "30px",
    },
  });
  const link = `https://pickupman.vercel.app/verify/${user[0].id}`;
  let response = {
    body: {
      name: user[0].first_name,
      intro:
        "We are thrilled to have you join us. Verify your email address to get started and access the resources available on our platform.",
      action: {
        instructions: "Click the button below to verify your account:",
        button: {
          color: "#22BC66",
          text: "Verify your account",
          link,
        },
      },
      signature: "Sincerely",
    },
  };

  let mail = MailGenerator.generate(response);
  let message = {
    from: process.env.EMAIL,
    to: user[0].email,
    subject: "Verify email",
    html: mail,
  };

  const transporter = nodemailer.createTransport({
    host: "mail.pickupmanng.ng",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    const info = await transporter.sendMail(message);
    console.log("Email sent successfully:", info.response);
    return true;
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

exports.resendVerificationemail = async (req, res) => {
  try {
    const { email } = req.body;

    const selectQuery = `
       SELECT * FROM users WHERE email = ?
      `;
    db.query(selectQuery, [email], async (error, user) => {
      if (error) {
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      } else {
        await sendVerification(user);
        return res.status(200).json({
          message: "success",
        });
      }
    });
  } catch (error) {
    return res.status(404).json({ message: "failed" });
  }
};
exports.verify = async (req, res) => {
  try {
    const id = req.params.id;
    const selectQuery = `
       SELECT * FROM users WHERE id = ?
      `;
    db.query(selectQuery, [id], async (error, user) => {
      if (error) {
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      } else {
        const isVerified = 1;
        const updateQuery = "UPDATE users SET isVerified = ? WHERE id = ?";

        db.query(updateQuery, [isVerified, id], (error, user) => {
          if (error) {
            return res
              .status(500)
              .json({ success: false, message: "Database error" });
          }
          const query = `
       SELECT * FROM users WHERE id = ?
      `;
          db.query(query, [id], (error, user) => {
            if (error) {
              return res
                .status(500)
                .json({ success: false, message: "Database error" });
            }
            const token = jwt.sign({ _id: user[0].email }, jwt_secret, {
              expiresIn: jwt_expires,
            });

            const refreshToken = jwt.sign({ _id: user[0].email }, jwt_secret, {
              expiresIn: "7d",
            });

            res.cookie("jwt", refreshToken, {
              httpOnly: true,
              secure: true,
              sameSite: "none",
              maxAge: 7 * 24 * 60 * 60 * 1000,
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
          });
        });
      }
    });
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
    const query = `
      INSERT INTO users (email, password, first_name, last_name, phonenumber, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [email, hashedPassword, first_name, last_name, phonenumber, role],
      async (error, results) => {
        if (error) {
          console.error("Error inserting user:", error);
          return res
            .status(500)
            .json({ success: false, message: "Database error" });
        }
        await sendLoginDetails(email, first_name, password);
        res.status(201).json({
          success: true,
          message: "Team member created successfully",
        });
      }
    );
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
      link: "https://pickupman.vercel.app/",
      copyright: "Copyright © 2024 Pickupmanng. All rights reserved.",
      logo: "https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Pickupman%206.png?alt=media&token=acc0ed05-77de-472e-a12a-2eb2d6fbbb9a",
      logoHeight: "30px",
    },
  });

  // Define the content of the email with login details
  let response = {
    body: {
      name: first_name, // Assuming `user` is an object with a `first_name` field
      intro: "Welcome to Pickupmanng! Below are your login credentials.",
      table: {
        data: [
          {
            item: "Email",
            description: email, // Email from the user object
          },
          {
            item: "Password",
            description: password, // Plain-text password
          },
        ],
      },
      action: {
        instructions: "You can log in to your account using the button below:",
        button: {
          color: "#22BC66", // Button color
          text: "Login to Pickupmanng",
          link: "https://pickupman.vercel.app", // Your login page link
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
    host: "mail.pickupmanng.ng",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    const info = await transporter.sendMail(message);
    console.log("Email sent successfully:", info.response);
    return true;
  } catch (err) {
    console.error("Error sending email:", err);
    return false;
  }
};

exports.login = async (req, res, next) => {
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
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = ?`;
    db.query(query, [email], async (error, user) => {
      if (error) {
      } else {
        if (user.length === 0) {
          return res.status(404).json({
            success: false,
            code: 404,
            status: "error",
            data: {
              path: "email",
              msg: "Email is not registered to a user",
              value: email,
              location: "body",
              type: "field",
            },
          });
        }
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
        } else if (match && user[0].isVerified === 0) {
          return res.status(400).json({
            success: false,
            code: 401,
            status: "error",
            data: {
              path: "isverified",
              msg: "please verify your email",
              value: user.isVerified,
              location: "body",
              type: "field",
            },
          });
        } else {
          const token = jwt.sign({ _id: user[0].email }, jwt_secret, {
            expiresIn: jwt_expires,
          });

          const refreshToken = jwt.sign({ _id: user[0].email }, jwt_secret, {
            expiresIn: "7d",
          });

          res.cookie("jwt", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
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
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });
  const refreshToken = cookies.jwt;

  jwt.verify(refreshToken, jwt_secret, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    const query = `SELECT * FROM users WHERE email = ?`;
    db.query(query, [decoded._id], async (error, user) => {
      if (!user) return res.status(401).json({ message: "User unauthorized" });
      const accessToken = jwt.sign({ _id: user[0].email }, jwt_secret, {
        expiresIn: "7d",
      });

      res.status(200).json({
        success: true,
        code: 200,
        status: "success",
        data: {
          user: user[0],
          accessToken,
          msg: "User session extended",
        },
      });
    });
  });
};
exports.LogOut = (req, res) => {
  const cookie = req.cookies;

  if (!cookie) return res.sendStatus(204); //No content

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  res.json({ message: "Cookie cleared" });
};
