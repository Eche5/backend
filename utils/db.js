const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

setInterval(() => {
  db.query("SELECT 1", (err) => {
    if (err) {
      console.error("Keep-alive query error:", err);
    }
  });
}, 60000); // Runs every 60 seconds

db.on('error', (err) => {
  console.error("Database connection error:", err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
    console.log("The database connection was lost. Please check the server status or network.");
  } else {
    throw err;
  }
});

module.exports = db;
