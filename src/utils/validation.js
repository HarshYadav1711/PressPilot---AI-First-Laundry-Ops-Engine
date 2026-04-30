const { ORDER_STATUSES } = require("./constants");
const MAX_CUSTOMER_NAME_LENGTH = 100;
const MAX_GARMENT_TYPE_LENGTH = 60;
const MAX_QUANTITY = 1000;
const MAX_PRICE_PER_ITEM = 100000;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidPhone(phoneNumber) {
  return typeof phoneNumber === "string" && /^[0-9]{10,15}$/.test(phoneNumber.trim());
}

function isValidPrice(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isValidStatus(status) {
  return ORDER_STATUSES.includes(status);
}

function validateCreateOrderPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    return { valid: false, errors: ["Request body must be a valid JSON object."] };
  }

  const customerName = typeof payload.customerName === "string" ? payload.customerName.trim() : "";
  const phoneNumber = typeof payload.phoneNumber === "string" ? payload.phoneNumber.trim() : "";

  if (!isNonEmptyString(customerName)) {
    errors.push("customerName is required and must be a non-empty string.");
  } else if (customerName.length > MAX_CUSTOMER_NAME_LENGTH) {
    errors.push(`customerName must be at most ${MAX_CUSTOMER_NAME_LENGTH} characters.`);
  }

  if (!isValidPhone(phoneNumber)) {
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

      const garmentType = typeof item.type === "string" ? item.type.trim() : "";

      if (!isNonEmptyString(garmentType)) {
        errors.push(`garments[${index}].type must be a non-empty string.`);
      } else if (garmentType.length > MAX_GARMENT_TYPE_LENGTH) {
        errors.push(
          `garments[${index}].type must be at most ${MAX_GARMENT_TYPE_LENGTH} characters.`
        );
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > MAX_QUANTITY) {
        errors.push(`garments[${index}].quantity must be between 1 and ${MAX_QUANTITY}.`);
      }

      if (!isValidPrice(item.pricePerItem) || item.pricePerItem > MAX_PRICE_PER_ITEM) {
        errors.push(
          `garments[${index}].pricePerItem must be a finite number between 0 and ${MAX_PRICE_PER_ITEM}.`
        );
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  isValidStatus,
  validateCreateOrderPayload
};
