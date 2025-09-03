const Parcels = require("../models/parcels");
const Users = require("../models/users");
const parcelTracking = require("../models/parcelTracking");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const {
  customerconsentFormTemplate,
} = require("../utils/emails/customerConsentForm");
const {
  sendFeedbackFormTemplate,
} = require("../utils/emails/sendFeedbackFormTemplate");

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 characters!
const IV_LENGTH = 16; // AES block size
exports.createshipment = async (req, res) => {
  const sender_id = req.user.id;

  const generateTrackingNumber = () => {
    return "TRK" + Math.random().toString().slice(2, 12).padStart(10, "0");
  };

  const tracking_number = generateTrackingNumber();

  try {
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
      tracking_number,
      item_name,
      quantity,
      state,
      receiver_state,
      landmark,
      receiver_landmark,
      status: "Created",
      payment_status: "Pending",
    });
    if (newShipment) {
      return res.status(201).json({
        success: true,
        code: 200,
        tracking_number,
        status: "success",
        msg: `Shipment with tracking number ${tracking_number}  created successfully`,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error });
  }
};

exports.GetUserParcel = async (req, res) => {
  const id = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;
  try {
    const parcels = await Parcels.findAll({
      where: { sender_id: id, payment_status: "paid" },
      order: [["created_at", "DESC"]],
      offset: offset,
      limit: 10,
    });
    const Deliveredparcels = await Parcels.count({
      where: { sender_id: id, payment_status: "paid", status: "Delivered" },
    });

    const totalItems = await Parcels.count({
      where: { sender_id: id, payment_status: "paid" },
    });
    if (!parcels) {
      return res.status(500).json({ success: false, message: parcels });
    } else {
      return res.status(200).json({
        Deliveredparcels,
        success: true,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page,
        parcels: parcels,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error });
  }
};
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
exports.getUserDetails = async (req, res) => {
  const id = req.user.id;
  const user = await Users.findAll({
    where: {
      id: id,
    },
  });

  if (user) {
    const decryptedNIN = user[0].nin ? decrypt(user[0].nin) : null;

    const userData = user[0];
    userData["nin"] = decryptedNIN;
    return res.status(200).json({
      status: true,
      userData,
    });
  }
};

exports.changeFeedback = async (req, res) => {
  try {
    const id = req.user.id;
    const { feedback } = req.body;

    await Users.update({ feedback: feedback }, { where: { id: id } });

    return res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update feedback",
      error: error.message,
    });
  }
};

exports.sendFeedback = async (req, res) => {
  const {
    email: customerEmail,
    PhoneNumber,
    overallSatisfaction,
    deliveredOnTime,
    delayDuration,
    trackingEase,
    communicationSatisfied,
    communicationImprovement,
    shippingCostReasonable,
    pricingThoughts,
    customerServiceRating,
    packageCondition,
    packageIssue,
    deliveryCoverage,
    locationSuggestions,
    npsScore,
    openFeedback,
  } = req.body;

  try {
    const { subject, html } = sendFeedbackFormTemplate(
      email,
      PhoneNumber,
      overallSatisfaction,
      deliveredOnTime,
      delayDuration,
      trackingEase,
      communicationSatisfied,
      communicationImprovement,
      shippingCostReasonable,
      pricingThoughts,
      customerServiceRating,
      packageCondition,
      packageIssue,
      deliveryCoverage,
      locationSuggestions,
      npsScore,
      openFeedback
    );
    await sendEmail({ to: "support@pickupmanng.ng", subject, html });
    return res.status(200).json({
      success: true,
      message: "feedback successfully sent",
    });
  } catch (err) {
    console.error("Error sending feedback mail:", err);
    return false;
  }
};

exports.customerconsent = async (req, res) => {
  const { email, phone, first_name, last_name } = req.body;

  try {
    const { subject, html } = customerconsentFormTemplate(
      email,
      phone,
      first_name,
      last_name
    );
    await sendEmail({ to: "Support@pickupmanng.ng", subject, html });
    return res.status(200).json({
      success: true,
      message: "feedback successfully sent",
    });
  } catch (err) {
    console.error("Error sending feedback mail:", err);
    return false;
  }
};

// Encrypt a string (e.g., NIN)
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}
exports.updateUsersDetails = async (req, res) => {
  const {
    first_name,
    last_name,
    street,
    landmark,
    city,
    country,
    state,
    postal_code,
    phonenumber,
    alternate_phone,
    nin, // Store the full NIN in database
    birth_date,
    marital_status,
    health_issues,
    spouse_name,
    spouse_employer,
    spouse_workplace,
    next_of_kin_name,
    next_of_kin_relationship,
    bank_name,
    profile_picture,
    bank_account_number,
    bank_account_name,
    next_of_kin_phone,
    next_of_kin_email,
    next_of_kin_address,
  } = req.body;
  const id = req.user.id;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "user does not exist",
    });
  }
  const encryptedNIN = nin ? encrypt(nin) : undefined;

  try {
    const user = await Users.findAll({ where: { id: id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      const updatedUser = await Users.update(
        {
          first_name,
          last_name,
          street,
          landmark,
          city,
          country,
          state,
          postal_code,
          phonenumber,
          profile_picture,
          alternate_phone,
          nin: encryptedNIN, // Store the full NIN in database
          birth_date,
          bank_name,
          bank_account_number,
          bank_account_name,
          marital_status,
          health_issues,
          spouse_name,
          spouse_employer,
          spouse_workplace,
          next_of_kin_name,
          next_of_kin_relationship,
          next_of_kin_phone,
          next_of_kin_email,
          next_of_kin_address,
        },
        { where: { id: id } }
      );

      return res.status(200).json({
        success: true,
        message: "User data successfully updated",
        data: updatedUser,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user data",
      error: error.message,
    });
  }
};

exports.getParcelByTrackingNumber = async (req, res) => {
  const { tracking_number } = req.params;
  try {
    const tracking = await parcelTracking.findAll({
      where: { tracking_number: tracking_number },
      order: [["created_at", "DESC"]],
    });
    if (tracking) {
      const parcel = await Parcels.findOne({
        where: { tracking_number: tracking_number },
      });
      const randomId = Math.floor(Math.random() * 90000) + 10000;

      const created_Shipment = {
        id: randomId,
        tracking_number: tracking_number,
        status: "Shipment Created",
        createdAt: parcel.createdAt,
        updatedAt: parcel.updatedAt,
      };
      tracking.push(created_Shipment);
      let parcelData = null;
      if (parcel) {
        parcelData = {
          deliveryAddress: `${parcel.receiver_street_address}, ${parcel.receiver_city}, ${parcel.receiver_state}, ${parcel.receiver_region}`,
          trackingNumber: parcel.tracking_number,
          status: parcel.status,
          estimatedDelivery: parcel.estimated_delivery_date,
          origin: `${parcel.city}, ${parcel.state}, ${parcel.region}`,
          destination: `${parcel.receiver_city}, ${parcel.receiver_state}, ${parcel.receiver_region}`,
          service: parcel.selected_deliverymode,
          weight: `${parcel.parcel_weight} kg`,
          history: tracking,
        };
      }

      return res.status(200).json({
        status: true,
        tracking: parcelData,
      });
    }
  } catch (error) {
    return res.status(401).json({
      status: false,
      msg: "shipment with this tracking number not found",
    });
  }
};
