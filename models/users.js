const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Users = sequelize.define(
  "user",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    first_name: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    last_name: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    phonenumber: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    role: {
      type: Sequelize.ENUM(
        "super_admin",
        "sub_admin",
        "sub_logistics_admin",
        "logistics_user",
        "processing_user",
        "customers_rep",
        "user"
      ),
      allowNull: false,
    },

    is_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    wallet_amount: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    country: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    state: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    city: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    postal_code: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    phone_number: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    landmark: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    street: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    resetToken: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    resetTokenExpires: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

module.exports = Users;
