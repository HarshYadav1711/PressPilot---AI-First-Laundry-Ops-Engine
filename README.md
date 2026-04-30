# PressPilot

PressPilot is a backend-first mini laundry order management system for the Quick Dry Cleaning internship assessment.  
It models a practical dry-cleaning workflow: create orders, track status, search/filter orders, and view operational summary metrics.

## Tech Stack

- Node.js + Express
- SQLite (`sqlite3`)
- Minimal static frontend (`public/index.html`)
- No paid APIs or external services

## What The Project Does

- Accepts customer laundry orders with multiple garment line items.
- Calculates total bill from quantity and per-item price.
- Assigns a human-readable unique order ID (`PP-YYYYMMDD-XXXX`).
- Persists orders and items in SQLite.
- Supports order lifecycle updates using exactly:
  - `RECEIVED`
  - `PROCESSING`
  - `READY`
  - `DELIVERED`
- Provides listing/search filters and a lightweight dashboard endpoint.

## Project Structure

```text
presspilot/
  data/
    .gitkeep
  src/
    controllers/
      orderController.js
    database/
      connection.js
      init.js
      schema.sql
    routes/
      orderRoutes.js
    services/
      orderService.js
    utils/
      constants.js
      orderId.js
      validation.js
    server.js
  PressPilot.postman_collection.json
  public/
    index.html
  package.json
  README.md
```

## Install and Run

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
```

### Run

```bash
npm start
```

Dev mode:

```bash
npm run dev
```

Server URL: `http://localhost:3000`

Frontend demo URL: `http://localhost:3000/`

## Core Features Implemented

- **Create Order**
  - Inputs: `customerName`, `phoneNumber`, `garments[]`
  - Garment fields: `type`, `quantity`, `pricePerItem`
  - Auto-calculates `lineTotal` and `totalBill`
  - Stores order + order items in SQLite

- **Order Status Management**
  - Update status endpoint
  - Strict status validation for `RECEIVED | PROCESSING | READY | DELIVERED`

- **Order Listing + Filtering**
  - List all orders
  - Filter by `status`
  - Filter by `customerName` (case-insensitive)
  - Filter by `phoneNumber`
  - Filter by `garmentType` (case-insensitive)
  - Combined `search` (customer name or phone)

- **Dashboard**
  - Total orders
  - Total revenue
  - Count per status

- **Useful Bonus (kept restrained)**
  - Deterministic `estimatedDeliveryDate` based on `createdAt` + status offset
  - Tiny no-build frontend to demo create/update/list/dashboard quickly

## API Endpoints

- `GET /health`
- `POST /api/orders`
- `PATCH /api/orders/:orderId/status`
- `GET /api/orders`
- `GET /api/dashboard`

### Query Params for `GET /api/orders`

- `status`
- `customerName`
- `phoneNumber`
- `garmentType`
- `search`

## Sample Requests and Responses

### 1) Create Order

`POST /api/orders`

Request:

```json
{
  "customerName": "Aman Verma",
  "phoneNumber": "9876543210",
  "garments": [
    { "type": "Shirt", "quantity": 2, "pricePerItem": 60 },
    { "type": "Saree", "quantity": 1, "pricePerItem": 180 }
  ]
}
```

Response (201):

```json
{
  "order": {
    "orderId": "PP-20260501-AB12",
    "customerName": "Aman Verma",
    "phoneNumber": "9876543210",
    "status": "RECEIVED",
    "totalBill": 300,
    "createdAt": "2026-05-01T00:00:00.000Z",
    "estimatedDeliveryDate": "2026-05-04T00:00:00.000Z",
    "garments": [
      { "type": "Shirt", "quantity": 2, "pricePerItem": 60, "lineTotal": 120 },
      { "type": "Saree", "quantity": 1, "pricePerItem": 180, "lineTotal": 180 }
    ]
  }
}
```

Validation error example (400):

```json
{
  "message": "Validation failed.",
  "errors": [
    "customerName is required and must be a non-empty string.",
    "phoneNumber is required and must be 10-15 digits."
  ]
}
```

### 2) Update Status

`PATCH /api/orders/:orderId/status`

Request:

```json
{
  "status": "PROCESSING"
}
```

Success response (200):

```json
{
  "order": {
    "orderId": "PP-20260501-AB12",
    "status": "PROCESSING"
  }
}
```

Invalid status response (400):

```json
{
  "message": "Invalid status. Allowed values are RECEIVED, PROCESSING, READY, DELIVERED."
}
```

### 3) List / Filter Orders

- `GET /api/orders`
- `GET /api/orders?status=READY`
- `GET /api/orders?customerName=aman`
- `GET /api/orders?phoneNumber=3210`
- `GET /api/orders?garmentType=shirt`
- `GET /api/orders?search=aman`

Response shape:

```json
{
  "count": 1,
  "orders": [
    {
      "orderId": "PP-20260501-AB12",
      "customerName": "Aman Verma",
      "phoneNumber": "9876543210",
      "status": "READY",
      "totalBill": 300,
      "createdAt": "2026-05-01T00:00:00.000Z",
      "estimatedDeliveryDate": "2026-05-01T00:00:00.000Z",
      "garments": [
        { "type": "Shirt", "quantity": 2, "pricePerItem": 60, "lineTotal": 120 }
      ]
    }
  ]
}
```

### 4) Dashboard

`GET /api/dashboard`

Response:

```json
{
  "totalOrders": 12,
  "totalRevenue": 3890,
  "ordersPerStatus": {
    "RECEIVED": 4,
    "PROCESSING": 3,
    "READY": 3,
    "DELIVERED": 2
  }
}
```

## Demo Artifact

- Postman collection: `PressPilot.postman_collection.json`
- Contains ready-to-run requests for:
  - health
  - create order
  - update status
  - list orders with common filters
  - dashboard
- Minimal browser demo: `public/index.html` served from `/`

## Suggested Demo Flow (2-3 minutes)

1. Run `POST /api/orders` twice with different garments/customers.
2. Update one order to `PROCESSING`, then `READY`.
3. Run filtered listing with `status`, `customerName`, and `garmentType`.
4. Open `GET /api/dashboard` to show aggregated metrics.

## AI Usage Report

### Tools Used

- Cursor AI agent (coding + refactors + documentation drafting)

### Representative Prompts Used

- "Create a lightweight Express + SQLite backend for laundry order management."
- "Implement create order with validation, line totals, and SQLite persistence."
- "Add strict status update flow and practical order filters."
- "Prepare submission-ready README with sample API requests/responses and tradeoffs."

### Where AI Helped

- Initial project scaffolding and file organization
- Route/controller/service wiring
- Validation and SQL query drafting
- First-pass documentation

### What AI Got Wrong

- Early docs and payload examples reflected an older in-memory shape and field names.
- Needed manual correction to align everything with final SQLite implementation and `type` garment field.

### Manual Corrections Made

- Tightened endpoint contracts and validation messaging
- Standardized response shape and status enforcement
- Added deterministic delivery-date logic and practical filter behavior
- Rewrote README to match actual current behavior

## Tradeoffs and Intentional Omissions

- No auth/roles: out of scope for assignment speed and clarity.
- Frontend is intentionally minimal and static; no framework/build tooling added.
- No background jobs/notifications: not required for this use case.
- No pagination: dataset is small for assessment demo.
- SQLite chosen for simplicity and local reproducibility.

## If Given More Time

- Add automated tests (unit + API integration)
- Add pagination/sorting for large order lists
- Add status transition guardrails (e.g., no `DELIVERED` directly from `RECEIVED`)
- Add lightweight request logging and audit trail
- Add containerized run path (`Dockerfile`) for consistent review setup
