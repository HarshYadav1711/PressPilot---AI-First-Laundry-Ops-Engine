const { all, get, run } = require("../database/connection");
const { generateOrderId } = require("../utils/orderId");
const { ORDER_STATUSES } = require("../utils/constants");

function calculateOrderTotal(garments) {
  return garments.reduce((sum, item) => sum + item.quantity * item.pricePerItem, 0);
}

async function insertOrderWithUniqueId({ customerName, phoneNumber, totalBill, createdAt }) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderCode = generateOrderId();
    try {
      const insertOrder = await run(
        `
          INSERT INTO orders (order_id, customer_name, phone_number, status, total_bill, created_at)
          VALUES (?, ?, ?, 'RECEIVED', ?, ?)
        `,
        [orderCode, customerName, phoneNumber, totalBill, createdAt]
      );
      return { orderCode, orderRowId: insertOrder.lastID };
    } catch (error) {
      if (error && error.code === "SQLITE_CONSTRAINT") {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Could not generate a unique order ID.");
}

async function createOrder(payload) {
  const customerName = payload.customerName.trim();
  const phoneNumber = payload.phoneNumber.trim();
  const garments = payload.garments.map((item) => ({
    type: item.type.trim(),
    quantity: item.quantity,
    pricePerItem: item.pricePerItem
  }));

  const totalBill = calculateOrderTotal(garments);
  const createdAt = new Date().toISOString();
  const { orderCode, orderRowId } = await insertOrderWithUniqueId({
    customerName,
    phoneNumber,
    totalBill,
    createdAt
  });

  for (const item of garments) {
    const lineTotal = item.quantity * item.pricePerItem;
    await run(
      `
        INSERT INTO order_items (order_id, garment_type, quantity, price_per_item, line_total)
        VALUES (?, ?, ?, ?, ?)
      `,
      [orderRowId, item.type, item.quantity, item.pricePerItem, lineTotal]
    );
  }

  return getOrderByCode(orderCode);
}

async function getOrderByCode(orderCode) {
  const order = await get(
    `
      SELECT id, order_id, customer_name, phone_number, status, total_bill, created_at
      FROM orders
      WHERE order_id = ?
    `,
    [orderCode]
  );

  if (!order) {
    return null;
  }

  const items = await all(
    `
      SELECT garment_type, quantity, price_per_item, line_total
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC
    `,
    [order.id]
  );

  return {
    orderId: order.order_id,
    customerName: order.customer_name,
    phoneNumber: order.phone_number,
    status: order.status,
    totalBill: order.total_bill,
    createdAt: order.created_at,
    garments: items.map((item) => ({
      type: item.garment_type,
      quantity: item.quantity,
      pricePerItem: item.price_per_item,
      lineTotal: item.line_total
    }))
  };
}

async function updateOrderStatus(orderCode, status) {
  const updateResult = await run(
    `
      UPDATE orders
      SET status = ?
      WHERE order_id = ?
    `,
    [status, orderCode]
  );

  if (updateResult.changes === 0) {
    return null;
  }

  return getOrderByCode(orderCode);
}

async function listOrders(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push("o.status = ?");
    params.push(filters.status);
  }

  if (filters.search) {
    conditions.push("(LOWER(o.customer_name) LIKE ? OR o.phone_number LIKE ?)");
    const searchValue = `%${String(filters.search).toLowerCase().trim()}%`;
    params.push(searchValue, `%${String(filters.search).trim()}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const orders = await all(
    `
      SELECT
        o.id,
        o.order_id,
        o.customer_name,
        o.phone_number,
        o.status,
        o.total_bill,
        o.created_at
      FROM orders o
      ${whereClause}
      ORDER BY o.id DESC
    `,
    params
  );

  if (orders.length === 0) {
    return [];
  }

  const orderIds = orders.map((row) => row.id);
  const placeholders = orderIds.map(() => "?").join(", ");
  const items = await all(
    `
      SELECT order_id, garment_type, quantity, price_per_item, line_total
      FROM order_items
      WHERE order_id IN (${placeholders})
      ORDER BY id ASC
    `,
    orderIds
  );

  const itemsByOrderId = {};
  for (const item of items) {
    if (!itemsByOrderId[item.order_id]) {
      itemsByOrderId[item.order_id] = [];
    }
    itemsByOrderId[item.order_id].push({
      type: item.garment_type,
      quantity: item.quantity,
      pricePerItem: item.price_per_item,
      lineTotal: item.line_total
    });
  }

  return orders.map((order) => ({
    orderId: order.order_id,
    customerName: order.customer_name,
    phoneNumber: order.phone_number,
    status: order.status,
    totalBill: order.total_bill,
    createdAt: order.created_at,
    garments: itemsByOrderId[order.id] || []
  }));
}

async function getDashboard() {
  const summary = await get(
    `
      SELECT
        COUNT(*) AS totalOrders,
        COALESCE(SUM(total_bill), 0) AS totalRevenue
      FROM orders
    `
  );

  const statusRows = await all(
    `
      SELECT status, COUNT(*) AS count
      FROM orders
      GROUP BY status
    `
  );

  const ordersPerStatus = ORDER_STATUSES.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  for (const row of statusRows) {
    ordersPerStatus[row.status] = row.count;
  }

  return {
    totalOrders: summary.totalOrders,
    totalRevenue: summary.totalRevenue,
    ordersPerStatus
  };
}

module.exports = {
  createOrder,
  updateOrderStatus,
  listOrders,
  getDashboard
};
