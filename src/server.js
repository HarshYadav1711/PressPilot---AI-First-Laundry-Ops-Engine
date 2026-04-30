const express = require("express");
const cors = require("cors");
const orderRoutes = require("./routes/orderRoutes");
const { initializeDatabase } = require("./database/init");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", orderRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`PressPilot API running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start PressPilot:", error);
  process.exit(1);
});
