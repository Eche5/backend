const sendBulkParcelUpdate = (parcel, recipient) => {
  const subject = "Parcel Status Updated";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #012152; padding: 10px 15px; text-align: center; border-radius: 4px 4px 0 0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="text-align: center;">
              <img src="https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Your_paragraph_text__1_-removebg-preview.png?alt=media&token=3996a1bd-d6cd-4044-b86e-e6d687c11959" 
                   width="150" 
                   style="display: block; margin: 0 auto 15px;" 
                   alt="Pickupman Logo">
              
              <h1 style="color: white; font-size: 22px; margin: 0 0 10px; font-weight: 600;">
                ${subject}
              </h1>
              
              <div style="height: 2px; width: 60px; background-color: white; margin: 0 auto;"></div>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #ffffff; padding: 25px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <p style="margin-top: 0;">Dear ${recipient.name},</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 0;">The status of your shipment with tracking number ${
            parcel.dataValues.tracking_number
          } has been updated.</p>
          ${
            recipient.type === "sender"
              ? `<p style="margin: 10px 0 0 0;">Your package is being sent to ${parcel.dataValues.receiver_first_name} ${parcel.dataValues.receiver_last_name}</p>`
              : `<p style="margin: 10px 0 0 0;">Your package is being sent by ${parcel.dataValues.first_name} ${parcel.dataValues.last_name}</p>`
          }
        </div>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Tracking Number</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${
              parcel.dataValues.tracking_number
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">New Status</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${
              parcel.dataValues.status
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Shipment Weight</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${
              parcel.dataValues.parcel_weight
                ? parcel.dataValues.parcel_weight
                : "N/A"
            }</td>
          </tr>
          ${
            parcel.dataValues.status !== "Delivered"
              ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Estimated Delivery Date</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${
              parcel.dataValues.estimated_delivery_date
                ? parcel.dataValues.estimated_delivery_date
                : "N/A"
            }</td>
          </tr>
          `
              : ""
          }
          ${
            recipient.type === "receiver"
              ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Delivery Address</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              ${parcel.dataValues.receiver_street_address}<br>
              ${parcel.dataValues.receiver_city}, ${parcel.dataValues.receiver_state}<br>
              ${parcel.dataValues.receiver_region}
            </td>
          </tr>
          `
              : ""
          }
        </table>
        
        <p style="margin-bottom: 0;">Yours sincerely,<br /><strong>Pickupman</strong></p>
        
        <p style="margin-top: 20px;">
          <strong>PICKUPMAN LOGISTICS</strong><br />
          Pickupman House<br />
          Suite BX2, Ground Floor,<br />
          Zitel Plaza, located beside Chida Hotel Utako<br />
          Tel: 08146684422<br />
          Email: support@pickupmanng.ng<br />
          Website: <a href="http://www.pickupmanng.ng">www.pickupmanng.ng</a>
        </p>
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
                      Pickupmanng— Nigeria's trusted logistics partner for fast, safe, and reliable deliveries.
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
                      <a href="https://www.facebook.com/share/1BjffnLhMF/?mibextid=wwXIfr" target="_blank" style="color: #FFF; text-decoration: none; font-size: 12px; display: inline-block; margin-right: 10px;">Facebook</a>
                      <a href="https://www.instagram.com/pickupmanng?igsh=cXp6MG5vcWhpd3Ft&utm_source=qr" target="_blank" style="color: #FFF; text-decoration: none; font-size: 12px; display: inline-block; margin-right: 10px;">Instagram</a>
                    </p>
                    <p style="margin: 5px 0;">
                      <a href="https://x.com/pickupmanng?s=21" target="_blank" style="color: #FFF; text-decoration: none; font-size: 12px; display: inline-block;">Twitter</a>
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
module.exports = { sendBulkParcelUpdate };
