const { check, body } = require("express-validator");
const db = require("../utils/db");

exports.email = check("email")
  .notEmpty()
  .withMessage("The email field cannot be empty")
  .isEmail()
  .withMessage("Enter a valid email address")
exports.password = body("password")
  .notEmpty()
  .withMessage("The password field requires a value")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters")
  .matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_#])[A-Za-z\d@$!%*?&_#]{8,}$/
  )
  .withMessage(
    "Password must contain at least one lowercase, one uppercase, one digit, and one special character"
  )
  .trim();

exports.user = check("email")
  .notEmpty()
  .withMessage("The email field cannot be empty")
  .isEmail()
  .withMessage("Enter a valid email address")
  .custom(async (value) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE email = ?",
        [value],
        (error, results) => {
          if (error) {
            return reject("Database query failed"); // Reject with a message, not an Error object
          }
          if (results.length > 0) {
            return reject("User exists with this email"); // Reject with a validation message
          } else {
            resolve(true); // No user found, continue
          }
        }
      );
    });
  });

exports.resetToken = body("resetToken")
  .notEmpty()
  .withMessage("Invalid reset token");
exports.catName = body("category_name")
  .notEmpty()
  .withMessage("Category name field is required");
exports.catType = body("category_type")
  .notEmpty()
  .withMessage("Category type field is required");
exports.subCatType = body("category_type")
  .notEmpty()
  .withMessage("subCtegory type field is required");

exports.oldPassword = body("oldPassword")
  .notEmpty()
  .withMessage("The password field requires a value")
  .isLength({ min: 8 })
  .withMessage("password must be at least 8 characters")
  .matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  )
  .withMessage(
    "Password must contain atleast one lowercase, one uppercase, one digit and one special character"
  )
  .trim();
exports.fullname = body("fullname")
  .notEmpty()
  .withMessage("Kindly enter your username")
  .custom((value, { req }) => {
    if (/[0-9\d@$!%*?&]/.test(value)) {
      throw new Error(
        "Invalid name. kindly ensure the name provided is valid must contain only alphabets"
      );
    } else {
      return !0;
    }
  });
