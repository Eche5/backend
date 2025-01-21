const { check, body } = require("express-validator");
const Users = require("../models/users");

exports.email = check("email")
  .notEmpty()
  .withMessage("The email field cannot be empty")
  .isEmail()
  .withMessage("Enter a valid email address");
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
  .custom((value, { req }) => {
    return Users.findAll({
      where: {
        email: value,
      },
    }).then((user) => {
      console.log(user);
      if (user.length === 0) {
        return Promise.reject("User exists with this email");
      }
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
