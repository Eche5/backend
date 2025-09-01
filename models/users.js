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
    profile_picture: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    alternate_phone: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    // New field: National ID Number
    nin: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    // New field: Birth Date
    birth_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    // New field: Marital Status
    marital_status: {
      type: Sequelize.ENUM("single", "married", "divorced", "widowed"),
      allowNull: true,
    },
    // New field: Health Issues
    health_issues: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    // New fields: Spouse Information
    spouse_name: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    spouse_employer: {
      type: Sequelize.STRING(200),
      allowNull: true,
    },
    spouse_workplace: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    // New fields: Next of Kin Information
    next_of_kin_name: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    bank_name: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    bank_account_name: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    bank_account_number: {
      type: Sequelize.STRING(30),
      allowNull: true,
    },

    next_of_kin_address: { type: Sequelize.TEXT, allowNull: true },
    next_of_kin_relationship: {
      type: Sequelize.ENUM(
        "parent",
        "sibling",
        "child",
        "spouse",
        "friend",
        "other"
      ),
      allowNull: true,
    },
    next_of_kin_phone: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    next_of_kin_email: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    feedback: {
      type: Sequelize.ENUM("remind later", "rejected", "sent"),
      allowNull: true,
      defaultValue: "remind later",
    },
    role: {
      type: Sequelize.ENUM(
        "super_admin",
        "sub_admin",
        "sub_logistics_admin",
        "logistics_user",
        "processing_user",
        "dispatch_rider",
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
