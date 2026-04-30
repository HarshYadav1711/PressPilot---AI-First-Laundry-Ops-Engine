const { spawn } = require("child_process");

const BASE_URL = "http://localhost:3000";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) return;
    } catch (_error) {
      // Ignore until server is ready.
    }
    await sleep(300);
  }
  throw new Error("Server did not become ready in time.");
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

async function runFlow() {
  const createPayload = {
    customerName: "Sanity Check User",
    phoneNumber: "9876509999",
    garments: [{ type: "Shirt", quantity: 2, pricePerItem: 50 }]
  };

  const created = await requestJson("/api/orders", {
    method: "POST",
    body: JSON.stringify(createPayload)
  });
  const orderId = created.order.orderId;

  const updated = await requestJson(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "PROCESSING" })
  });

  const dashboard = await requestJson("/api/dashboard");

  console.log("Create Order:", { orderId, status: created.order.status, totalBill: created.order.totalBill });
  console.log("Update Status:", { orderId: updated.order.orderId, status: updated.order.status });
  console.log("Dashboard:", dashboard);
}

async function main() {
  const serverProcess = spawn("node", ["src/server.js"], {
    stdio: "ignore",
    shell: false
  });

  try {
    await waitForServer();
    await runFlow();
    console.log("Sanity flow completed successfully.");
  } finally {
    serverProcess.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error("Sanity flow failed:", error.message);
  process.exit(1);
});
