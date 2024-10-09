const db = require("../utils/db");
const Mailgen = require("mailgen");
const nodemailer = require("nodemailer");
exports.getAllTeamMembers = (req, res) => {
  const query =
    "SELECT * FROM railway.users WHERE role NOT IN ('user', 'super_admin')";

  db.query(query, (error, users) => {
    if (error) {
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
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
  const query = "SELECT * FROM railway.payments";

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
  const { tracking_number, parcel_weight, status, estimated_delivery_date } =
    req.body;

  if (!tracking_number) {
    return res.status(400).json({
      success: false,
      message: "Tracking number is required",
    });
  }

  let query = "UPDATE parcels SET ";
  let values = [];
  const trackquery =
    "INSERT INTO ParcelTracking (tracking_number, status, timestamp) VALUES (?, ?, CURRENT_TIMESTAMP)";
  if (parcel_weight) {
    query += "parcel_weight = ?, ";
    values.push(parcel_weight);
  }
  if (estimated_delivery_date) {
    query += "estimated_delivery_date = ?, ";
    values.push(estimated_delivery_date);
  }
  if (status) {
    query += "status = ?, ";
    values.push(status);
  }

  query = query.slice(0, -2);

  query += " WHERE tracking_number = ?";
  values.push(tracking_number);

  db.query(trackquery, [tracking_number, status], (error, update) => {
    if (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }
  });

  db.query(query, values, async (error, parcel) => {
    if (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    } else {
      const selectQuery = "SELECT * FROM parcels WHERE tracking_number = ?";

      db.query(selectQuery, [tracking_number], async (err, parcel) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ success: false, message: "Database error" });
        }

        if (parcel.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Parcel not found" });
        }
        // Now, send the updated parcel via email if needed
        await sendParcelUpdate(
          [parcel[0].email, parcel[0].receiver_email],
          parcel[0].first_name,
          parcel[0]
        );

        // Return the updated parcel to the client
        return res.status(200).json({
          success: true,
          code: 200,
          parcel: parcel[0], // Return the first (and only) parcel from the result set
          status: "success",
          msg: `Updated parcel successfully`,
        });
      });
    }
  });
};

const sendParcelUpdate = async (emails, first_name, parcel) => {
  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Pickupmanng",
      link: "https://mailgen.js/",
      copyright: "Copyright © 2024 railway. All rights reserved.",
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
    host: "mail.pickupmanng.ng",
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
  console.log(tracking_number);
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
