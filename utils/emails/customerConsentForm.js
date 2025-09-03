const customerconsentFormTemplate =  (
  email,
  phone,
  first_name,
  last_name
) => {
  const submittedAt = new Date().toLocaleString("en-US", {});
  let subject = "✅ Customer Consent Confirmation";
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Customer Consent Confirmation</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f8f9fa;
      }
      .container {
        background-color: white;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      .header {
        text-align: center;
        border-bottom: 3px solid #16a34a;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      .header h1 {
        color: #16a34a;
        margin: 0;
        font-size: 26px;
      }
      .section {
        margin-bottom: 25px;
        border-left: 4px solid #e2e8f0;
        padding-left: 20px;
      }
      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
      }
      .section-title .emoji {
        margin-right: 8px;
        font-size: 20px;
      }
      .info {
        margin-bottom: 10px;
      }
      .label {
        font-weight: 500;
        color: #374151;
      }
      .value {
        background-color: #f8fafc;
        padding: 8px 12px;
        border-radius: 4px;
        border-left: 3px solid #16a34a;
        margin-top: 4px;
      }
      .footer {
        text-align: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
        color: #6b7280;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>✅ Customer Consent Confirmation</h1>
        <p>Customer has provided shipping consent</p>
      </div>
  
      <div class="section">
        <div class="section-title">
          <span class="emoji">🧍</span> Customer Details
        </div>
        <div class="info">
          <div class="label">Full Name:</div>
          <div class="value">${first_name} ${last_name}</div>
        </div>
        ${
          phone
            ? `<div class="info">
                <div class="label">Phone Number:</div>
                <div class="value">${phone}</div>
              </div>`
            : ""
        }
          ${
            email
              ? `<div class="info">
                <div class="label">Email:</div>
                <div class="value">${email}</div>
              </div>`
              : ""
          }
      </div>
  
      <div class="section">
        <div class="section-title">
          <span class="emoji">📅</span> Submission Date
        </div>
        <div class="value">${submittedAt}</div>
      </div>
  
      <div class="footer">
        <p>This consent form was submitted through your shipping platform.</p>
        <p>Please retain this message for your records.</p>
      </div>
    </div>
  </body>
  </html>
  `;
  return { subject, html };
};

module.exports = { customerconsentFormTemplate };
