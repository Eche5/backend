const sendFeedbackFormTemplate = (
  customerEmail,
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
  openFeedback
) => {
  const subject = "📦 New Shipping Feedback Received ";
  const submittedAt = new Date().toLocaleString("en-US", {});
  const html = `
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

  return { subject, html };
};
module.exports = { sendFeedbackFormTemplate };
