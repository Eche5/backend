const sendLoginDetailsEmail = (email, first_name, password) => {
  const subject = "Your Pickupmanng Login Details";

  const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #012152; padding: 15px; text-align: center; border-radius: 6px 6px 0 0;">
      <img src="https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Pickupman%206.png?alt=media&token=acc0ed05-77de-472e-a12a-2eb2d6fbbb9a"
           width="120" 
           style="display: block; margin: 0 auto 10px;" 
           alt="Pickupmanng Logo">
      <h1 style="color: #fff; font-size: 18px; margin: 0;">${subject}</h1>
    </div>

    <div style="background-color: #ffffff; padding: 25px; border-radius: 0 0 6px 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
      <p>Dear <strong>${first_name}</strong>,</p>
      <p>Welcome to Pickupmanng! Below are your login credentials:</p>

      <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px; background-color:#f9f9f9;"><strong>Email</strong></td>
          <td style="border: 1px solid #ddd; padding: 10px;">${email}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px; background-color:#f9f9f9;"><strong>Password</strong></td>
          <td style="border: 1px solid #ddd; padding: 10px;">${password}</td>
        </tr>
      </table>

      <p style="margin: 20px 0;">You can log in to your account using the button below:</p>

      <div style="text-align: center; margin: 20px 0;">
        <a href="https://www.pickupmanng.ng" 
           style="background-color: #22BC66; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Login to Pickupmanng
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        For security reasons, we recommend changing your password after logging in.
      </p>

      <p style="margin-top: 20px;">Best Regards,<br><strong>Pickupmanng Team</strong></p>
    </div>

    <div style="background-color: #012152; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 6px 6px; margin-top: 20px;">
      <p style="margin: 0;">Copyright © 2024 Pickupmanng. All rights reserved.</p>
    </div>
  </div>
  `;
  return { subject, html };
};
module.exports = { sendLoginDetailsEmail };
