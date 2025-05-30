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

        await sendParcelUpdate(
          [parcel[0].email, parcel[0].receiver_email],
          parcel[0].first_name,
          parcel[0]
        );

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

    for (const parcelData of parcelsToUpdate) {
      const { tracking_number, status } = parcelData;

      // Skip if missing required data
      if (!tracking_number || !status) continue;

      // Update parcel status
      const updateResult = await Parcels.update(
        { status },
        { where: { tracking_number } }
      );
      console.log(updateResult);
      if (updateResult[0] > 0) {
        // Create tracking history
        const parcel = await Parcels.findOne({ where: { tracking_number } });

        await ParcelTracking.create({
          tracking_number: parcel.tracking_number,
          status,
        });

        // Optionally notify users (remove if not needed)
        await sendParcelUpdate(
          [parcel.email, parcel.receiver_email],
          parcel.first_name,
          parcel
        );

        await sendWhatsAppMessage(parcel);

        updateResults.push({ tracking_number, status, success: true });
      } else {
        updateResults.push({ tracking_number, status, success: false });
      }
    }

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

const sendParcelUpdate = async (emails, first_name, parcel) => {
  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Pickupmanng",
      link: "https://mailgen.js/",
      copyright: "Copyright © 2024 pic. All rights reserved.",
      logo: "https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Pickupman%206.png?alt=media&token=acc0ed05-77de-472e-a12a-2eb2d6fbbb9a",
      logoHeight: "30px",
    },
  });

  let response = {
    body: {
      signature: false,
      name: first_name,
      intro: `The status of your shipment with tracking number ${parcel.tracking_number} has been updated.`,
      table: {
        data: [
          {
            Item: "Tracking Number",
            Detail: parcel.tracking_number,
          },
          {
            Item: "New Status",
            Detail: parcel.status,
          },
          {
            Item: "Shipment Weight",
            Detail: parcel.parcel_weight ? parcel.parcel_weight : "N/A",
          },
          ...(parcel.status !== "Delivered"
            ? [
                {
                  Item: "Estimated Delivery Date",
                  Detail: parcel.estimated_delivery_date
                    ? parcel.estimated_delivery_date
                    : "N/A",
                },
              ]
            : []),
        ],
      },
      outro: `
      <p>Yours sincerely,<br /><strong>Pickupman</strong></p><br /></br>
      <p><strong>PICKUPMAN LOGISTICS</strong><br />
      Pickupman House<br />
      Suite BX2, Ground Floor,<br />
      Zitel Plaza, located beside Chida Hotel Utako<br />
      Tel: 08146684422<br />
      Email: support@pickupmanng.ng<br />
      Website: <a href="http://www.pickupmanng.ng">www.pickupmanng.ng</a></p>
  
      <p style="font-size: 12px; color: #888;">
      <strong>DISCLAIMER:</strong> This is a no-reply email. This message, including any attachments, is intended solely for the designated recipient(s) and may contain confidential or privileged information. Unauthorized use, disclosure, or distribution is prohibited. If you received this in error, please notify the sender immediately and delete it permanently from your system. Note: This inbox is not monitored—for inquiries, contact <a href="mailto:support@pickupmanng.ng">support@pickupmanng.ng</a>.
      </p>
    `,
    },
  };

  let mail = MailGenerator.generate(response);

  let message = {
    from: process.env.EMAIL,
    to: Array.isArray(emails) ? emails.join(",") : emails,
    subject: "Parcel Status Updated",
    html: mail,
  };

  const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    auth: {
      user: "emailapikey",
      pass: process.env.PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail(message);
    console.log("Email sent successfully:", info.accepted[0]);
    return true;
  } catch (err) {
    console.error("Error sending email:", err);
    return false;
  }
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
  const newsLetterUser = await Newsletter.findAll();
  const merged = [
    ...verifiedUsers.map((u) => u.dataValues),
    ...newsLetterUser.map((n) => ({
      ...n.dataValues,
      subscribed: true,
    })),
  ];
  console.log(merged);
  if (!verifiedUsers) {
    return res.status(404).json({
      status: false,
      msg: "Database error",
    });
  } else {
    // const sendResults = await sendEmails(merged, message, subject);
    const sendResults = await sendEmails(merged, message, subject);

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
  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Pickupmanng",
      link: "https://mailgen.js/",
      copyright: "Copyright © 2024 pickupmanng. All rights reserved.",
      logo: "https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Pickupman%206.png?alt=media&token=acc0ed05-77de-472e-a12a-2eb2d6fbbb9a",
      logoHeight: "30px",
    },
  });

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
    const response = {
      body: {
        name: user.first_name || user.email,
        intro: message,
        ...(user.subscribed && {
          outro: `If you no longer wish to receive these emails, you can unsubscribe <a href="https://pickupman.ng/unsubscribe?email=${user?.email}" style="color: #4F46E5;">here</a>.'`,
        }),

        signature: "Sincerely, Pickupmanng Team",
      },
    };

    const mailContent = MailGenerator.generate(response);

    const emailMessage = {
      from: process.env.EMAIL,
      to: user.email,
      subject,
      html: mailContent,
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
