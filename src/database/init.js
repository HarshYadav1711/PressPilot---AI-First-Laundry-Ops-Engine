const fs = require("fs");
const path = require("path");
const { run } = require("./connection");

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
}

module.exports = {
  initializeDatabase
};
