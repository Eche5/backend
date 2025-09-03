// utils/sendEmail.js
import { SendMailClient } from "zeptomail";

export const sendEmail = async ({ to, subject, html }) => {
  const client = new SendMailClient({
    url: "https://api.zeptomail.com/v1.1/email",
    token: process.env.ZEPTOMAIL_TOKEN,
  });

  try {
    await client.sendMail({
      from: {
        address: process.env.EMAIL,
        name: "Pickupmanng",
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
