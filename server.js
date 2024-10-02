const app = require("./app");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise"); // Use promise-based connection with pooling
dotenv.config({ path: ".env" });
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your needs
  queueLimit: 0,
});
async function testDatabaseConnection() {
  try {
    const connection = await db.getConnection(); // Get a connection from the pool
    console.log("Connected to DB");
    connection.release(); // Release it back to the pool after use
  } catch (error) {
    console.error("Failed to connect to DB:", error);
    process.exit(1); // Exit the process if connection fails
  }
}

const PORT = process.env.PORT;

// Start the server only after confirming DB connection
async function startServer() {
  await testDatabaseConnection(); // Ensure DB is connected before starting the server
  app.listen(PORT, () => {
    console.log(`Running on PORT ${PORT}`);
  });
}

startServer();
