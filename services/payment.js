const axios = require("axios");
const _ = require("lodash");
const db = require("../utils/db");
const { initializePayment, verifyPayment } =
  require("../config/paystack")(axios);

module.exports = class PaymentService {
  startPayment(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const formData = _.pick(data, [
          "amount",
          "email",
          "full_name",
          "tracking_number",
        ]);
        formData.metadata = {
          full_name: formData.full_name,
          tracking_number: formData.tracking_number,
        };
        formData.amount *= 100;
        const response = await initializePayment(formData);
        return resolve(response.data);
      } catch (error) {
        error.source = "Start Payment Service";
        return reject(error);
      }
    });
  }

  async createPayment(req) {
    const ref = req.reference;
    if (!ref) {
      throw { code: 400, msg: "No reference passed in query!" };
    }

    try {
      // Verify payment through your verifyPayment function
      const response = await verifyPayment(ref);
      const { reference, amount, status } = response.data.data;
      const { email } = response.data.data.customer;
      const { full_name, tracking_number } = response.data.data.metadata;

      const newPayment = {
        reference,
        amount,
        email,
        fullname: full_name,
        status,
        tracking_number,
      };
      // Query the database to check if the payment already exists
      const query = "SELECT * FROM payments WHERE reference = ?";

      // Use a Promise to handle async db.query
      const existingPayment = await new Promise((resolve, reject) => {
        db.query(query, [reference], (error, result) => {
          if (error) {
            console.log(error);
            return reject(error);
          }
          resolve(result[0]); // Assuming you get a list and need the first item
        });
      });
      let payment;

      if (existingPayment) {
        // Update existing payment's status
        const updateQuery =
          "UPDATE payments SET status = ? WHERE reference = ?";
        await new Promise((resolve, reject) => {
          db.query(updateQuery, [status, reference], (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          });
        });

        payment = { ...existingPayment, status };
      } else {
        const insertQuery = `
        INSERT INTO payments (reference, amount, email, full_name, status, tracking_number) 
        VALUES (?, ?, ?, ?, ?, ?)`;
        await new Promise((resolve, reject) => {
          db.query(
            insertQuery,
            [reference, amount, email, full_name, status, tracking_number],
            (error, result) => {
              if (error) {
                return reject(error);
              }
              resolve(result);
            }
          );
        });

        payment = newPayment; // Use the new payment object
      }

      return payment; // Return the final payment object
    } catch (error) {
      error.source = "Create Payment Service";
      throw error; // Handle error properly
    }
  }

  paymentReceipt(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const reference = body.reference;
        const transaction = Payment.findOne({ reference: reference });
        return resolve(transaction);
      } catch (error) {
        error.source = "Create Payment Service";
        return reject(error);
      }
    });
  }
};
