const contactusformTemplate = (
  email,
  name,
  message,
  emailSubject,
  phonenumber
) => {
  const subject = `Contact Form - ${emailSubject}`;

  // 3. Styled HTML email
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
    <div style="background: #012152; padding: 15px; text-align: center; color: #fff;">
      <h2 style="margin: 0; font-size: 18px;">New Contact Form Submission</h2>
    </div>

    <div style="padding: 20px;">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Name</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Phone Number</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${phonenumber}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Email</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Subject</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${subject}</td>
        </tr>
      </table>

      <p style="margin-bottom: 10px;"><strong>Message:</strong></p>
      <div style="padding: 15px; border: 1px solid #ddd; background: #fdfdfd; border-radius: 4px;">
        ${message}
      </div>
    </div>

    <div style="background: #012152; color: white; padding: 12px; text-align: center; font-size: 12px;">
      <p style="margin: 0;">This message was submitted via the Pickupmanng contact form.</p>
    </div>
  </div>
  `;
  return { subject, html };
};
module.exports = { contactusformTemplate };
