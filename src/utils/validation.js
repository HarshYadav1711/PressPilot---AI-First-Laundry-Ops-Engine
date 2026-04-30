const { ORDER_STATUSES } = require("./constants");

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidPhone(phoneNumber) {
  return typeof phoneNumber === "string" && /^[0-9]{10,15}$/.test(phoneNumber);
}

function isValidStatus(status) {
  return ORDER_STATUSES.includes(status);
}

function validateCreateOrderPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    return { valid: false, errors: ["Request body must be a valid JSON object."] };
  }

  if (!isNonEmptyString(payload.customerName)) {
    errors.push("customerName is required and must be a non-empty string.");
  }

  if (!isValidPhone(payload.phoneNumber)) {
    errors.push("phoneNumber is required and must be 10-15 digits.");
  }

  if (!Array.isArray(payload.garments) || payload.garments.length === 0) {
    errors.push("garments is required and must be a non-empty array.");
  } else {
    payload.garments.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        errors.push(`garments[${index}] must be an object.`);
        return;
      }

      if (!isNonEmptyString(item.type)) {
        errors.push(`garments[${index}].type must be a non-empty string.`);
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        errors.push(`garments[${index}].quantity must be a positive integer.`);
      }

      if (typeof item.pricePerItem !== "number" || item.pricePerItem < 0) {
        errors.push(`garments[${index}].pricePerItem must be a non-negative number.`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  isValidStatus,
  validateCreateOrderPayload
};
