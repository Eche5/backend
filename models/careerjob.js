const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const CareerJob = sequelize.define(
  "career_job",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    department: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    city: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    state: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING, // e.g., Full-time, Part-time, Contract
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING, // e.g., Full-time, Part-time, Contract
      allowNull: false,
    },
    description: {
      type: Sequelize.JSON, // store as array of strings
      allowNull: false,
    },
    requirements: {
      type: Sequelize.JSON, // store as array of strings
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

module.exports = CareerJob;
