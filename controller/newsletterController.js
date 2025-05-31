const { validationResult } = require("express-validator");

const nodemailer = require("nodemailer");
const Users = require("../models/users");
const Newsletter = require("../models/newsLetter");

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
      await sendSubscriptionConfirmation(email);
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

const sendSubscriptionConfirmation = async (subscriber) => {
  const mailContent = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Welcome to Pickupman Newsletter</title>
      <meta name="color-scheme" content="light" />
      <meta name="supported-color-schemes" content="light" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased; color: #333333;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; padding: 20px;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 100%;">
              
              <!-- Header -->
              <tr>
                <td style="padding: 30px 40px; background: linear-gradient(135deg, #74787e 0%,  #74787e 100%);">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="text-align: left;">
                        <img
                          src="https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Pickupman%206.png?alt=media&token=acc0ed05-77de-472e-a12a-2eb2d6fbbb9a"
                          width="140"
                          height="46"
                          alt="Pickupman Logo"
                          style="display: block;"
                        />
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 40px 40px 20px;">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td>
                        <h1 style="color: #333333; font-size: 24px; font-weight: 600; margin: 0 0 20px; text-align: left;">
                          Welcome to Pickupman Newsletter!
                        </h1>
                        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                          Dear <strong>${
                            subscriber?.first_name || "there"
                          }</strong>,
                        </p>
                        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                          Thank you for subscribing to the Pickupmanng newsletter! You're now part of our community and will receive the latest updates on our services, promotions, and logistics tips directly to your inbox.
                        </p>
                        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                          We're excited to have you on board and look forward to serving your logistics needs.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 30px;">
                        <table align="center" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                          <tr>
                            <td style="background-color: #333333; border-radius: 6px; text-align: center;">
                              <a href="https://www.pickupmanng.ng" style="display: inline-block; padding: 14px 30px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px;">
                                Visit Our Website
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding: 0 40px;">
                  <div style="height: 1px; background-color: #eeeeee;"></div>
                </td>
              </tr>

              <!-- Services Section -->
              <tr>
                <td style="padding: 30px 40px;">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td>
                        <h2 style="color: #333333; font-size: 18px; font-weight: 600; margin: 0 0 20px;">
                          Our Services
                        </h2>
                        <table width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tr valign="top">
                            <td width="33%" style="padding-right: 15px;">
                              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center;">
                                <img src="https://cdn-icons-png.flaticon.com/512/2271/2271113.png" width="48" height="48" alt="Cargo" style="margin-bottom: 10px;" />
                                <h3 style="color: #333333; font-size: 16px; margin: 0 0 10px;">Cargo Shipping</h3>
                                <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">Reliable cargo shipping from Nigeria to the UK</p>
                              </div>
                            </td>
                            <td width="33%" style="padding-right: 15px;">
                              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center;">
                                <img src="https://cdn-icons-png.flaticon.com/512/2830/2830312.png" width="48" height="48" alt="Express" style="margin-bottom: 10px;" />
                                <h3 style="color: #333333; font-size: 16px; margin: 0 0 10px;">Express Delivery</h3>
                                <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">Fast and efficient delivery services</p>
                              </div>
                            </td>
                            <td width="33%">
                              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center;">
                                <img src="https://cdn-icons-png.flaticon.com/512/1356/1356594.png" width="48" height="48" alt="Tracking" style="margin-bottom: 10px;" />
                                <h3 style="color: #333333; font-size: 16px; margin: 0 0 10px;">Real-time Tracking</h3>
                                <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">Track your shipments in real-time</p>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Connect With Us -->
              <tr>
                <td style="padding: 0 40px 30px;">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td>
                        <h2 style="color: #333333; font-size: 18px; font-weight: 600; margin: 0 0 20px;">
                          Connect With Us
                        </h2>
                        <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                          Follow us on social media for the latest updates and promotions:
                        </p>
                        <table cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 20px;">
                          <tr>
                            <td style="padding-right: 15px;">
                              <a href="https://www.facebook.com/share/1BjffnLhMF/?mibextid=wwXIfr" style="text-decoration: none; color: #333333;">
                                <img src="https://cdn4.iconfinder.com/data/icons/social-media-icons-the-circle-set/48/facebook_circle-512.png" width="32" height="32" alt="Facebook" style="display: block;" />
                              </a>
                            </td>
                            <td style="padding-right: 15px;">
                              <a href="https://x.com/pickupmanng?s=21" style="text-decoration: none; color: #333333;">
                                <img src="https://cdn4.iconfinder.com/data/icons/social-media-icons-the-circle-set/48/twitter_circle-512.png" width="32" height="32" alt="Twitter" style="display: block;" />
                              </a>
                            </td>
                            <td style="padding-right: 15px;">
                              <a href="https://www.instagram.com/pickupmanng?igsh=cXp6MG5vcWhpd3Ft&utm_source=qr" style="text-decoration: none; color: #333333;">
                                <img src="https://cdn4.iconfinder.com/data/icons/social-media-icons-the-circle-set/48/instagram_circle-512.png" width="32" height="32" alt="Instagram" style="display: block;" />
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color:  #74787e; text-align: center;">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="text-align: center; padding-bottom: 20px;">
                        <img
                          src="https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Pickupman%206.png?alt=media&token=acc0ed05-77de-472e-a12a-2eb2d6fbbb9a"
                          width="120"
                          height="40"
                          alt="Pickupman Logo"
                          style="display: inline-block;"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #ffffff; font-size: 14px; line-height: 1.6; text-align: center;">
                        <p style="margin: 0 0 10px;">
                          Pickupmanng – Reliable cargo and logistics solutions across Nigeria.
                        </p>
                        <p style="margin: 0 0 10px; color: #aaaaaa; font-size: 13px;">
                          © ${new Date().getFullYear()} Pickupmanng. All rights reserved.
                        </p>
                        <p style="margin: 0; color: #aaaaaa; font-size: 13px;">
                          <a href="https://www.pickupmanng.ng/privacy" style="color: #aaaaaa; text-decoration: underline;">Privacy Policy</a> | 
                          <a href="https://www.pickupmanng.ng/terms" style="color: #aaaaaa; text-decoration: underline;">Terms of Service</a> | 
                          <a href="https://www.pickupmanng.ng/unsubscribe?email=${
                            subscriber?.email || ""
                          }" style="color: #aaaaaa; text-decoration: underline;">Unsubscribe</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
        <!-- Address and Unsubscribe Info -->
        <tr>
          <td style="padding: 20px 0; text-align: center; color: #999999; font-size: 12px;">
            <p style="margin: 0 0 5px;">
              Pickupmanng, Lagos, Nigeria
            </p>
            <p style="margin: 0;">
              You're receiving this email because you subscribed to our newsletter.
              <a href="https://www.pickupmanng.ng/unsubscribe?email=${
                subscriber?.email || ""
              }" style="color: #666666;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  const message = {
    from: process.env.EMAIL,
    to: subscriber.email || subscriber,
    subject: "Welcome to Pickupmanng Newsletter!",
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
    console.log("Subscription email sent successfully:", info.accepted[0]);
    return true;
  } catch (err) {
    console.error("Error sending subscription email:", err);
    return false;
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
      await sendUnsubscriptionEmail(email);
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

const sendUnsubscriptionEmail = async (subscriber) => {
  const mailContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Unsubscribed from Pickupman Newsletter</title>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased; color: #333333;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; padding: 20px;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 100%;">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 30px 40px; background: linear-gradient(135deg, #74787e 0%, #1a1a1a 100%);">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="text-align: left;">
                          <img
                            src="https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Pickupman%206.png?alt=media&token=acc0ed05-77de-472e-a12a-2eb2d6fbbb9a"
                            width="140"
                            height="46"
                            alt="Pickupman Logo"
                            style="display: block;"
                          />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
  
                <!-- Main Content -->
                <tr>
                  <td style="padding: 40px 40px 20px;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td>
                          <h1 style="color: #333333; font-size: 24px; font-weight: 600; margin: 0 0 20px; text-align: left;">
                            You've Been Unsubscribed
                          </h1>
                          <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                            Dear <strong>${
                              subscriber?.first_name || "there"
                            }</strong>,
                          </p>
                          <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                            We've processed your request and you've been successfully unsubscribed from Pickupmanng's newsletter. You'll no longer receive marketing emails from us.
                          </p>
                          <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                            We're sorry to see you go. If you have any feedback on how we could improve our communications, please let us know by replying to this email.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
  
                <!-- Divider -->
                <tr>
                  <td style="padding: 0 40px;">
                    <div style="height: 1px; background-color: #eeeeee;"></div>
                  </td>
                </tr>
  
                <!-- Additional Content -->
                <tr>
                  <td style="padding: 30px 40px;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td>
                          <h2 style="color: #333333; font-size: 18px; font-weight: 600; margin: 0 0 20px;">
                            Still want to hear from us?
                          </h2>
                          <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                            You can follow us on social media to stay updated with our latest services and promotions:
                          </p>
                          <table cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 20px;">
                            <tr>
                              <td style="padding-right: 15px;">
                                <a href="https://www.facebook.com/share/1BjffnLhMF/?mibextid=wwXIfr" style="text-decoration: none; color: #333333;">
                                  <img src="https://cdn4.iconfinder.com/data/icons/social-media-icons-the-circle-set/48/facebook_circle-512.png" width="32" height="32" alt="Facebook" style="display: block;" />
                                </a>
                              </td>
                              <td style="padding-right: 15px;">
                                <a href="https://x.com/pickupmanng?s=21" style="text-decoration: none; color: #333333;">
                                  <img src="https://cdn4.iconfinder.com/data/icons/social-media-icons-the-circle-set/48/twitter_circle-512.png" width="32" height="32" alt="Twitter" style="display: block;" />
                                </a>
                              </td>
                              <td style="padding-right: 15px;">
                                <a href="https://www.instagram.com/pickupmanng?igsh=cXp6MG5vcWhpd3Ft&utm_source=qr" style="text-decoration: none; color: #333333;">
                                  <img src="https://cdn4.iconfinder.com/data/icons/social-media-icons-the-circle-set/48/instagram_circle-512.png" width="32" height="32" alt="Instagram" style="display: block;" />
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
  
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #74787e; text-align: center;">
                    <table width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="text-align: center; padding-bottom: 20px;">
                          <img
                            src="https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Pickupman%206.png?alt=media&token=acc0ed05-77de-472e-a12a-2eb2d6fbbb9a"
                            width="120"
                            height="40"
                            alt="Pickupman Logo"
                            style="display: inline-block;"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style="color:rgb(255, 255, 255); font-size: 14px; line-height: 1.6; text-align: center;">
                          <p style="margin: 0 0 10px; color:rgb(255, 255, 255);">
                            Pickupmanng – Reliable cargo and logistics solutions across Nigeria.
                          </p>
                          <p style="margin: 0 0 10px; color: #aaaaaa; font-size: 13px;">
                            © ${new Date().getFullYear()} Pickupmanng. All rights reserved.
                          </p>
                          <p style="margin: 0; color: #aaaaaa; font-size: 13px;">
                            <a href="https://www.pickupmanng.ng/privacy" style="color: #aaaaaa; text-decoration: underline;">Privacy Policy</a> | 
                            <a href="https://www.pickupmanng.ng/terms" style="color: #aaaaaa; text-decoration: underline;">Terms of Service</a> | 
                            <a href="mailto:Support@Pickupmanng.ng" style="color: #aaaaaa; text-decoration: underline;">Contact Us</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
  
              </table>
            </td>
          </tr>
          <!-- Address and Unsubscribe Info -->
          <tr>
            <td style="padding: 20px 0; text-align: center; color: #999999; font-size: 12px;">
              <p style="margin: 0 0 5px;">
                Pickupman NG, Lagos, Nigeria
              </p>
              <p style="margin: 0;">
                This email was sent to ${
                  subscriber?.email || "you"
                } because you were subscribed to our newsletter.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `;

  const message = {
    from: process.env.EMAIL,
    to: subscriber,
    subject: "You have unsubscribed from Pickupmanng",
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
    console.log("Unsubscription email sent:", info.accepted[0]);
    return true;
  } catch (err) {
    console.error("Error sending unsubscription email:", err);
    return false;
  }
};

exports.contactusform = async (req, res) => {
  const { email, name, message, subject, phonenumber } = req.body;

  // 1. Basic validation
  if (!email || !name || !message || !subject || !phonenumber) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // 2. Create transporter (e.g., ZeptoMail or Gmail)
  const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com", // or smtp.gmail.com, etc.
    port: 587,
    auth: {
      user: "emailapikey",
      pass: process.env.PASSWORD,
    },
  });

  // 3. Define mail options
  const mailOptions = {
    from:process.env.EMAIL, // ✅ Must be a verified sender
    to:  '"Pickupmanng Contact" <Support@pickupmanng.ng>', // your admin email
    subject: `Contact Form-${subject}`,
    html: `
      <h3>Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Name:</strong> ${phonenumber}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  // 4. Send email
  try {
    await transporter.sendMail(mailOptions);
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
