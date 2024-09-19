const db = require("../utils/db");
exports.getAllTeamMembers = (req, res) => {
  const query =
    "SELECT * FROM pickupman.users WHERE role NOT IN ('logistics_user', 'super_admin')";

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

  db.query(query, values, (error, parcel) => {
    if (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    } else {
      return res.status(200).json({
        success: true,
        code: 200,
        parcel,
        status: "success",
        msg: `Updated parcel successfully`,
      });
    }
  });
};
