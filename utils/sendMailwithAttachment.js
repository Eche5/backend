// utils/sendEmail.js
const { SendMailClient } = require("zeptomail");
const fs = require("fs");

const sendMailwithAttachment = async ({
  to,
  subject,
  html,
  attachments = [],
}) => {
  console.log(subject, to, html);
  const client = new SendMailClient({
    url: "https://api.zeptomail.com/v1.1/email",
    token: process.env.ZEPTOMAIL_TOKEN,
  });

  try {
    await client.sendMail({
      from: {
        address: process.env.EMAIL,
        name: "noreply@pickupmanng",
      },
      to: [{ email_address: { address: to } }],
      subject,
      htmlbody: html,
      attachments: attachments.map((file) => ({
        name: file.originalname,
        content: file.buffer.toString("base64"), // convert buffer to base64
        mime_type: file.mimetype,
      })),
    });

    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (err) {
    console.error("Error sending email:", err);
    return false;
  }
};

module.exports = sendMailwithAttachment;
