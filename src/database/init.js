const fs = require("fs");
const path = require("path");
const { all, run } = require("./connection");

async function initializeDatabase() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSQL = fs.readFileSync(schemaPath, "utf8");
  const statements = schemaSQL
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await run(statement);
  }

  const orderColumns = await all("PRAGMA table_info(orders)");
  const hasEstimatedDeliveryDate = orderColumns.some(
    (column) => column.name === "estimated_delivery_date"
  );

  if (!hasEstimatedDeliveryDate) {
    await run("ALTER TABLE orders ADD COLUMN estimated_delivery_date TEXT");
    await run("UPDATE orders SET estimated_delivery_date = created_at WHERE estimated_delivery_date IS NULL");
  }
}

module.exports = {
  initializeDatabase
};
