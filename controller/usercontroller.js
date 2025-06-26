const Parcels = require("../models/parcels");
const Users = require("../models/users");
const parcelTracking = require("../models/parcelTracking");
const nodemailer = require("nodemailer");

exports.createshipment = async (req, res) => {
  const sender_id = req.user.id;

  const generateTrackingNumber = () => {
    return "TRK" + Math.random().toString().slice(2, 12).padStart(10, "0");
  };

  const tracking_number = generateTrackingNumber();

  try {
    const {
      first_name,
      last_name,
      phone_number,
      email,
      city,
      region,
      postal_code,
      social_media_handle,
      receiver_first_name,
      receiver_last_name,
      receiver_email,
      receiver_phone_number,
      receiver_city,
      receiver_region,
      receiver_postal_code,
      receiver_social_media_handle,
      street_address,
      receiver_street_address,
      insurance = 0,
      fragile = 0,
      parcel_weight,
      parcel_price,
      package_description,
      selected_deliverymode,
      shipping_fee,
      item_name,
      quantity,
      state,
      receiver_state,
      landmark,
      receiver_landmark,
    } = req.body;

    const newShipment = await Parcels.create({
      sender_id,
      first_name,
      last_name,
      phone_number,
      email,
      city,
      region,
      postal_code,
      social_media_handle,
      receiver_first_name,
      receiver_last_name,
      receiver_email,
      receiver_phone_number,
      receiver_city,
      receiver_region,
      receiver_postal_code,
      receiver_social_media_handle,
      street_address,
      receiver_street_address,
      insurance,
      fragile,
      parcel_weight,
      parcel_price,
      package_description,
      selected_deliverymode,
      shipping_fee,
      tracking_number,
      item_name,
      quantity,
      state,
      receiver_state,
      landmark,
      receiver_landmark,
      status: "Created",
      payment_status: "Pending",
    });
    if (newShipment) {
      return res.status(201).json({
        success: true,
        code: 200,
        tracking_number,
        status: "success",
        msg: `Shipment with tracking number ${tracking_number}  created successfully`,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error });
  }
};

exports.GetUserParcel = async (req, res) => {
  const id = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;
  try {
    const parcels = await Parcels.findAll({
      where: { sender_id: id, payment_status: "paid" },
      order: [["created_at", "DESC"]],
      offset: offset,
      limit: 10,
    });
    const Deliveredparcels = await Parcels.count({
      where: { sender_id: id, payment_status: "paid", status: "Delivered" },
    });

    const totalItems = await Parcels.count({
      where: { sender_id: id, payment_status: "paid" },
    });
    if (!parcels) {
      return res.status(500).json({ success: false, message: parcels });
    } else {
      return res.status(200).json({
        Deliveredparcels,
        success: true,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page,
        parcels: parcels,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error });
  }
};

exports.getUserDetails = async (req, res) => {
  const id = req.user.id;
  const user = await Users.findAll({
    where: {
      id: id,
    },
  });
  if (user) {
    const userData = user[0];
    return res.status(200).json({
      status: true,
      userData,
    });
  }
};

exports.changeFeedback = async (req, res) => {
  try {
    const id = req.user.id;
    const { feedback } = req.body;

    await Users.update({ feedback: feedback }, { where: { id: id } });

    return res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update feedback",
      error: error.message,
    });
  }
};

exports.sendFeedback = async (req, res) => {
  const {
    email: customerEmail,
    PhoneNumber,
    overallSatisfaction,
    deliveredOnTime,
    delayDuration,
    trackingEase,
    communicationSatisfied,
    communicationImprovement,
    shippingCostReasonable,
    pricingThoughts,
    customerServiceRating,
    packageCondition,
    packageIssue,
    deliveryCoverage,
    locationSuggestions,
    npsScore,
    openFeedback,
  } = req.body;
  console.log("Received feedback data:", req.body);
  const submittedAt = new Date().toLocaleString("en-US", {});
  const emailContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shipping Feedback Submission</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
        }
        .meta-info {
            background-color: #f1f5f9;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 25px;
        }
        .section {
            margin-bottom: 25px;
            border-left: 4px solid #e2e8f0;
            padding-left: 20px;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        .section-title .emoji {
            margin-right: 8px;
            font-size: 20px;
        }
        .question {
            margin-bottom: 15px;
        }
        .question-text {
            font-weight: 500;
            color: #374151;
            margin-bottom: 5px;
        }
        .answer {
            background-color: #f8fafc;
            padding: 8px 12px;
            border-radius: 4px;
            border-left: 3px solid #2563eb;
        }
        .answer.negative {
            border-left-color: #dc2626;
            background-color: #fef2f2;
        }
        .answer.positive {
            border-left-color: #16a34a;
            background-color: #f0fdf4;
        }
        .nps-score {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            padding: 15px;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            line-height: 30px;
            margin: 10px auto;
            color: white;
        }
        .nps-detractor { background-color: #dc2626; }
        .nps-passive { background-color: #f59e0b; }
        .nps-promoter { background-color: #16a34a; }
        .highlight {
            background-color: #fef3c7;
            padding: 2px 6px;
            border-radius: 3px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Shipping Feedback Received</h1>
            <p>New customer feedback submission</p>
        </div>

        <div class="meta-info">
            <strong>Submission Details:</strong><br>
            📅 <strong>Date:</strong> ${submittedAt}<br>
            ${
              customerEmail
                ? `📧 <strong>Customer Email:</strong> ${customerEmail}<br>`
                : ""
            }
             ${
               PhoneNumber
                 ? `📧 <strong>Customer phone number:</strong> ${PhoneNumber}<br>`
                 : ""
             }
        </div>

        <div class="section">
            <div class="section-title">
                <span class="emoji">📦</span>
                General Satisfaction
            </div>
            <div class="question">
                <div class="question-text">Overall shipping experience satisfaction:</div>
                <div class="answer ${
                  overallSatisfaction?.includes("Dissatisfied")
                    ? "negative"
                    : overallSatisfaction?.includes("Satisfied")
                    ? "positive"
                    : ""
                }">
                    ${overallSatisfaction || "Not answered"}
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">
                <span class="emoji">⏱</span>
                Delivery Time
            </div>
            <div class="question">
                <div class="question-text">Delivered within expected timeframe:</div>
                <div class="answer ${
                  deliveredOnTime === "No"
                    ? "negative"
                    : deliveredOnTime === "Yes"
                    ? "positive"
                    : ""
                }">
                    ${deliveredOnTime || "Not answered"}
                </div>
            </div>
            ${
              delayDuration
                ? `
            <div class="question">
                <div class="question-text">Delay duration:</div>
                <div class="answer negative">
                    ${delayDuration}
                </div>
            </div>
            `
                : ""
            }
        </div>

        <div class="section">
            <div class="section-title">
                <span class="emoji">📍</span>
                Tracking & Communication
            </div>
            <div class="question">
                <div class="question-text">Ease of tracking shipment:</div>
                <div class="answer ${
                  trackingEase?.includes("Difficult")
                    ? "negative"
                    : trackingEase?.includes("Easy")
                    ? "positive"
                    : ""
                }">
                    ${trackingEase || "Not answered"}
                </div>
            </div>
            <div class="question">
                <div class="question-text">Satisfied with communication/updates:</div>
                <div class="answer ${
                  communicationSatisfied === "No"
                    ? "negative"
                    : communicationSatisfied === "Yes"
                    ? "positive"
                    : ""
                }">
                    ${communicationSatisfied || "Not answered"}
                </div>
            </div>
            ${
              communicationImprovement
                ? `
            <div class="question">
                <div class="question-text">Communication improvement suggestions:</div>
                <div class="answer">
                    ${communicationImprovement}
                </div>
            </div>
            `
                : ""
            }
        </div>

        <div class="section">
            <div class="section-title">
                <span class="emoji">💰</span>
                Cost & Value
            </div>
            <div class="question">
                <div class="question-text">Shipping cost was reasonable:</div>
                <div class="answer ${
                  shippingCostReasonable === "No"
                    ? "negative"
                    : shippingCostReasonable === "Yes"
                    ? "positive"
                    : ""
                }">
                    ${shippingCostReasonable || "Not answered"}
                </div>
            </div>
            ${
              pricingThoughts
                ? `
            <div class="question">
                <div class="question-text">Pricing thoughts:</div>
                <div class="answer">
                    ${pricingThoughts}
                </div>
            </div>
            `
                : ""
            }
        </div>

        <div class="section">
            <div class="section-title">
                <span class="emoji">🧑‍💼</span>
                Customer Service
            </div>
            <div class="question">
                <div class="question-text">Customer service experience rating:</div>
                <div class="answer ${
                  customerServiceRating === "Poor"
                    ? "negative"
                    : customerServiceRating === "Excellent"
                    ? "positive"
                    : ""
                }">
                    ${customerServiceRating || "Not answered"}
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">
                <span class="emoji">📦</span>
                Package Condition
            </div>
            <div class="question">
                <div class="question-text">Package delivered in good condition:</div>
                <div class="answer ${
                  packageCondition === "No"
                    ? "negative"
                    : packageCondition === "Yes"
                    ? "positive"
                    : ""
                }">
                    ${packageCondition || "Not answered"}
                </div>
            </div>
            ${
              packageIssue
                ? `
            <div class="question">
                <div class="question-text">Package issue description:</div>
                <div class="answer negative">
                    ${packageIssue}
                </div>
            </div>
            `
                : ""
            }
        </div>

        <div class="section">
            <div class="section-title">
                <span class="emoji">🌍</span>
                Delivery Coverage
            </div>
            <div class="question">
                <div class="question-text">Shipping service covered location adequately:</div>
                <div class="answer ${
                  deliveryCoverage === "No"
                    ? "negative"
                    : deliveryCoverage === "Yes"
                    ? "positive"
                    : ""
                }">
                    ${deliveryCoverage || "Not answered"}
                </div>
            </div>
            ${
              locationSuggestions
                ? `
            <div class="question">
                <div class="question-text">Location coverage suggestions:</div>
                <div class="answer">
                    ${locationSuggestions}
                </div>
            </div>
            `
                : ""
            }
        </div>

        <div class="section">
            <div class="section-title">
                <span class="emoji">⭐</span>
                Net Promoter Score (NPS)
            </div>
            <div class="question">
                <div class="question-text">Likelihood to recommend (0-10):</div>
                ${
                  npsScore
                    ? `
                <div class="nps-score ${
                  Number.parseInt(npsScore) <= 6
                    ? "nps-detractor"
                    : Number.parseInt(npsScore) <= 8
                    ? "nps-passive"
                    : "nps-promoter"
                }">
                    ${npsScore}
                </div>
                <div style="text-align: center; margin-top: 10px;">
                    <span class="highlight">
                        ${
                          Number.parseInt(npsScore) <= 6
                            ? "Detractor"
                            : Number.parseInt(npsScore) <= 8
                            ? "Passive"
                            : "Promoter"
                        }
                    </span>
                </div>
                `
                    : '<div class="answer">Not answered</div>'
                }
            </div>
        </div>

        ${
          openFeedback
            ? `
        <div class="section">
            <div class="section-title">
                <span class="emoji">💬</span>
                Open Feedback
            </div>
            <div class="question">
                <div class="question-text">Improvement suggestions:</div>
                <div class="answer">
                    ${openFeedback}
                </div>
            </div>
        </div>
        `
            : ""
        }

        <div class="footer">
            <p>This feedback was submitted through your shipping feedback form.</p>
            <p>Please review and take appropriate action if needed.</p>
        </div>
    </div>
</body>
</html>
  `;

  const message = {
    from: process.env.EMAIL,
    to: "support@pickupmanng.ng",
    subject: "You have a New Feedback",
    html: emailContent,
  };

  const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    auth: {
      user: "emailapikey",
      pass: process.env.PASSWORD,
    },
  });
  try {
    const info = await transporter.sendMail(message);

    console.log("feedback successfully sent:", info.accepted[0]);
    return res.status(200).json({
      success: true,
      message: "feedback successfully sent",
    });
  } catch (err) {
    console.error("Error sending feedback mail:", err);
    return false;
  }
};

exports.updateUsersDetails = async (req, res) => {
  const {
    first_name,
    last_name,
    street,
    landmark,
    city,
    country,
    state,
    postal_code,
    phone_number,
  } = req.body;
  const id = req.user.id;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "user does not exist",
    });
  }

  try {
    const user = await Users.findAll({ where: { id: id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      const updatedUser = await Users.update(
        {
          first_name,
          last_name,
          street,
          landmark,
          city,
          country,
          state,
          postal_code,
          phone_number,
        },
        { where: { id: id } }
      );

      return res.status(200).json({
        success: true,
        message: "User data successfully updated",
        data: updatedUser,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user data",
      error: error.message,
    });
  }
};

exports.getParcelByTrackingNumber = async (req, res) => {
  const { tracking_number } = req.params;
  try {
    const tracking = await parcelTracking.findAll({
      where: { tracking_number: tracking_number },
      order: [["created_at", "DESC"]],
    });
    if (tracking) {
      const parcel = await Parcels.findOne({
        where: { tracking_number: tracking_number },
      });
      const randomId = Math.floor(Math.random() * 90000) + 10000;

      const created_Shipment = {
        id: randomId,
        tracking_number: tracking_number,
        status: "Shipment Created",
        createdAt: parcel.createdAt,
        updatedAt: parcel.updatedAt,
      };
      tracking.push(created_Shipment);
      let parcelData = null;
      if (parcel) {
        parcelData = {
          deliveryAddress: `${parcel.receiver_street_address}, ${parcel.receiver_city}, ${parcel.receiver_state}, ${parcel.receiver_region}`,
          trackingNumber: parcel.tracking_number,
          status: parcel.status,
          estimatedDelivery: parcel.estimated_delivery_date,
          origin: `${parcel.city}, ${parcel.state}, ${parcel.region}`,
          destination: `${parcel.receiver_city}, ${parcel.receiver_state}, ${parcel.receiver_region}`,
          service: parcel.selected_deliverymode,
          weight: `${parcel.parcel_weight} kg`,
          history: tracking,
        };
      }

      return res.status(200).json({
        status: true,
        tracking: parcelData,
      });
    }
  } catch (error) {
    return res.status(401).json({
      status: false,
      msg: "shipment with this tracking number not found",
    });
  }
};
