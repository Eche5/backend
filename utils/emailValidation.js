const fetch = require("node-fetch"); // npm install node-fetch
const dns = require("dns").promises;

// ==============================================
// 1. COMPLETELY FREE OPTIONS (No API Key Needed)
// ==============================================

// Basic format validation (always free)
const isValidEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email?.toLowerCase().trim());
};

// Check if domain has MX record (DNS validation)
const hasMXRecord = async (email) => {
  try {
    const domain = email.split("@")[1];
    const mxRecords = await dns.resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (error) {
    return false;
  }
};

// Advanced format + DNS validation (100% free)
const validateEmailFree = async (email) => {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Email is required" };
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Format validation
  if (!isValidEmailFormat(cleanEmail)) {
    return {
      isValid: false,
      error: "Invalid email format",
      provider: "free-format",
    };
  }

  // 2. Check for common typos
  const suggestion = checkCommonTypos(cleanEmail);

  // 3. Check for disposable/temporary emails
  const isDisposable = checkDisposableEmail(cleanEmail);
  if (isDisposable) {
    return {
      isValid: false,
      error: "Disposable email not allowed",
      provider: "free-disposable-check",
    };
  }

  // 4. DNS/MX record validation
  const hasMX = await hasMXRecord(cleanEmail);

  return {
    isValid: hasMX,
    provider: "free-dns",
    details: {
      format: true,
      hasMXRecord: hasMX,
      suggestion: suggestion,
      isDisposable: false,
    },
  };
};

// Check for common email typos
const checkCommonTypos = (email) => {
  const commonDomains = {
    "gmial.com": "gmail.com",
    "gmai.com": "gmail.com",
    "gmail.co": "gmail.com",
    "yahooo.com": "yahoo.com",
    "yaho.com": "yahoo.com",
    "hotmial.com": "hotmail.com",
    "hotmai.com": "hotmail.com",
    "outlok.com": "outlook.com",
  };

  const [local, domain] = email.split("@");
  const suggestion = commonDomains[domain];

  return suggestion ? `${local}@${suggestion}` : null;
};

// Check against disposable email domains
const checkDisposableEmail = (email) => {
  const disposableDomains = [
    "10minutemail.com",
    "tempmail.org",
    "guerrillamail.com",
    "mailinator.com",
    "yopmail.com",
    "temp-mail.org",
    "throwaway.email",
    "maildrop.cc",
  ];

  const domain = email.split("@")[1];
  return disposableDomains.includes(domain);
};

// ==============================================
// 2. TRULY FREE API SERVICES
// ==============================================

// emailvalidation.io (100 free requests/month, no credit card)
const validateWithEmailValidationIO = async (email) => {
  try {
    const response = await fetch(
      `https://api.emailvalidation.io/v1/info?email=${encodeURIComponent(
        email
      )}`
    );
    const data = await response.json();

    return {
      isValid: data.format_valid && data.mx_found && !data.disposable,
      provider: "emailvalidation.io",
      details: {
        format: data.format_valid,
        mxFound: data.mx_found,
        disposable: data.disposable,
        role: data.role,
        suggestion: data.did_you_mean,
      },
    };
  } catch (error) {
    return {
      isValid: null,
      error: error.message,
      provider: "emailvalidation.io",
    };
  }
};

// Rapid Email Verifier (100% free, open source)
const validateWithRapidVerifier = async (email) => {
  try {
    const response = await fetch(
      "https://rapid-email-verifier.fly.dev/verify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );
    const data = await response.json();

    return {
      isValid: data.deliverable,
      provider: "rapid-verifier",
      details: {
        deliverable: data.deliverable,
        reason: data.reason,
        risk: data.risk,
      },
    };
  } catch (error) {
    return { isValid: null, error: error.message, provider: "rapid-verifier" };
  }
};

// ==============================================
// 3. MAIN VALIDATION FUNCTION WITH FALLBACKS
// ==============================================

const validateEmail = async (email, method = "free") => {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Email is required" };
  }

  try {
    switch (method) {
      case "free":
        return await validateEmailFree(email);

      case "emailvalidation.io":
        return await validateWithEmailValidationIO(email);

      case "rapid-verifier":
        return await validateWithRapidVerifier(email);

      case "multi":
        // Try multiple methods for better accuracy
        return await validateWithMultipleMethods(email);

      default:
        return await validateEmailFree(email);
    }
  } catch (error) {
    // Fallback to basic validation
    return {
      isValid: isValidEmailFormat(email) ? null : false,
      error: error.message,
      provider: "fallback",
    };
  }
};

// Use multiple validation methods for better accuracy
const validateWithMultipleMethods = async (email) => {
  const results = [];

  // Try free validation first
  const freeResult = await validateEmailFree(email);
  results.push(freeResult);

  // Try API services
  try {
    const apiResult = await validateWithEmailValidationIO(email);
    if (apiResult.isValid !== null) {
      results.push(apiResult);
    }
  } catch (error) {
    console.log("API validation failed, using free method");
  }

  // Combine results
  const validCount = results.filter((r) => r.isValid === true).length;
  const invalidCount = results.filter((r) => r.isValid === false).length;

  return {
    isValid: validCount > invalidCount ? true : invalidCount > 0 ? false : null,
    confidence: validCount / results.length,
    provider: "multi-method",
    details: {
      methods: results.length,
      validCount,
      invalidCount,
      results: results,
    },
  };
};

// ==============================================
// 4. LOGISTICS-SPECIFIC FUNCTIONS
// ==============================================

// Validate recipient email for logistics
const validateRecipientEmail = async (email) => {
  const result = await validateEmail(email, "free");

  // For logistics, be more permissive (don't block on uncertain results)
  if (result.isValid === false) {
    return {
      valid: false,
      message:
        "This email address appears to be invalid. Please check for typos.",
      suggestion: result.details?.suggestion,
      canProceed: false,
    };
  } else if (result.isValid === null) {
    return {
      valid: true,
      message: "Email format is valid (could not verify delivery)",
      canProceed: true,
      warning: "We recommend double-checking this email address",
    };
  } else {
    return {
      valid: true,
      message: "Email address is valid",
      canProceed: true,
    };
  }
};

// Express.js middleware for logistics
const emailValidationMiddleware = (req, res, next) => {
  const email = req.body.recipientEmail || req.body.email;

  if (!email) {
    return next();
  }

  validateRecipientEmail(email)
    .then((result) => {
      req.emailValidation = result;

      // Only block obviously invalid emails
      if (!result.canProceed) {
        return res.status(400).json({
          success: false,
          error: result.message,
          suggestion: result.suggestion,
        });
      }

      next();
    })
    .catch((error) => {
      // Don't block on validation errors
      console.error("Email validation error:", error);
      req.emailValidation = {
        valid: true,
        canProceed: true,
        error: error.message,
      };
      next();
    });
};

// Process shipment with email validation
const processShipment = async (shipmentData) => {
  const emailValidation = await validateRecipientEmail(
    shipmentData.recipientEmail
  );

  return {
    ...shipmentData,
    emailValidation,
    id: Date.now(),
    status: "processed",
    createdAt: new Date(),
  };
};

// ==============================================
// 5. BATCH VALIDATION
// ==============================================

const validateEmailBatch = async (emails, method = "free") => {
  const results = [];

  for (const email of emails) {
    const result = await validateEmail(email, method);
    results.push({ email, ...result });

    // Small delay to be nice to free APIs
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
};

// ==============================================
// EXPORTS
// ==============================================

module.exports = {
  // Main functions
  validateEmail,
  validateRecipientEmail,
  validateEmailBatch,

  // Free methods
  validateEmailFree,
  isValidEmailFormat,
  hasMXRecord,
  checkCommonTypos,
  checkDisposableEmail,

  // API methods
  validateWithEmailValidationIO,
  validateWithRapidVerifier,

  // Logistics functions
  emailValidationMiddleware,
  processShipment,
};

// ==============================================
// USAGE EXAMPLES
// ==============================================

/*
// Example 1: Completely free validation
const result = await validateEmail('user@example.com', 'free');
console.log(result);

// Example 2: Logistics validation
const validation = await validateRecipientEmail('recipient@example.com');
if (validation.canProceed) {
    // Process shipment
} else {
    // Show error to user
    console.log(validation.message);
}

// Example 3: Express route
app.post('/shipments', emailValidationMiddleware, (req, res) => {
    const { emailValidation } = req;
    if (emailValidation.warning) {
        console.log('Warning:', emailValidation.warning);
    }
    // Process shipment...
});

// Example 4: Batch validation
const emails = ['test1@gmail.com', 'test2@invalid.com'];
const results = await validateEmailBatch(emails, 'free');
console.log(results);
*/
