function generateOrderId() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PP-${datePart}-${randomPart}`;
}

module.exports = {
  generateOrderId
};
