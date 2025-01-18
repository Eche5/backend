const Mailgen = require("mailgen");
const nodemailer = require("nodemailer");
const Users = require("../models/users");
const Payments = require("../models/payments");
const { Op } = require("sequelize");
const Parcels = require("../models/parcels");
const ParcelTracking = require("../models/parcelTracking");

exports.getAllTeamMembers = async (req, res) => {
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
};

exports.getAllPayments = async (req, res) => {
  const query = "SELECT * FROM pickupman.payments";
  const payments = await Payments.findAll();
  if (!payments) {
    return res.status(500).json({ success: false, message: "Database error" });
  } else {
    return res.status(200).json({
      success: true,
      code: 200,
      payments,
      status: "success",
      msg: `fetched team members`,
    });
  }
};

exports.updateParcel = async (req, res) => {
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
          {
            Item: "Estimated Delivery Date",
            Detail: parcel.estimated_delivery_date
              ? parcel.estimated_delivery_date
              : "N/A",
          },
        ],
      },
      signature: "Sincerely, Pickupmanng Team",
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

  if (!verifiedUsers) {
    return res.status(404).json({
      status: false,
      msg: "Database error",
    });
  } else {
    const sendResults = await sendEmails(verifiedUsers, message, subject);
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
        name: user.first_name,
        intro: message,
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
  console.log(users);
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
