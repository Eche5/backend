const { validationResult } = require("express-validator");

const nodemailer = require("nodemailer");
const Users = require("../models/users");
const Newsletter = require("../models/newsLetter");
const {
  sendSubscriptionConfirmationEmail,
} = require("../utils/emails/sendSubscriberConfirmationEmail");
const {
  sendUnsubscriptionEmailTemplate,
} = require("../utils/emails/sendUnsubscribeEmail");
const sendEmail = require("../utils/sendMail");
const {
  contactusformTemplate,
} = require("../utils/emails/contactFormTemplate");

exports.subscribeUser = async (req, res) => {
  const { email } = req.body;

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
    const existinguserData = await Users.findAll({
      where: {
        email: email,
      },
    });
    if (existinguserData.length === 1) {
      return res.status(400).json({
        success: false,
        data: { msg: "You are already a member of our community" },
      });
    }
    const existinguser = await Newsletter.findAll({
      where: {
        email: email,
      },
    });
    if (existinguser.length === 1) {
      return res.status(400).json({
        success: false,
        data: { msg: "You are already subscribed to receive newsletters" },
      });
    }
    const user = await Newsletter.create({
      email,
    });
    if (user) {
      const { subject, html } = sendSubscriptionConfirmationEmail(email);
      await sendEmail({ to: email, subject, html });
      return res.status(201).json({
        success: true,
        data: { msg: "Thank you for subscribing to our newsletter!" },
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

exports.unsubscribeUser = async (req, res) => {
  const { email } = req.body;
  console.log(email);
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
    const existinguser = await Newsletter.findAll({
      where: {
        email: email,
      },
    });
    if (existinguser.length === 0) {
      return res.status(404).json({
        success: false,
        data: { msg: "You are not a subscriber to our newsletters" },
      });
    }
    const user = await Newsletter.destroy({
      where: { email: email },
    });
    if (user) {
      const { subject, html } = sendUnsubscriptionEmailTemplate(email);
      await sendEmail({ to: email, subject, html });
      return res.status(201).json({
        success: true,
        user,
        message: "User successfully unsubscribed",
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

exports.contactusform = async (req, res) => {
  const { email, name, message, emailSubject: subject, phonenumber } = req.body;

  // 1. Basic validation
  if (!email || !name || !message || !subject || !phonenumber) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // 4. Send email
  try {
    const { subject, html } = contactusformTemplate(
      email,
      name,
      message,
      emailSubject,
      phonenumber
    );
    await sendEmail({ to: "Support@pickupmanng.ng", subject, html });
    return res
      .status(200)
      .json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("Error sending contact form email:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
};
