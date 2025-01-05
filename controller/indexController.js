const db = require("../utils/db");
const PaymentService = require("../services/payment");
const walletPaymentService = require("../services/walletPayment");
const walletpaymentInstance = new walletPaymentService();
const paymentInstance = new PaymentService();
const Mailgen = require("mailgen");
const nodemailer = require("nodemailer");

exports.GetAllParcels = (req, res) => {
  const query =
    "SELECT * FROM pickupman.parcels WHERE payment_status = 'paid' ORDER BY created_at DESC";
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
    WHERE parcels.sender_id = ? ORDER BY created_at DESC;
  `;

  db.query(query, [id], (error, parcel) => {
    if (error) {
      return res.status(500).json({ success: false, message: error });
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
        (updateError, result) => {
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
            data: { payment: response, order, state: results[0]?.state },
          });

          sendParcelUpdate(
            req.user.email,
            req.user.first_name,
            response.tracking_number,
            results[0].state
          ).catch((emailError) => {
            console.error("Failed to send parcel update email:", emailError);
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
      AND rp.weight_from = ?;
  `;

  db.query(query, [country, weight], (error, rates) => {
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
  const { state, shipping_types, sender_state, city } = req.body;
  const query = `
  SELECT rate, shipping_type, duration
  FROM rate_pricing_local
  WHERE state = ?
    AND (sender_state = ? OR sender_state = 'ALL')
    AND shipping_type IN (?)
`;

  const additionalData = {
    shipping_type: "standard",
    rate: "8700.00",
    duration:
      "4-5 business days after the drop-off day (weekends and public holidays not included)",
  };

  db.query(query, [state, sender_state, shipping_types], (error, results) => {
    if (error) {
      return res
        .status(500)
        .json({ success: false, message: "Database error", error });
    }
    let combinedResults = [...results];
    if (
      (city === "Abuja" && sender_state === "Lagos") ||
      (city === "Port Harcourt" && sender_state === "Lagos") ||
      (city === "Port Harcourt" && sender_state === "Abuja") ||
      (city === "Lagos" && sender_state === "Abuja")
    ) {
      combinedResults = combinedResults.filter(
        (rate) =>
          rate.shipping_type === "next_day_doorstep" ||
          rate.shipping_type === "next_day_terminal" ||
          rate.shipping_type === "economy"
      );
    } else if (
      city === "Port Harcourt" ||
      sender_state !== "Lagos" ||
      sender_state !== "Abuja"
    ) {
      combinedResults = combinedResults.filter(
        (rate) =>
          rate.shipping_type === "economy" ||
          rate.shipping_type === "next_day_doorstep"
      );
    } else {
      combinedResults = combinedResults.filter(
        (rate) => rate.shipping_type !== "next_day_terminal"
      );
    }

    res.status(200).json({
      success: true,
      message: "Shipping rates found",
      rates: combinedResults, // Return the combined results
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
              async (updateError) => {
                if (updateError) {
                  return res.status(500).json({
                    success: false,
                    message: "Failed to update payment status",
                    error: updateError,
                  });
                }
                await sendParcelUpdate(
                  req.user.email,
                  req.user.first_name,
                  tracking_number
                );
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

const sendParcelUpdate = async (email, first_name, tracking_number, state) => {
  const dropOffLocations = [
    {
      city: "Yaba",
      state: "Lagos",
      address:
        "Shop A3039, 2nd Floor, Tejuosho Ultra Modern Market, Phase 1, Yaba, Lagos State",
      note: "Staff are not permitted to leave the office to receive parcels outside.",
      hours: "Offices are open from 9 am to 5 pm.",
      contact: {
        locationName: "Lagos",
        phone: "08141892503",
      },
    },
    {
      city: "Port Harcourt",
      state: "Rivers",
      address: "HONEYMOON PLAZA, No 14 Rumuola Rd, Rurowolukwo, Port Harcourt",
      note: "Staff are not permitted to leave the office to receive parcels outside.",
      hours: "Offices are open from 9 am to 5 pm.",
      contact: {
        locationName: "PHC",
        phone: "07062021236",
      },
    },
    {
      city: "Abuja",
      state: "Abuja Federal Capital Territory",
      address:
        "Suite BX2, Ground Floor, Zitel Plaza, located beside Chida Hotel Utako",
      note: "Staff are not permitted to leave the office to receive parcels outside.",
      hours: "Offices are open from 9 am to 5 pm.",
      contact: {
        locationName: "Abuja",
        phone: "08137167867",
      },
    },
  ];

  const location = dropOffLocations.find((loc) => loc.state === state);
  const locationDetails = location
    ? `You can drop off your package at ${location.address}. ${location.note} Offices are open from 9 am to 5 pm. Contact: ${location.contact.locationName} - ${location.contact.phone}`
    : "Please check with our nearest office for drop-off locations.";

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

  let response = {
    body: {
      name: first_name,
      intro: `Your shipment with tracking number ${tracking_number} has been confirmed. Kindly ensure to write the tracking number on your parcel before bringing it to our office. ${locationDetails}`,
      table: {
        data: [
          {
            Item: "Tracking Number",
            Detail: tracking_number,
          },
        ],
      },
      signature: "Sincerely,",
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
    host: "smtp.zeptomail.com",
    port: 587,
    auth: {
      user: "emailapikey",
      pass: "wSsVR60k+0H0Dqd6zmarL+w4mV4DVAzxEkwrjgbw4nCqSK/Fp8dpxESfDQWhHfccFjNhRjdE9eosnhtW0mAOjtUlnw0EDiiF9mqRe1U4J3x17qnvhDzJWWxbkBWNJI0OwglunGdkF88h+g==",
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
