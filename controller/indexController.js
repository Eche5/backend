const db = require("../utils/db");
const PaymentService = require("../services/payment");
const paymentInstance = new PaymentService();
exports.GetAllParcels = (req, res) => {
  const query = "SELECT * FROM pickupman.parcels";
  db.query(query, (error, parcels) => {
    if (error) {
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    } else {
      return res.status(200).json({
        status: true,
        parcels,
      });
    }
  });
};

exports.GetUserParcel = (req, res) => {
  const id = req.user.id;
  const query = `
    SELECT parcels.*, users.first_name, users.last_name, users.email, users.phonenumber 
    FROM pickupman.parcels 
    INNER JOIN users ON parcels.sender_id = users.id 
    WHERE parcels.sender_id = ?;
  `;

  db.query(query, [id], (error, parcel) => {
    if (error) {
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    } else {
      return res.status(200).json({
        success: true,
        parcel,
      });
    }
  });
};

exports.startPayment = async (req, res, next) => {
  try {
    const { id } = req.body;

    const query = "SELECT * FROM parcels WHERE tracking_number = ?";

    db.query(query, [id], async (error, results) => {
      if (error) {
        return res
          .status(500)
          .json({ success: false, message: "Database error", error });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Parcel not found" });
      }

      const shipment = results[0];

      const orderTotal = shipment.shipping_fee;
      const paymentData = {
        email: req.user.email,
        full_name: req.user.first_name + " " + req.user.last_name,
        amount: orderTotal,
        tracking_number: id,
      };
      try {
        const response = await paymentInstance.startPayment(paymentData);
        res.status(201).json({
          success: true,
          status: "Payment Started",
          data: { response },
        });
      } catch (paymentError) {
        res.status(500).json({
          success: false,
          message: "Payment error",
          error: paymentError,
        });
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createPayment = async (req, res, next) => {
  try {
    const response = await paymentInstance.createPayment(req.query);
    const newStatus = response?.status === "success" ? "Paid" : "Failed";
    const query = "SELECT * FROM parcels WHERE tracking_number = ?";
    db.query(query, [response.tracking_number], async (error, results) => {
      if (error) {
        return res
          .status(500)
          .json({ success: false, message: "Database error", error });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Parcel not found" });
      }

      let order = results[0];

      order.payment_status = newStatus;
      const updateQuery =
        "UPDATE parcels SET payment_status = ? WHERE tracking_number = ?";

      db.query(
        updateQuery,
        [order.payment_status, response.tracking_number],
        (updateError) => {
          if (updateError) {
            return res.status(500).json({
              success: false,
              message: "Failed to update payment status",
              error: updateError,
            });
          }

          res.status(201).json({
            success: true,
            status: "Payment Created",
            data: { payment: response, order },
          });
        }
      );
    });
  } catch (error) {
    next(error);
  }
};

exports.shippingRate = (req, res) => {
  const { country, shipping_types, weight } = req.body;

  const query = `
    SELECT rp.rate, rp.shipping_type
    FROM zoning z
    JOIN rate_pricingtest rp ON z.zone = rp.zone
    WHERE z.country = ?
      AND rp.shipping_type IN (?)
      AND rp.weight_from = ?;
  `;

  db.query(query, [country, shipping_types, weight], (error, rates) => {
    if (error) {
      return res
        .status(500)
        .json({ success: false, message: "Database error", error });
    } else {
      res.status(201).json({
        success: true,
        status: "shipping rates found",
        rates,
      });
    }
  });
};

exports.localshippingrate = (req, res) => {
  const { state, shipping_types, weight } = req.body;

  const query = `
    SELECT rate, shipping_type, duration
    FROM rate_pricing_local
    WHERE state = ?
      AND shipping_type IN (?)
     ;
  `;

  // Static additional data
  const additionalData = {
    shipping_type: "standard",
    rate: "6950.00",
    duration:
      "4-5 business days after the drop-off day (weekends and public holidays not included)",
  };

  // Querying the database with the given parameters
  db.query(query, [state, shipping_types], (error, results) => {
    if (error) {
      return res
        .status(500)
        .json({ success: false, message: "Database error", error });
    }

  

    const combinedResults = [...results, additionalData];
    res.status(200).json({
      success: true,
      message: "Shipping rates found",
      rates: combinedResults,
    });
  });
};
