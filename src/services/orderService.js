const { all, get, run } = require("../database/connection");
const { generateOrderId } = require("../utils/orderId");
const { ORDER_STATUSES } = require("../utils/constants");

function calculateOrderTotal(garments) {
  return garments.reduce((sum, item) => sum + item.quantity * item.pricePerItem, 0);
}

function getEstimatedDeliveryDate(createdAt) {
  const daysToAdd = 3;
  const estimatedDate = new Date(createdAt);
  estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
  return estimatedDate.toISOString();
}

function toOrderResponse(order, items) {
  return {
    orderId: order.order_id,
    customerName: order.customer_name,
    phoneNumber: order.phone_number,
    status: order.status,
    totalBill: order.total_bill,
    createdAt: order.created_at,
    estimatedDeliveryDate:
      order.estimated_delivery_date || getEstimatedDeliveryDate(order.created_at),
    garments: items.map((item) => ({
      type: item.garment_type,
      quantity: item.quantity,
      pricePerItem: item.price_per_item,
      lineTotal: item.line_total
    }))
  };
}

async function insertOrderWithUniqueId({
  customerName,
  phoneNumber,
  totalBill,
  createdAt,
  estimatedDeliveryDate
}) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderCode = generateOrderId();
    try {
      const insertOrder = await run(
        `
          INSERT INTO orders (
            order_id, customer_name, phone_number, status, total_bill, created_at, estimated_delivery_date
          )
          VALUES (?, ?, ?, 'RECEIVED', ?, ?, ?)
        `,
        [orderCode, customerName, phoneNumber, totalBill, createdAt, estimatedDeliveryDate]
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
  const estimatedDeliveryDate = getEstimatedDeliveryDate(createdAt);
  await run("BEGIN TRANSACTION");

  try {
    const { orderCode, orderRowId } = await insertOrderWithUniqueId({
      customerName,
      phoneNumber,
      totalBill,
      createdAt,
      estimatedDeliveryDate
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

    await run("COMMIT");
    return getOrderByCode(orderCode);
  } catch (error) {
    try {
      await run("ROLLBACK");
    } catch (_rollbackError) {
      // Preserve the original error from order creation.
    }
    throw error;
  }
}

async function getOrderByCode(orderCode) {
  const order = await get(
    `
      SELECT
        id, order_id, customer_name, phone_number, status, total_bill, created_at, estimated_delivery_date
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

  return toOrderResponse(order, items);
}

async function updateOrderStatus(orderCode, status) {
  const currentOrder = await get(
    `
      SELECT status
      FROM orders
      WHERE order_id = ?
    `,
    [orderCode]
  );

  if (!currentOrder) {
    return null;
  }

  if (currentOrder.status !== status) {
    const statusOrder = {
      RECEIVED: 0,
      PROCESSING: 1,
      READY: 2,
      DELIVERED: 3
    };

    if (statusOrder[status] < statusOrder[currentOrder.status]) {
      const error = new Error(
        `Invalid status transition: ${currentOrder.status} -> ${status}. Allowed flow is RECEIVED -> PROCESSING -> READY -> DELIVERED.`
      );
      error.code = "INVALID_STATUS_TRANSITION";
      throw error;
    }
  }

  const updateResult = await run(
    `
      UPDATE orders
      SET status = ?
      WHERE order_id = ?
    `,
    [status, orderCode]
  );

  if (updateResult.changes === 0) return null;
  return getOrderByCode(orderCode);
}

async function listOrders(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.status) {
    conditions.push("o.status = ?");
    params.push(filters.status);
  }

  if (filters.customerName) {
    conditions.push("LOWER(o.customer_name) LIKE ?");
    params.push(`%${String(filters.customerName).toLowerCase().trim()}%`);
  }

  if (filters.phoneNumber) {
    conditions.push("o.phone_number LIKE ?");
    params.push(`%${String(filters.phoneNumber).trim()}%`);
  }

  if (filters.search) {
    conditions.push("(LOWER(o.customer_name) LIKE ? OR o.phone_number LIKE ?)");
    const searchValue = `%${String(filters.search).toLowerCase().trim()}%`;
    params.push(searchValue, `%${String(filters.search).trim()}%`);
  }

  if (filters.garmentType) {
    conditions.push(
      `EXISTS (
        SELECT 1
        FROM order_items oi_filter
        WHERE oi_filter.order_id = o.id
          AND LOWER(oi_filter.garment_type) LIKE ?
      )`
    );
    params.push(`%${String(filters.garmentType).toLowerCase().trim()}%`);
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
        o.created_at,
        o.estimated_delivery_date
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
    itemsByOrderId[item.order_id].push(item);
  }

  return orders.map((order) => toOrderResponse(order, itemsByOrderId[order.id] || []));
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
