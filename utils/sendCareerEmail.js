// utils/sendEmail.js
const { SendMailClient } = require("zeptomail");

const sendCareerEmail = async ({ to, subject, html }) => {
  const client = new SendMailClient({
    url: "https://api.zeptomail.com/v1.1/email",
    token: process.env.ZEPTOMAIL_TOKEN,
  });

  try {
    await client.sendMail({
      from: {
        address: "career@pickupmanng.ng",
        name: "Pickupman Careers", // human-friendly name
      },
      to: [{ email_address: { address: to } }],
      subject,
      htmlbody: html,
    });
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (err) {
    console.error("Error sending email:", err);
    return false;
  }
};
module.exports = sendCareerEmail;
