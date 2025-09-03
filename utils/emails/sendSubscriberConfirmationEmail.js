const sendSubscriptionConfirmationEmail = (subscriber) => {
  const subject = "Welcome to Pickupman Newsletter!";
  const html = `
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
                          <a href="https://www.pickupmanng.ng/privacy-and-policy" style="color: #aaaaaa; text-decoration: underline;">Privacy Policy</a> | 
                          <a href="https://www.pickupmanng.ng/terms-and-conditions" style="color: #aaaaaa; text-decoration: underline;">Terms of Service</a> | 
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
  return { subject, html };
};
module.exports = { sendSubscriptionConfirmationEmail };
