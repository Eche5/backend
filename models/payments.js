const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Payments = sequelize.define(
  "payments",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    full_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    tracking_number: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    reference: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal(
        "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
      ),
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

module.exports = Payments;
