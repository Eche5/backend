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
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 characters!
const crypto = require("crypto");
const multer = require("multer");
const sendPromotionalEmailsTemplate = require("../utils/emails/sendPromotionalEmailTemplate");
const sendMailwithAttachment = require("../utils/sendMailwithAttachment");
const {
  sendBulkParcelUpdate,
} = require("../utils/emails/sendBulkParcelUpdate");
const sendEmail = require("../utils/sendMail");
const storage = multer.memoryStorage(); // store in memory for direct email sending
const upload = multer({ storage });
function decrypt(encryptedText) {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
exports.changeStaffRole = async (req, res, next) => {
  const { id, role } = req.body;
  try {
    const user = await Users.findAll({ where: { id: id } });
    if (!user) {
      return res.status(422).json({
        success: false,
        code: 422,
        status: "error",
        data: { msg: "user does not exist" },
      });
    } else {
      await Users.update(
        {
          role: role,
        },
        {
          where: {
            id: id,
          },
        }
      );
      return res.status(200).json({
        success: true,
        code: 200,
        status: "success",
        data: {
          msg: "staff role now changed successfully",
        },
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
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
      const decryptedUsers = users?.map((user) => {
        const decryptedNIN = user?.nin ? decrypt(user.nin) : null;
        return {
          ...user.toJSON(), // convert Sequelize model to plain object
          nin: decryptedNIN, // overwrite with decrypted version
        };
      });
      return res.status(200).json({
        success: true,
        code: 200,
        users: decryptedUsers,
        status: "success",
        msg: `fetched team members`,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.getAllCustomers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;
  try {
    const users = await Users.findAll({
      where: {
        role: "user",
      },
      offset: offset,
      limit: 10,
    });
    const totalItems = await Users.count({
      where: {
        role: "user",
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
        users: users,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page,
        totalItems,
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
      fragile,
      insurance,
      item_name,
      package_description,
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
        item_name,
        package_description,
        conversion_status,
        receiver_state,
        fragile,
        insurance,
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
        const recipients = [
          {
            email: parcel[0].dataValues.email,
            name: `${parcel[0].dataValues.first_name} ${parcel[0].dataValues.last_name}`,
            type: "sender",
          },
          {
            email: parcel[0].dataValues.receiver_email,
            name: `${parcel[0].dataValues.receiver_first_name} ${parcel[0].dataValues.receiver_last_name}`,
            type: "receiver",
          },
        ];
        for (const recipient of recipients) {
          const { subject, html } = sendBulkParcelUpdate(parcel[0], recipient);

          sendEmail({
            to: recipient.email,
            subject,
            html,
          });
        }
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
          const { subject, html } = sendBulkParcelUpdate(parcel, recipient);
          sendEmail({
            to: recipient.email,
            subject,
            html,
          });
        }
        // Optionally notify users (remove if not needed)

        // await sendParcelUpdate(parcel);

        await sendWhatsAppMessage(parcel);

        updateResults.push({ tracking_number, status, success: true });
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
exports.uploadAttachment = upload.array("attachments", 10);

exports.sendEmailsToUsers = async (req, res) => {
  try {
    const { value, subject } = req.body; // keep mailSubject directly
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

    if (!verifiedUsers) {
      return res.status(404).json({
        status: false,
        msg: "Database error",
      });
    } else {
      const attachments = req.files;

      res.status(202).json({ status: true, msg: "Email sending started" });

      setImmediate(() => {
        for (let user of merged) {
          const { html } = sendPromotionalEmailsTemplate(
            user,
            value,
            subject // ✅ now exists
          );
          sendMailwithAttachment({
            to: user.email,
            subject,
            html,
            attachments,
          })
            .then(() => console.log(`Email sent to ${user.email}`))
            .catch((err) =>
              console.error(`Error sending email to ${user.email}:`, err)
            );
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: "Failed to send some emails",
    });
  }
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
