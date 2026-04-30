const express = require("express");
const {
  createOrder,
  updateOrderStatus,
  listOrders,
  getDashboard
} = require("../controllers/orderController");

const router = express.Router();

router.post("/orders", createOrder);
router.patch("/orders/:orderId/status", updateOrderStatus);
router.get("/orders", listOrders);
router.get("/dashboard", getDashboard);

module.exports = router;
