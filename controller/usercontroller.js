const db = require("../utils/db");

exports.createshipment = async (req, res) => {
  const sender_id = req.user.id;

  // Tracking number generation
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
  console.log(shipping_fee)
  const status = "Created";
  const payment_status = "Pending";
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
        console.error("Error inserting shipment:", error);
        return res.status(500).json({
          success: false,
          code: 500,
          status: "error",
          msg: "Failed to create shipment",
        });
      } else {
        return res.status(201).json({
          success: true,
          code: 200,
          tracking_number,
          status: "success",
          msg: `Shipment with tracking number ${tracking_number}  created successfully`,
        });
      }
    }
  );
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
        totalNumber: parcel.length,
        success: true,
        parcel,
      });
    }
  });
};
