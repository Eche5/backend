const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const RatePricingLocal = sequelize.define(
  "rate_pricing_local",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    state: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    shipping_type: {
      type: Sequelize.ENUM(
        "standard",
        "economy",
        "next_day_terminal",
        "next_day_doorstep"
      ),
      allowNull: true,
    },
    rate: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    },
    weight_from: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    },
    weight_to: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    },
    duration: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: true,
    },
    city: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    sender_state: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    sender_city: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "rate_pricing_local",
    timestamps: false, 
  }
);

module.exports = RatePricingLocal;
