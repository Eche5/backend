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
    receiver_state,
  } = req.body;

  const formatDateForSQL = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Returns 'YYYY-MM-DD'
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

  query = query.slice(0, -2); // Remove trailing comma and space
  query += " WHERE tracking_number = ?";
  values.push(tracking_number);

  const trackquery =
    "INSERT INTO ParcelTracking (tracking_number, status, timestamp) VALUES (?, ?, CURRENT_TIMESTAMP)";

  // Insert into tracking and update parcel
  db.query(trackquery, [tracking_number, status], (error) => {
    if (error) {
      return res
        .status(500)
        .json({ success: false, message: "Database error in tracking update" });
    }

    // Update the parcel table
    db.query(query, values, (error) => {
      if (error) {
        return res
          .status(500)
          .json({ success: false, message: "Database error in parcel update" });
      }

      // Select updated parcel
      const selectQuery = "SELECT * FROM parcels WHERE tracking_number = ?";
      db.query(selectQuery, [tracking_number], async (err, parcel) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error in fetching parcel",
          });
        }

        if (parcel.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Parcel not found" });
        }

        await sendParcelUpdate(
          [parcel[0].email, parcel[0].receiver_email],
          parcel[0].first_name,
          parcel[0]
        );

        return res.status(200).json({
          success: true,
          code: 200,
          parcel: parcel[0],
          status: "success",
          msg: `Updated parcel successfully`,
        });
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
      pass: "wSsVR61wrhX4Wqd9m2D4c+5ukQ8DBV72Fxh+3FLy6HP+SPzKp8cylUbNAgb1GfUXETZhRjsV8O4rkR0C1jJbh4sumQoGWyiF9mqRe1U4J3x17qnvhDzNWWxclBCJKYwNzg5rnWVhFMAk+g==",
    },
  });

  try {
    const info = await transporter.sendMail(message);
    console.log("Email sent successfully:", info.response);
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
    host: "smtp.zoho.com",
    port: 465,
    secure: true, 
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
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
      console.log(`Email sent to ${user.email}:`, info.response);
    } catch (err) {
      console.error(`Error sending email to ${user.email}:`, err);
      allSuccess = false;
    }
  }

  return allSuccess;
};


exports.getAllRegisteredUsers = (req, res) => {
  const query =
    "SELECT * FROM pickupman.users WHERE role = 'user' ";

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