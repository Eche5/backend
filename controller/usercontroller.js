const Parcels = require("../models/parcels");
const Users = require("../models/users");
const parcelTracking = require("../models/parcelTracking");

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

    const totalItems = await Parcels.count({
      where: { sender_id: id, payment_status: "paid" },
    });
    if (!parcels) {
      return res.status(500).json({ success: false, message: parcels });
    } else {
      return res.status(200).json({
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

exports.getUserDetails = async (req, res) => {
  const id = req.user.id;
  const user = await Users.findAll({
    where: {
      id: id,
    },
  });
  if (user) {
    const userData = user[0];
    return res.status(200).json({
      status: true,
      userData,
    });
  }
};

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
    phone_number,
  } = req.body;
  const id = req.user.id;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "user does not exist",
    });
  }

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
          phone_number,
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
