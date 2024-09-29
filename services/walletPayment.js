const axios = require("axios");
const _ = require("lodash");
const db = require("../utils/db");
const { initializePayment, verifyPayment } =
  require("../config/walletpaystack")(axios);

module.exports = class PaymentService {
  startPayment(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const formData = _.pick(data, ["amount", "email", "full_name"]);
        formData.metadata = {
          full_name: formData.full_name,
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
      const { full_name } = response.data.data.metadata;

      const newPayment = {
        reference,
        amount: Number(amount) / 100, 
        email,
        fullname: full_name,
        status,
      };

      const query = "SELECT * FROM payments WHERE reference = ?";
      const existingPayment = await new Promise((resolve, reject) => {
        db.query(query, [reference], (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result[0]); 
        });
      });

      let payment;

      if (existingPayment) {
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
        INSERT INTO payments (reference, amount, email, full_name, status) 
        VALUES (?, ?, ?, ?, ?)`;
        let wallet_amount = Number(amount) / 100;
        await new Promise((resolve, reject) => {
          db.query(
            insertQuery,
            [reference, wallet_amount, email, full_name, status],
            (error, result) => {
              if (error) {
                return reject(error);
              }
              resolve(result);
            }
          );
        });

        payment = newPayment; 
      }

      return payment; 
    } catch (error) {
      error.source = "Create Payment Service";
      throw error; 
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
