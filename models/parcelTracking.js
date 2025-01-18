const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const ParcelTracking = sequelize.define(
  "parcelTracking",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    tracking_number: {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true,
    },
    status: {
      type: Sequelize.ENUM(
        "Shipment received at PICKUPMAN facility ABUJA – NIGERIA",
        "Confirmed",
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
        "Arrived at PICKUPMAN Sort Facility PORT HARCOURT – NIGERIA",
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
        "Created"
      ),
      allowNull: false,
      defaultValue: "Created",
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);


module.exports = ParcelTracking;
