const app = require("./app");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
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
});


async function testDatabaseConnection() {
  try {
    const connection = await db.getConnection(); 
    console.log("Connected to DB");
    connection.release(); 
  } catch (error) {
    console.error("Failed to connect to DB:", error);
    process.exit(1);
  }
}

const PORT = process.env.PORT;

async function startServer() {
  await testDatabaseConnection(); 
  app.listen(PORT, () => {
    console.log(`Running on PORT ${PORT}`);
  });
}

startServer();
