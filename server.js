const app = require("./app");
const dotenv = require("dotenv");
const mysql = require("mysql2");
dotenv.config({ path: ".env" });
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});
db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("connected to db");
  }
});
const PORT = process.env.PORT;
console.log(PORT);
app.listen(PORT, () => {
  console.log(`running on PORT ${PORT}`);
});
