const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Zoning = sequelize.define(
  "zoning",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    country: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    zone: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["country", "zone"],
      },
    ],
  }
);

module.exports = Zoning;
