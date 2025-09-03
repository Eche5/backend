// utils/generateResetEmailTemplate.js
const generateResetEmailTemplate = (user, resetToken) => {
  const subject = "Password Reset Request - Pickupmanng";
  const html = `
     <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #012152; padding: 10px 15px; text-align: center; border-radius: 4px 4px 0 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td style="text-align: center; padding: 5px 0;">
          <img src="https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Your_paragraph_text__1_-removebg-preview.png?alt=media&token=3996a1bd-d6cd-4044-b86e-e6d687c11959" 
               width="120" 
               style="display: block; margin: 0 auto 8px;" 
               alt="Pickupman Logo">
          <h1 style="color: white; font-size: 18px; margin: 0; font-weight: 600; line-height: 1.3;">
            ${subject}
          </h1>
        </td>
      </tr>
    </table>
  </div>
 <div style="background-color: #ffffff; padding: 25px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
    <p style="margin-top: 0;">Dear ${user[0].first_name},</p>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
<p>You recently requested a password reset for your Pickupmanng account. Click the button below to reset your password:</p>
    
    <div style="text-align: center; margin: 25px 0;">
      <a href="https://www.pickupmanng.ng/auth/reset-password?token=${resetToken}" 
         style="background-color: #012152; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; transition: background-color 0.3s;">
        Reset Password
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
      If you didn't request this password reset, please ignore this email or contact support if you have questions.
    </p>
    </div>
    
    <p style="margin-bottom: 0;">Yours sincerely,<br /><strong>Pickupman</strong></p>
  </div>

  <div style="background-color: #012152; color: white; padding: 20px;">
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="padding-bottom: 20px;">
          <table width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td width="40%" style="vertical-align: top; padding-right: 20px;">
                <img src="https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Your_paragraph_text__1_-removebg-preview.png?alt=media&token=3996a1bd-d6cd-4044-b86e-e6d687c11959" width="140" style="display: block; padding-bottom: 10px;" border="0" alt="Pickupman Logo">
                <p style="color: #FFF; font-size: 12px; margin: 0;">
Pickupmanng— Nigeria’s trusted logistics partner for fast, safe, and reliable deliveries.

                </p>
              </td>
              <td width="30%" style="vertical-align: top;">
                <p style="color: #FFF; font-size: 14px; font-weight: bold; margin-top: 0; margin-bottom: 10px;">Links</p>
                <p style="margin: 5px 0;">
                  <a href="https://www.pickupmanng.ng/about-us" style="color: #FFF; text-decoration: none; font-size: 12px;">About Us</a>
                </p>
                <p style="margin: 5px 0;">
                  <a href="https://www.pickupmanng.ng/services" style="color: #FFF; text-decoration: none; font-size: 12px;">Services</a>
                </p>
                <p style="margin: 5px 0;">
                  <a href="https://www.pickupmanng.ng/contact-us" style="color: #FFF; text-decoration: none; font-size: 12px;">Contact Us</a>
                </p>
              </td>
              <td width="30%" style="vertical-align: top;">
                <p style="color: #FFF; font-size: 14px; font-weight: bold; margin-top: 0; margin-bottom: 10px;">Follow Us</p>
                <p style="margin: 5px 0;">
                  <a href="https://www.facebook.com/" target="_blank" style="color: #FFF; text-decoration: none; font-size: 12px; display: inline-block; margin-right: 10px;">Facebook</a>
                  <a href="https://www.instagram.com/" target="_blank" style="color: #FFF; text-decoration: none; font-size: 12px; display: inline-block; margin-right: 10px;">Instagram</a>
                </p>
                <p style="margin: 5px 0;">
                  <a href="https://twitter.com/" target="_blank" style="color: #FFF; text-decoration: none; font-size: 12px; display: inline-block;">Twitter</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px;">
          <table width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td>
                <a href="https://www.pickupmanng.ng/privacy-and-policy" style="color: #FFF; text-decoration: underline; font-size: 12px; margin-right: 15px;">Privacy</a>
                <a href="https://www.pickupmanng.ng/terms-and-conditions" style="color: #FFF; text-decoration: underline; font-size: 12px;">Terms</a>
              </td>
              <td style="text-align: right;">
                <a href="https://www.facebook.com/share/1BjffnLhMF/?mibextid=wwXIfr" target="_blank" style="display: inline-block; margin-left: 10px;">
                  <img src="https://triplenet-images.s3.amazonaws.com/img/email/Vector-1.png" width="15" border="0" alt="Facebook">
                </a>
                <a href="https://www.instagram.com/pickupmanng?igsh=cXp6MG5vcWhpd3Ft&utm_source=qr" target="_blank" style="display: inline-block; margin-left: 10px;">
                  <img src="https://triplenet-images.s3.amazonaws.com/img/email/Group+26086709.png" width="15" border="0" alt="Instagram">
                </a>
                <a href="https://x.com/pickupmanng?s=21" target="_blank" style="display: inline-block; margin-left: 10px;">
                  <img src="https://triplenet-images.s3.amazonaws.com/img/email/Vector+(1).png" width="15" border="0" alt="Twitter">
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>

  <div style="padding: 20px; font-size: 12px; color: #888; line-height: 1.5;">
    <p style="margin-top: 0;">
      <strong>DISCLAIMER:</strong> This is a no-reply email. This message, including any attachments, is intended solely for the designated recipient(s) and may contain confidential or privileged information. Unauthorized use, disclosure, or distribution is prohibited. If you received this in error, please notify the sender immediately and delete it permanently from your system.
    </p>
    <p style="margin-bottom: 0;">
      Note: This inbox is not monitored — for inquiries, contact <a href="mailto:support@pickupmanng.ng" style="color: #4F46E5; text-decoration: underline;">support@pickupmanng.ng</a>.
    </p>
  </div>
</div>
    `;
  return { subject, html };
};
module.exports = { generateResetEmailTemplate };
