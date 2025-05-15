const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Parcels = sequelize.define(
  "parcels",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    sender_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    first_name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    phone_number: {
      type: Sequelize.STRING(20),
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    city: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    region: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    postal_code: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    social_media_handle: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    receiver_first_name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    receiver_last_name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    receiver_email: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    receiver_phone_number: {
      type: Sequelize.STRING(20),
      allowNull: false,
    },
    receiver_city: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    receiver_region: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    receiver_postal_code: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    receiver_social_media_handle: {
      type: Sequelize.STRING(100),
      defaultValue: "",
    },
    street_address: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    receiver_street_address: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    insurance: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    fragile: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    parcel_weight: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    parcel_price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    package_description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    selected_deliverymode: {
      type: Sequelize.ENUM(
        "Standard",
        "Express",
        "Economy",
        "next_day_terminal",
        "next_day_doorstep"
      ),
      allowNull: false,
    },
    shipping_fee: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_status: {
      type: Sequelize.ENUM("Pending", "Paid", "Failed"),
      defaultValue: "Pending",
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM(
        "Shipment received at PICKUPMAN facility ABUJA – NIGERIA",
        "Shipment received at PICKUPMAN facility LAGOS – NIGERIA",
        "Shipment received at PICKUPMAN facility PORT HARCOURT – NIGERIA",
        "Processed at ABUJA – NIGERIA",
        "Processed at LAGOS – NIGERIA",
        "Processed at PORT HARCOURT – NIGERIA",
        "Shipment has departed from a PICKUPMAN facility ABUJA – NIGERIA",
        "Shipment has departed from a PICKUPMAN facility LAGOS – NIGERIA",
        "Shipment has departed from a PICKUPMAN facility PORT HARCOURT - NIGERIA",
        "Arrived at PICKUPMAN Sort Facility ABUJA – NIGERIA",
        "Arrived at PICKUPMAN Sort Facility ENUGU CITY – NIGERIA",
        "Arrived at PICKUPMAN Sort Facility LAGOS – NIGERIA",
        "Arrived at PICKUPMAN Sort Facility BENIN CITY – NIGERIA",
        "Arrived at PICKUPMAN Sort Facility IBADAN – NIGERIA",
        "Arrived at PICKUPMAN L Sort Facility PORT HARCOURT – NIGERIA",
        "Arrived at PICKUPMAN Delivery Facility ABUJA – NIGERIA",
        "Arrived at PICKUPMAN Delivery Facility ENUGU CITY – NIGERIA",
        "Arrived at PICKUPMAN Delivery Facility BENIN CITY – NIGERIA",
        "Arrived at PICKUPMAN Delivery Facility IBADAN – NIGERIA",
        "Arrived at PICKUPMAN Delivery Facility LAGOS – NIGERIA",
        "Arrived at PICKUPMAN Delivery Facility PORT HARCOURT – NIGERIA",
        "Further receivers information needed – Contact Support Team.",
        "Awaiting collection by the consignee",
        "Shipment is out with courier for delivery",
        "Delivered",
        "Created",
        "Confirmed"
      ),
      defaultValue: "Created",
      allowNull: false,
    },
    tracking_number: {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true,
    },
    estimated_delivery_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    item_name: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    state: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    landmark: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    receiver_landmark: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    receiver_state: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    conversion_status: {
      type: Sequelize.STRING(50),
      defaultValue: "Not Converted",
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

module.exports = Parcels;
