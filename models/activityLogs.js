const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Activitylogs = sequelize.define(
  "activitylogs",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    action: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    parcels: {
      type: Sequelize.JSON,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

module.exports = Activitylogs;
