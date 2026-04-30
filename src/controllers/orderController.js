const orderService = require("../services/orderService");
const { isValidStatus, validateCreateOrderPayload } = require("../utils/validation");

async function createOrder(req, res, next) {
  try {
    const validation = validateCreateOrderPayload(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: "Validation failed.", errors: validation.errors });
    }

    const createdOrder = await orderService.createOrder(req.body);
    return res.status(201).json(createdOrder);
  } catch (error) {
    return next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { orderId } = req.params;
    const { status } = req.body || {};

    if (!isValidStatus(status)) {
      return res.status(400).json({
        message: "Invalid status. Allowed values are RECEIVED, PROCESSING, READY, DELIVERED."
      });
    }

    const updatedOrder = await orderService.updateOrderStatus(orderId, status);
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.json(updatedOrder);
  } catch (error) {
    return next(error);
  }
}

async function listOrders(req, res, next) {
  try {
    const { status, search } = req.query;

    if (status && !isValidStatus(status)) {
      return res.status(400).json({
        message: "Invalid status filter. Allowed values are RECEIVED, PROCESSING, READY, DELIVERED."
      });
    }

    const orders = await orderService.listOrders({ status, search });
    return res.json({ count: orders.length, orders });
  } catch (error) {
    return next(error);
  }
}

async function getDashboard(req, res, next) {
  try {
    const data = await orderService.getDashboard();
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  updateOrderStatus,
  listOrders,
  getDashboard
};
