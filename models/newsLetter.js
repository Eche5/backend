const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Newsletter = sequelize.define(
  "newsletter",
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
  },
  {
    timestamps: true,
    underscored: true,
  }
);

module.exports = Newsletter;
