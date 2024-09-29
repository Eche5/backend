const db = require("../utils/db");
const PaymentService = require("../services/payment");
const walletPaymentService = require("../services/walletPayment");
const walletpaymentInstance = new walletPaymentService();
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
        amount: Number(orderTotal),
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

exports.startWalletFunding = async (req, res, next) => {
  try {
    const { email, first_name, last_name } = req.user;
    const { amount } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";

    db.query(query, [email], async (error, results) => {
      if (error) {
        return res
          .status(500)
          .json({ success: false, message: "Database error", error });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const paymentData = {
        email,
        full_name: first_name + " " + last_name,
        amount,
      };
      try {
        const response = await walletpaymentInstance.startPayment(paymentData);
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

exports.startWalletPayment = async (req, res, next) => {
  try {
    const response = await walletpaymentInstance.createPayment(req.query);
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [response.email], async (error, results) => {
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

      const updateQuery =
        "UPDATE users SET wallet_amount = wallet_amount + ? WHERE email = ?";

      db.query(
        updateQuery,
        [response.amount, response.email],
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
            data: { payment: response },
          });
        }
      );
    });
  } catch (error) {
    next(error);
  }
};

exports.payThroughWallet = (req, res) => {
  const sender_id = req.user.id;

  const generateTrackingNumber = () => {
    return "TRK" + Math.random().toString().slice(2, 12).padStart(10, "0");
  };

  const tracking_number = generateTrackingNumber();
  const {
    first_name,
    last_name,
    phone_number,
    email,
    city,
    region,
    postal_code,
    social_media_handle,
    receiver_first_name,
    receiver_last_name,
    receiver_email,
    receiver_phone_number,
    receiver_city,
    receiver_region,
    receiver_postal_code,
    receiver_social_media_handle,
    street_address,
    receiver_street_address,
    insurance = 0,
    fragile = 0,
    parcel_weight,
    parcel_price,
    package_description,
    selected_Deliverymode,
    shipping_fee,
    item_name,
    quantity,
    state,
    receiver_state,
    landmark,
    receiver_landmark,
  } = req.body;
  const status = "Created";
  const payment_status = "Paid";

  //get user email
  const query = `
       SELECT * FROM users WHERE email = ?
      `;

  db.query(query, [req.user.email], (error, user) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update payment status",
        error: updateError,
      });
    }
    const balance = Number(user[0].wallet_amount);
    if (balance < shipping_fee) {
      return res.status(500).json({
        success: false,
        message: "insufficient funds, please top up",
      });
    } else {
      const query = `INSERT INTO parcels (sender_id,first_name,last_name,phone_number, email, city,region, postal_code,social_media_handle,receiver_first_name,receiver_last_name,receiver_email,receiver_phone_number,receiver_city,receiver_region,receiver_postal_code,receiver_social_media_handle,street_address,receiver_street_address,insurance,fragile,parcel_weight,parcel_price,package_description,selected_Deliverymode,shipping_fee,payment_status,status,tracking_number, item_name,
    quantity,
    state,
    receiver_state,
    landmark,
    receiver_landmark,created_at,updated_at)VALUES( ?, ?, ?, ?, ?, ? , ? , ?, ?, ?, ?, ?, ?, ?, ?, ?,  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`;
      db.query(
        query,
        [
          sender_id,
          first_name,
          last_name,
          phone_number,
          email,
          city,
          region,
          postal_code,
          social_media_handle,
          receiver_first_name,
          receiver_last_name,
          receiver_email,
          receiver_phone_number,
          receiver_city,
          receiver_region,
          receiver_postal_code,
          receiver_social_media_handle,
          street_address,
          receiver_street_address,
          insurance,
          fragile,
          parcel_weight,
          parcel_price,
          package_description,
          selected_Deliverymode,
          shipping_fee,
          payment_status,
          status,
          tracking_number,
          item_name,
          quantity,
          state,
          receiver_state,
          landmark,
          receiver_landmark,
        ],
        (error, result) => {
          if (error) {
            console.log(result);
            console.error("Error inserting shipment:", error);
            return res.status(500).json({
              success: false,
              code: 500,
              status: "error",
              msg: "Failed to create shipment",
            });
          } else {
            const updateQuery =
              "UPDATE users SET wallet_amount = wallet_amount - ? WHERE email = ?";

            db.query(
              updateQuery,
              [shipping_fee, req.user.email],
              (updateError) => {
                if (updateError) {
                  return res.status(500).json({
                    success: false,
                    message: "Failed to update payment status",
                    error: updateError,
                  });
                }

                return res.status(201).json({
                  success: true,
                  code: 200,
                  tracking_number,
                  status: "success",
                  msg: `Shipment with tracking number ${tracking_number}  created successfully`,
                });
              }
            );
          }
        }
      );
    }
  });
};

const sendParcelUpdate = async (email, first_name, parcel) => {
  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Pickupman",
      link: "https://mailgen.js/",
      copyright: "Copyright © 2024 Pickupman. All rights reserved.",
      logo: "https://firebasestorage.googleapis.com/v0/b/newfoodapp-6f76d.appspot.com/o/Pickupman%206.png?alt=media&token=acc0ed05-77de-472e-a12a-2eb2d6fbbb9a",
      logoHeight: "30px",
    },
  });

  let response = {
    body: {
      name: first_name,
      intro: `Your shipment with tracking number ${parcel.tracking_number} has been confirmed.`,
      table: {
        data: [
          {
            Item: "Tracking Number",
            Detail: parcel.tracking_number,
          },
        ],
      },
      signature: "Sincerely, Pickupman Team",
    },
  };

  let mail = MailGenerator.generate(response);

  let message = {
    from: process.env.EMAIL,
    to: email,
    subject: "Shipment Confirmed",
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
