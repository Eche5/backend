const db = require("../utils/db");
const Mailgen = require("mailgen");
const nodemailer = require("nodemailer");
exports.getAllTeamMembers = (req, res) => {
  const query =
    "SELECT * FROM pickupman.users WHERE role NOT IN ('user', 'super_admin')";

  db.query(query, (error, users) => {
    if (error) {
      return res.status(500).json({ success: false, message: error });
    } else {
      return res.status(200).json({
        success: true,
        code: 200,
        users,
        status: "success",
        msg: `fetched team members`,
      });
    }
  });
};

exports.getAllPayments = (req, res) => {
  const query = "SELECT * FROM pickupman.payments";

  db.query(query, (error, payments) => {
    if (error) {
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    } else {
      return res.status(200).json({
        success: true,
        code: 200,
        payments,
        status: "success",
        msg: `fetched team members`,
      });
    }
  });
};

exports.updateParcel = (req, res) => {
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

  const formatDateForSQL = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  if (!tracking_number) {
    return res.status(400).json({
      success: false,
      message: "Tracking number is required",
    });
  }

  let query = "UPDATE parcels SET ";
  let values = [];

  if (parcel_weight) {
    query += "parcel_weight = ?, ";
    values.push(parcel_weight);
  }
  if (estimated_delivery_date) {
    query += "estimated_delivery_date = ?, ";
    const estimatedDeliveryDate = formatDateForSQL(estimated_delivery_date);
    values.push(estimatedDeliveryDate);
  }
  if (receiver_first_name) {
    query += "receiver_first_name = ?, ";
    values.push(receiver_first_name);
  }
  if (receiver_last_name) {
    query += "receiver_last_name = ?, ";
    values.push(receiver_last_name);
  }
  if (receiver_city) {
    query += "receiver_city = ?, ";
    values.push(receiver_city);
  }
  if (receiver_email) {
    query += "receiver_email = ?, ";
    values.push(receiver_email);
  }
  if (receiver_street_address) {
    query += "receiver_street_address = ?, ";
    values.push(receiver_street_address);
  }
  if (receiver_state) {
    query += "receiver_state = ?, ";
    values.push(receiver_state);
  }
  if (receiver_landmark) {
    query += "receiver_landmark = ?, ";
    values.push(receiver_landmark);
  }
  if (receiver_phone_number) {
    query += "receiver_phone_number = ?, ";
    values.push(receiver_phone_number);
  }
  if (status) {
    query += "status = ?, ";
    values.push(status);
  }
  if (conversion_status) {
    query += "conversion_status = ?, ";
    values.push(conversion_status);
  }

  if (tracking_number) {
    query += "tracking_number = ?, ";
    values.push(tracking_number);
  }
  query = query.slice(0, -2);
  query += " WHERE id = ?";
  values.push(id);
  const trackquery =
    "INSERT INTO ParcelTracking (tracking_number, status, timestamp) VALUES (?, ?, CURRENT_TIMESTAMP)";

  db.query(query, values, (error, data) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Database error in parcel update",
      });
    }
    db.query(trackquery, [tracking_number, status, id], (error) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Database error in tracking update",
        });
      }

      const selectQuery = "SELECT * FROM parcels WHERE id = ?";
      db.query(selectQuery, [id], async (err, parcel) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error in fetching parcel",
          });
        }

        if (parcel.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Parcel not found",
          });
        }

        try {
          await sendParcelUpdate(
            [parcel[0].email, parcel[0].receiver_email],
            parcel[0].first_name,
            parcel[0]
          );

          // Send the response only once here
          return res.status(200).json({
            success: true,
            code: 200,
            parcel: parcel[0],
            status: "success",
            msg: `Updated parcel successfully`,
          });
        } catch (err) {
          return res.status(500).json({
            success: false,
            message: "Error in sending parcel update email",
          });
        }
      });
    });
  });
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

exports.getParcelByTrackingNumber = (req, res) => {
  const { tracking_number } = req.params;
  try {
    const query = "SELECT * FROM parcels where tracking_number = ?";
    db.query(query, [tracking_number], (error, parcel) => {
      if (error) {
        return res.status(401).json({
          status: false,
          msg: "shipment with this tracking number not found",
        });
      }
      return res.status(200).json({
        status: true,
        parcel,
      });
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deletedTeamMember = (req, res) => {
  const { id } = req.body;

  const query = "DELETE FROM `pickupman`.`users` where id = ?";
  db.query(query, id, (error) => {
    if (error) {
      res.status(404).json({
        status: false,
        msg: "error deleting team member",
      });
    } else {
      res.status(204).json({
        status: true,
        msg: "Team member deleted successfully",
      });
    }
  });
};

exports.sendEmailsToUsers = (req, res) => {
  const { message, subject } = req.body;
  const query = 'SELECT * FROM users WHERE role = "user" AND isVerified = "1"';

  db.query(query, async (error, result) => {
    if (error) {
      return res.status(404).json({
        status: false,
        msg: "Database error",
      });
    }

    const sendResults = await sendEmails(result, message, subject);

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
  });
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

exports.getAllRegisteredUsers = (req, res) => {
  const query = "SELECT * FROM pickupman.users WHERE role = 'user' ";

  db.query(query, (error, users) => {
    if (error) {
      return res.status(500).json({ success: false, message: error });
    } else {
      return res.status(200).json({
        success: true,
        code: 200,
        users,
        status: "success",
        msg: `fetched team members`,
      });
    }
  });
};
