const sendUnsubscriptionEmailTemplate = (subscriber) => {
  const html = `
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
                            <a href="https://www.pickupmanng.ng/privacy-and-policy" style="color: #aaaaaa; text-decoration: underline;">Privacy Policy</a> | 
                            <a href="https://www.pickupmanng.ng/terms-and-conditions" style="color: #aaaaaa; text-decoration: underline;">Terms of Service</a> | 
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

  return {
    subject: "Unsubscribed from Pickupman Newsletter",
    html,
  };
};
module.exports = { sendUnsubscriptionEmailTemplate };
