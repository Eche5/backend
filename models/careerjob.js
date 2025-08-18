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
    summary: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    working_hours: {
      type: Sequelize.STRING, // e.g., "9 AM - 5 PM"
      allowNull: false,
    },
    working_days: {
      type: Sequelize.STRING, // e.g., "Monday to Friday"
      allowNull: false,
    },
    salary: {
      type: Sequelize.DECIMAL(10, 2), // precise decimal for money
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
