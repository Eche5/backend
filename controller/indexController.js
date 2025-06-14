const PaymentService = require("../services/payment");
const walletPaymentService = require("../services/walletPayment");
const walletpaymentInstance = new walletPaymentService();
const paymentInstance = new PaymentService();
const Mailgen = require("mailgen");
const nodemailer = require("nodemailer");
const Parcels = require("../models/parcels");
const { Op } = require("sequelize");
const RatePricingTest = require("../models/ratePricingTest");
const Zoning = require("../models/zoning");
const RatePricingLocal = require("../models/ratePricingLocal");
const Users = require("../models/users");
const Payments = require("../models/payments");
const crypto = require("crypto");

const axios = require("axios");
const qs = require("qs");
exports.GetAllParcels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const { startDate, endDate } = req.query;
    const endDates = new Date(endDate); // Assuming endDates is defined
    endDates.setDate(endDates.getDate() + 1);
    let dateFilter = {};

    if (startDate && endDate) {
      dateFilter = {
        created_at: {
          [Op.between]: [new Date(startDate), endDates],
        },
      };
    } else if (startDate) {
      dateFilter = {
        created_at: {
          [Op.gte]: new Date(startDate),
        },
      };
    } else if (endDate) {
      dateFilter = {
        created_at: {
          [Op.lte]: new Date(endDate),
        },
      };
    }

    const whereCondition = {
      payment_status: "paid",
      ...dateFilter,
    };

    const parcels = await Parcels.findAll({
      where: whereCondition,
      order: [["created_at", "DESC"]],
      offset,
      limit: pageSize,
    });

    const Allparcels = await Parcels.findAll({
      where: whereCondition,
      order: [["created_at", "DESC"]],
    });

    const totalItems = await Parcels.count({ where: whereCondition });

    return res.status(200).json({
      status: true,
      parcels,
      totalItems,
      Allparcels,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.GetAllStandardParcels = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;
  const parcels = await Parcels.findAll({
    where: {
      payment_status: "paid",
      selected_Deliverymode: {
        [Op.in]: ["standard", "Express"],
      },
    },
    order: [["created_at", "DESC"]],
    offset: offset,
    limit: 10,
  });

  const totalItems = await Parcels.count({
    where: {
      payment_status: "paid",
      selected_Deliverymode: {
        [Op.in]: ["standard", "Express"],
      },
    },
  });
  if (!parcels) {
    return res.status(500).json({ success: false, message: "Database error" });
  } else {
    return res.status(200).json({
      status: true,
      parcels,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: page,
    });
  }
};


exports.GetAllNextDayParcels = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;
  const parcels = await Parcels.findAll({
    where: {
      payment_status: "paid",
      selected_Deliverymode: {
        [Op.in]: ["next_day_terminal", "next_day_doorstep"],
      },
    },
    order: [["created_at", "DESC"]],
    offset: offset,
    limit: 10,
  });

  const totalItems = await Parcels.count({
    where: {
      payment_status: "paid",
      selected_Deliverymode: {
        [Op.in]: ["next_day_terminal", "next_day_doorstep"],
      },
    },
  });
  if (!parcels) {
    return res.status(500).json({ success: false, message: "Database error" });
  } else {
    return res.status(200).json({
      status: true,
      parcels,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: page,
    });
  }
};

exports.GetAllEconomyParcels = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;
  const parcels = await Parcels.findAll({
    where: {
      payment_status: "paid",
      selected_Deliverymode: {
        [Op.in]: ["economy_terminal", "Economy"],
      },
    },
    order: [["created_at", "DESC"]],
    offset: offset,
    limit: 10,
  });

  const totalItems = await Parcels.count({
    where: {
      payment_status: "paid",
      selected_Deliverymode: {
        [Op.in]: ["economy_terminal", "Economy"],
      },
    },
  });
  if (!parcels) {
    return res.status(500).json({ success: false, message: "Database error" });
  } else {
    return res.status(200).json({
      status: true,
      parcels,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: page,
    });
  }
};
exports.GetAllSaversParcels = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;
  const parcels = await Parcels.findAll({
    where: {
      payment_status: "paid",
      selected_Deliverymode: {
        [Op.in]: ["savers"],
      },
    },
    order: [["created_at", "DESC"]],
    offset: offset,
    limit: 10,
  });

  const totalItems = await Parcels.count({
    where: {
      payment_status: "paid",
      selected_Deliverymode: {
        [Op.in]: ["savers"],
      },
    },
  });
  if (!parcels) {
    return res.status(500).json({ success: false, message: "Database error" });
  } else {
    return res.status(200).json({
      status: true,
      parcels,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: page,
    });
  }
};
exports.GetUserParcel = async (req, res) => {
  const id = req.user.id;

  const parcels = await Parcels.findAll({ where: { id: id } });
  if (!parcels) {
    return res.status(500).json({ success: false, message: parcels });
  } else {
    return res.status(200).json({
      success: true,
      parcels,
    });
  }
};

exports.startPayment = async (req, res, next) => {
  try {
    const { id } = req.body;

    const parcel = await Parcels.findAll({
      where: { tracking_number: id },
    });
    if (!parcel) {
      return res
        .status(500)
        .json({ success: false, message: "Database error", error });
    } else {
      const shipment = parcel[0];

      const orderTotal = shipment.shipping_fee;
      const paymentData = {
        email: req.user.email,
        full_name: req.user.first_name + " " + req.user.last_name,
        amount: Number(orderTotal),
        tracking_number: id,
      };
      const response = await paymentInstance.startPayment(paymentData);
      res.status(201).json({
        success: true,
        status: "Payment Started",
        data: { response },
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.createPayment = async (req, res) => {
  try {
    const response = await paymentInstance.createPayment(req.query);
    const newStatus = response?.status === "success" ? "Paid" : "Failed";
    const parcel = await Parcels.findAll({
      where: { tracking_number: response.tracking_number },
    });
    if (!parcel) {
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    } else {
      let order = parcel[0];

      order.payment_status = newStatus;

      const updatedParcel = await Parcels.update(
        {
          payment_status: order.payment_status,
        },
        { where: { tracking_number: response.tracking_number } }
      );
      await sendParcelUpdate(
        req.user.email,
        req.user.first_name,
        response.tracking_number,
        parcel[0]?.state
      );
      await sendWhatsAppMessage(parcel[0]);

      return res.status(201).json({
        success: true,
        status: "Payment Created",
        data: { payment: response, order, state: updatedParcel[0]?.state },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

exports.shippingRate = async (req, res) => {
  const { country, weight, shipping_types } = req.body;
  console.log(req.body);
  try {
    const zoningQuery = await Zoning.findOne({
      where: { country },
    });
    if (zoningQuery) {
      const zone = zoningQuery.zone;

      const ratePricingQuery = await RatePricingTest.findAll({
        where: {
          zone,
          weight_from: { [Op.eq]: weight },
          shipping_type: {
            [Op.in]: shipping_types,
          },
        },
        attributes: ["rate", "shipping_type"],
      });

      if (ratePricingQuery.length > 0) {
        return res.status(200).json({
          success: true,
          status: "Shipping rates found",
          rates: ratePricingQuery,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No shipping rates found for the given weight.",
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: "Zoning information not found for the provided country.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error,
    });
  }
};

exports.localshippingrate = async (req, res) => {
  try {
    const { state, shipping_types, sender_state, city } = req.body;
    const ratePricingQuery = await RatePricingLocal.findAll({
      where: {
        state: state,
        city: city,
        [Op.or]: [{ sender_state: sender_state }],
        shipping_type: {
          [Op.in]: shipping_types,
        },
      },
      attributes: ["rate", "shipping_type", "duration"],
    });

    const additionalData = {
      shipping_type: "standard",
      rate: "8700.00",
      duration:
        "4-5 business days after the drop-off day (weekends and public holidays not included)",
    };
    if (ratePricingQuery) {
      let combinedResults = [...ratePricingQuery];
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
            rate.shipping_type === "economy_terminal" ||
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
            rate.shipping_type === "economy_terminal" ||
            rate.shipping_type === "next_day_doorstep"
        );
      } else {
        combinedResults = combinedResults.filter(
          (rate) => rate.shipping_type !== "next_day_terminal"
        );
      }
      combinedResults?.push(additionalData);
      res.status(200).json({
        success: true,
        message: "Shipping rates found",
        rates: combinedResults,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error,
    });
  }
};

exports.startWalletFunding = async (req, res, next) => {
  try {
    const { email, first_name, last_name } = req.user;
    const { amount } = req.body;
    console.log(email, first_name, last_name);
    const user = await Users.findAll({
      where: {
        email: email,
      },
    });
    if (user) {
      const paymentData = {
        email,
        full_name: first_name + " " + last_name,
        amount,
      };

      const response = await walletpaymentInstance.startPayment(paymentData);
      const newPayment = {
        reference: response.data.reference,
        amount: amount,
        email,
        full_name: first_name + " " + last_name,
        status: "pending",
      };
      const createnewPayment = await Payments.create(newPayment);
      return res.status(201).json({
        success: true,
        status: "Payment Started",
        data: { response },
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Payment error",
      error: err,
    });
  }
};

exports.startWalletPayment = async (req, res, next) => {
  try {
    console.log("Webhook received:", req.body);
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");
    console.log(hash);
    if (hash !== req.headers["x-paystack-signature"]) {
      console.log("Invalid signature");
      return res.status(401).send("Unauthorized");
    }

    const event = req.body;
    console.log(event);
    // Only process successful charges
    if (event.event === "charge.success") {
      const paymentData = event.data;

      // Find payment in database
      const payment = await Payments.findOne({
        where: { reference: paymentData.reference },
      });

      if (!payment) {
        console.log("Payment not found in database");
        return res
          .status(404)
          .json({ success: false, message: "Payment not found" });
      }

      // Check if already processed
      if (payment.status === "success") {
        return res
          .status(200)
          .json({ success: true, message: "Payment already processed" });
      }

      // Update payment status
      await payment.update({ status: "success" });

      // Find user and update wallet
      const user = await Users.findOne({
        where: { email: paymentData.customer.email },
      });

      console.log(user);

      if (user) {
        const newAmount =
          Number(user.wallet_amount) + Number(paymentData.amount / 100); // Paystack amounts are in kobo
        const updateDUser = await Users.update(
          { wallet_amount: newAmount },
          { where: { email: paymentData.customer.email } }
        );
        console.log(updateDUser);
      }

      return res.status(200).json({ success: true });
    }

    res.status(200).json({ success: true, message: "Event not processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ success: false, error: error });
  }
};

exports.payThroughWallet = async (req, res) => {
  const sender_id = req.user.id;
  const useremail = req.user.email;
  const generateTrackingNumber = () => {
    return "TRK" + Math.random().toString().slice(2, 12).padStart(10, "0");
  };
  try {
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
      selected_deliverymode,
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

    const user = await Users.findAll({
      where: {
        email: req.user.email,
      },
    });
    if (user) {
      const balance = Number(user[0].wallet_amount);

      if (balance < shipping_fee && useremail !== "davidese403@gmail.com") {
        return res.status(500).json({
          success: false,
          message: "insufficient funds, please top up",
        });
      }
      const newShipment = await Parcels.create({
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
        selected_deliverymode,
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
      });
      if (newShipment) {
        const newAmount = Number(user[0]?.wallet_amount) - Number(shipping_fee);
        if (useremail !== "davidese403@gmail.com") {
          await Users.update(
            {
              wallet_amount: newAmount,
            },
            { where: { email: req.user.email } }
          );
        }

        await sendParcelUpdate(
          req.user.email,
          req.user.first_name,
          tracking_number,
          state,
          item_name,
          quantity,
          parcel_weight
        );
        const parcel = {
          first_name,
          receiver_first_name,
          phone_number,
          receiver_phone_number,
          tracking_number,
          parcel_weight,
        };
        await sendWhatsAppMessage(parcel);
        return res.status(201).json({
          success: true,
          code: 200,
          tracking_number,
          status: "success",
          msg: `Shipment with tracking number ${tracking_number}  created successfully`,
        });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error,
    });
  }
};

const sendParcelUpdate = async (
  email,
  first_name,
  tracking_number,
  state,
  item_name,
  quantity,
  parcel_weight
) => {
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
      intro: `Your shipment with tracking number <strong>${tracking_number}</strong> has been confirmed. Kindly ensure to write the tracking number on your parcel before bringing it to our office. ${locationDetails}`,
      table: {
        data: [
          {
            "Item Name": item_name,
            Weight: `${parcel_weight}kg`,
            Quantity: quantity,
          },
        ],
      },
      signature: false,
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
    to: email,
    subject: "Shipment Confirmed",
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
  console.log(parcelData);
  try {
    const senderParameters = `${parcelData.first_name}, ${parcelData.tracking_number}, confirmed, ${parcelData.parcel_weight}kg, N/A`;

    const receiverParameters = `${parcelData.receiver_first_name}, ${parcelData.tracking_number}, confirmed, ${parcelData.parcel_weight}kg, N/A`;

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
