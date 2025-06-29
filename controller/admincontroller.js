const Mailgen = require("mailgen");
const nodemailer = require("nodemailer");
const Users = require("../models/users");
const Payments = require("../models/payments");
const { Op } = require("sequelize");
const Parcels = require("../models/parcels");
const ParcelTracking = require("../models/parcelTracking");
const axios = require("axios");
const qs = require("qs");
const Newsletter = require("../models/newsLetter");
const Activitylogs = require("../models/activityLogs");
const { email } = require("../middleware/validation");
exports.getAllTeamMembers = async (req, res) => {
  try {
    const users = await Users.findAll({
      where: {
        role: {
          [Op.notIn]: ["user", "super_admin"],
        },
      },
    });
    if (!users) {
      return res
        .status(500)
        .json({ success: false, message: "something went wrong" });
    } else {
      return res.status(200).json({
        success: true,
        code: 200,
        users,
        status: "success",
        msg: `fetched team members`,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.getAllPayments = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;
  const payments = await Payments.findAll({
    order: [["created_at", "DESC"]],
    offset: offset,
    limit: 10,
  });

  const totalItems = await Payments.count();
  if (!payments) {
    return res.status(500).json({ success: false, message: "Database error" });
  } else {
    return res.status(200).json({
      success: true,
      code: 200,
      payments,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: page,
      totalItems,
      status: "success",
      msg: `fetched all payments`,
    });
  }
};

exports.updateParcel = async (req, res) => {
  try {
    const {
      id,
      tracking_number,
      parcel_weight,
      status,
      estimated_delivery_date,
      receiver_first_name,
      receiver_last_name,
      receiver_phone_number,
      receiver_email,
      receiver_street_address,
      receiver_city,
      receiver_landmark,
      conversion_status,
      receiver_state,
      action,
    } = req.body;

    const updateParcel = await Parcels.update(
      {
        tracking_number,
        parcel_weight,
        status,
        estimated_delivery_date,
        receiver_first_name,
        receiver_last_name,
        receiver_phone_number,
        receiver_email,
        receiver_street_address,
        receiver_city,
        receiver_landmark,
        conversion_status,
        receiver_state,
      },
      { where: { id: id } }
    );
    if (updateParcel) {
      const createHistory = await ParcelTracking.create({
        tracking_number,
        status,
      });

      if (createHistory) {
        const parcel = await Parcels.findAll({ where: { id } });

        await sendParcelUpdate(parcel[0]);
        const fullname = `${req.user.first_name} ${req.user.last_name}`;
        await Activitylogs.create({
          name: fullname,
          action: action,
          parcels: [tracking_number],
        });

        await sendWhatsAppMessage(parcel[0]);
        return res.status(200).json({
          success: true,
          code: 200,
          parcel: parcel[0],
          user: parcel,
          status: "success",
          msg: `Updated parcel successfully`,
        });
      }
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
exports.bulkUpdateParcelStatus = async (req, res) => {
  try {
    const parcelsToUpdate = req.body.parcels; // Expecting an array of { id, status }
    if (!Array.isArray(parcelsToUpdate) || parcelsToUpdate.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Invalid input. Expected an array of parcels with id and status.",
      });
    }

    const updateResults = [];
    const trackingNumbers = [];
    const fullname = `${req.user.first_name} ${req.user.last_name}`;

    for (const parcelData of parcelsToUpdate) {
      const { tracking_number, status } = parcelData;

      // Skip if missing required data
      if (!tracking_number || !status) continue;

      // Update parcel status
      const updateResult = await Parcels.update(
        { status },
        { where: { tracking_number } }
      );
      if (updateResult[0] > 0) {
        // Create tracking history
        const parcel = await Parcels.findOne({ where: { tracking_number } });

        await ParcelTracking.create({
          tracking_number: parcel.tracking_number,
          status,
        });
        trackingNumbers.push(tracking_number);
        // Optionally notify users (remove if not needed)
        await sendParcelUpdate(parcel);

        await sendWhatsAppMessage(parcel);

        updateResults.push({ tracking_number, status, success: true });
        console.log(updateResults);
      } else {
        updateResults.push({ tracking_number, status, success: false });
      }
    }
    await Activitylogs.create({
      name: fullname,
      action: "updated shipment",
      parcels: trackingNumbers,
    });
    return res.status(200).json({
      success: true,
      msg: "Bulk update completed",
      results: updateResults,
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error during bulk update",
    });
  }
};

const sendParcelUpdate = async (parcel) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    auth: {
      user: "emailapikey",
      pass: process.env.PASSWORD,
    },
  });

  let allSuccess = true;
  const subject = "Parcel Status Updated";

  // Recipients - sender and receiver
  const recipients = [
    {
      email: parcel.dataValues.email,
      name: `${parcel.dataValues.first_name} ${parcel.dataValues.last_name}`,
      type: "sender",
    },
    {
      email: parcel.dataValues.receiver_email,
      name: `${parcel.dataValues.receiver_first_name} ${parcel.dataValues.receiver_last_name}`,
      type: "receiver",
    },
  ];

  for (const recipient of recipients) {
    const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #012152; padding: 5px 10px; text-align: center; border-radius: 4px 4px 0 0;">
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

    const emailMessage = {
      from: process.env.EMAIL,
      to: recipient.email,
      subject,
      html: emailHtml,
    };

    try {
      const info = await transporter.sendMail(emailMessage);
      console.log(
        `Email sent successfully to ${recipient.email}:`,
        info.messageId
      );
    } catch (err) {
      console.error(`Error sending email to ${recipient.email}:`, err);
      allSuccess = false;
    }
  }

  return allSuccess;
};

async function sendWhatsAppMessage(parcelData) {
  try {
    const senderParameters = `${parcelData.first_name}, ${parcelData.tracking_number}, ${parcelData.status}, ${parcelData.parcel_weight}kg, ${parcelData.estimated_delivery_date}`;

    const receiverParameters = `${parcelData.receiver_first_name}, ${parcelData.tracking_number}, ${parcelData.status}, ${parcelData.parcel_weight}kg, ${parcelData.estimated_delivery_date}`;

    const senderPhone = parcelData.phone_number.replace("+", "");
    const receiverPhone = parcelData.receiver_phone_number.replace("+", "");

    const recipients =
      senderPhone === receiverPhone
        ? [{ phone: senderPhone, parameters: senderParameters }]
        : [
            { phone: senderPhone, parameters: senderParameters },
            { phone: receiverPhone, parameters: receiverParameters },
          ];

    const promises = recipients.map(async (recipient) => {
      const data = qs.stringify({
        token: process.env.TOKEN,
        recipient: recipient.phone,
        template_code: process.env.TEMPLATE_CODE,
        parameters: recipient.parameters,
      });

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://my.kudisms.net/api/whatsapp",
        headers: {},
        data: data,
      };

      return axios(config);
    });

    const responses = await Promise.all(promises);
    console.log(responses);
    return responses.map((response) => response.data);
  } catch (error) {
    throw error;
  }
}

exports.getParcelByTrackingNumber = async (req, res) => {
  const { tracking_number } = req.params;
  try {
    const parcel = await Parcels.findAll({
      where: { tracking_number: tracking_number },
    });
    if (!parcel) {
      return res.status(401).json({
        status: false,
        msg: "shipment with this tracking number not found",
      });
    } else {
      return res.status(200).json({
        status: true,
        parcel,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.deletedTeamMember = async (req, res) => {
  const { id } = req.body;
  const user = await Users.destroy({
    where: {
      id: id,
    },
  });
  if (!user) {
    return res.status(404).json({
      status: false,
      msg: "error deleting team member",
    });
  } else {
    res.status(204).json({
      status: true,
      msg: "Team member deleted successfully",
    });
  }
};

exports.sendEmailsToUsers = async (req, res) => {
  const { message, subject } = req.body;
  const verifiedUsers = await Users.findAll({
    where: { role: "user", is_verified: true },
  });
  console.log("test");
  const newsLetterUser = await Newsletter.findAll();
  const merged = [
    ...verifiedUsers.map((u) => u.dataValues),
    ...newsLetterUser.map((n) => ({
      ...n.dataValues,
      subscribed: true,
    })),
  ];
  if (!verifiedUsers) {
    return res.status(404).json({
      status: false,
      msg: "Database error",
    });
  } else {
    // const sendResults = await sendEmails(merged, message, subject);
    const sendResults = await sendEmails(merged, message, subject);
    console.log(sendResults);
    if (sendResults) {
      res.status(200).json({
        status: true,
        msg: "Emails sent successfully",
      });
    } else {
      res.status(500).json({
        status: false,
        msg: "Failed to send some emails",
      });
    }
  }
};

const sendEmails = async (users, message, subject) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    auth: {
      user: "emailapikey",
      pass: process.env.PASSWORD,
    },
  });

  let allSuccess = true;

  for (let user of users) {
    const emailHtml = `
     <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
     <div style="background-color: #012152; padding: 5px 10px; text-align: center; border-radius: 4px 4px 0 0;">
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
    <p style="margin-top: 0;">Dear ${user.first_name || user.email},</p>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
      <p style="margin: 0;">${message}</p>
    </div>
    
    ${
      user.subscribed
        ? `
    <p style="font-size: 14px; color: #666;">
      If you no longer wish to receive these emails, you can unsubscribe 
      <a href="https://pickupman.ng/unsubscribe?email=${user.email}" style="color: #4F46E5; text-decoration: underline;">here</a>.
    </p>
    `
        : ""
    }
    
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

    const emailMessage = {
      from: process.env.EMAIL,
      to: user.email,
      subject,
      html: emailHtml,
    };

    try {
      const info = await transporter.sendMail(emailMessage);
      console.log("Email sent successfully:", info.accepted[0]);
    } catch (err) {
      console.error(`Error sending email to ${user.email}:`, err);
      allSuccess = false;
    }
  }

  return allSuccess;
};

exports.getAllRegisteredUsers = async (req, res) => {
  const users = await Users.findAll({
    where: { role: "user", is_verified: true },
  });
  if (!users) {
    return res.status(404).json({
      status: false,
      msg: "Database error",
    });
  } else {
    return res.status(200).json({
      success: true,
      code: 200,
      users,
      status: "success",
      msg: `fetched team members`,
    });
  }
};

exports.getAllActivityLogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;
  const logs = await Activitylogs.findAll({
    order: [["created_at", "DESC"]],
    offset: offset,
    limit: 10,
  });

  const totalItems = await Activitylogs.count();
  if (!logs) {
    return res.status(500).json({ success: false, message: "Database error" });
  } else {
    return res.status(200).json({
      success: true,
      code: 200,
      logs,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: page,
      totalItems,
      status: "success",
      msg: `fetched all payments`,
    });
  }
};
