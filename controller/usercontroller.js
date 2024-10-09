const db = require("../utils/db");

exports.createshipment = async (req, res) => {
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
    FROM railway.parcels 
    INNER JOIN users ON parcels.sender_id = users.id 
    WHERE parcels.sender_id = ?;
  `;
  db.query(query, [id], (error, parcel) => {
    if (error) {
      return res.status(500).json({ success: false, message: error });
    } else {
      return res.status(200).json({
        totalNumber: parcel.length,
        success: true,
        parcel,
      });
    }
  });
};

exports.getUserDetails = (req, res) => {
  const id = req.user.id;
  console.log(id);
  const query = "SELECT * FROM users where id =?";

  db.query(query, [id], (error, user) => {
    if (error) {
      return res.state(404).json({
        status: false,
        msg: "database erro",
      });
    } else {
      const userData = user[0];
      return res.status(200).json({
        status: true,
        userData,
      });
    }
  });
};

exports.updateUsersDetails = (req, res) => {
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
  let query = "UPDATE users SET ";
  let values = [];

  if (first_name) {
    query += "first_name = ?, ";
    values.push(first_name);
  }
  if (last_name) {
    query += "last_name = ?, ";
    values.push(last_name);
  }
  if (street) {
    query += "street = ?, ";
    values.push(street);
  }
  if (state) {
    query += "state = ?, ";
    values.push(state);
  }
  if (city) {
    query += "city = ?, ";
    values.push(city);
  }
  if (landmark) {
    query += "landmark = ?, ";
    values.push(landmark);
  }
  if (country) {
    query += "country = ?, ";
    values.push(country);
  }
  if (phone_number) {
    query += "phone_number = ?, ";
    values.push(phone_number);
  }

  if (postal_code) {
    query += "postal_code = ?, ";
    values.push(postal_code);
  }

  query = query.slice(0, -2);

  query += " WHERE id = ?";
  values.push(id);

  db.query(query, values, (error, user) => {
    if (error) {
      res.status(401).json({
        status: false,
        msg: "user data update failed",
      });
    } else {
      res.status(200).json({
        status: true,
        msg: "user data successfully updated",
      });
    }
  });
};
exports.getParcelByTrackingNumber = (req, res) => {
  const { tracking_number } = req.params;
  try {
    const query = "SELECT * FROM ParcelTracking WHERE tracking_number = ? ORDER BY timestamp DESC";
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