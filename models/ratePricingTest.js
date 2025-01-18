const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const RatePricingTest = sequelize.define(
  "rate_pricingtest",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    shipping_type: {
      type: Sequelize.ENUM("express", "economy"),
      allowNull: false,
    },
    zone: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    weight_from: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
    },
    weight_to: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    },
    rate: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "rate_pricingtest",
    indexes: [
      {
        unique: true,
        fields: ["shipping_type", "zone", "weight_from", "weight_to"],
      },
    ],
  }
);


module.exports = RatePricingTest;
