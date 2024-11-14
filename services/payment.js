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
      const response = await verifyPayment(ref);
      const { reference, amount, status } = response.data.data;
      const { email } = response.data.data.customer;
      const { full_name, tracking_number } = response.data.data.metadata;

      const newPayment = {
        reference,
        amount: Number(amount) / 100,
        email,
        fullname: full_name,
        status,
        tracking_number,
      };

      const query = "SELECT * FROM payments WHERE reference = ?";
      db.query(query, [reference], (error, result) => {
        if (error) {
          console.error("Error checking existing payment:", error);
          return;
        }

        if (result && result.length > 0) {
          // Payment exists, so update it
          const updateQuery =
            "UPDATE payments SET status = ? WHERE reference = ?";
          db.query(
            updateQuery,
            [status, reference],
            (updateError, updateResult) => {
              if (updateError) {
                console.error("Error updating payment status:", updateError);
                return;
              }

              console.log("Payment updated:", updateResult);
            }
          );
        } else {
          // Payment does not exist, so insert it
          const insertQuery = `
          INSERT INTO payments (reference, amount, email, full_name, status, tracking_number) 
          VALUES (?, ?, ?, ?, ?, ?)
        `;
          db.query(
            insertQuery,
            [
              reference,
              newPayment.amount,
              email,
              full_name,
              status,
              tracking_number,
            ],
            (insertError, insertResult) => {
              if (insertError) {
                console.error("Error inserting new payment:", insertError);
                return;
              }

              console.log("New payment inserted:", insertResult);
            }
          );
        }
      });

      return newPayment;
    } catch (error) {
      error.source = "Create Payment Service";
      throw error;
    }
  }

  paymentReceipt(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const reference = body.reference;
        const query = "SELECT * FROM payments WHERE reference = ?";
        const transaction = await new Promise((resolve, reject) => {
          db.query(query, [reference], (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result[0]);
          });
        });
        return resolve(transaction);
      } catch (error) {
        error.source = "Create Payment Service";
        return reject(error);
      }
    });
  }
};
