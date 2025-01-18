const axios = require("axios");
const _ = require("lodash");
const { initializePayment, verifyPayment } =
  require("../config/paystack")(axios);

const Payments = require("../models/payments");

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
      const existingPayment = await Payments.findAll({
        where: { reference: reference },
      });
      let payment;

      if (existingPayment.length === 0) {
        const createnewPayment = await Payments.create({
          reference,
          amount: newPayment.amount,
          email,
          full_name,
          status,
          tracking_number,
        });
        payment = createnewPayment;
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
        const payment = await Payments.findAll({
          where: { reference: reference },
        });
        if (!payment) {
          return reject(error);
        }
        return resolve(transaction);
      } catch (error) {
        error.source = "Create Payment Service";
        return reject(error);
      }
    });
  }
};
