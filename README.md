# PressPilot

PressPilot is a backend-first mini laundry order management system built for the Quick Dry Cleaning Software Development Engineering (Web) internship assessment.

It focuses on practical dry-cleaning workflow essentials:
- create orders with garment-level pricing
- track order lifecycle status
- search and filter orders quickly
- view a basic operations dashboard

## Tech Stack

- Node.js (LTS)
- Express.js
- In-memory data store (simple and fast for assessment/demo use)

No paid APIs, billing setup, or proprietary services are required.

## Features Implemented

### 1) Create Order
- Captures:
  - `customerName`
  - `phoneNumber`
  - `garments[]` with:
    - `garmentType`
    - `quantity`
    - `pricePerItem`
- Auto-calculates `totalBill`
- Generates unique `orderId` (format: `PP-...`)
- Assigns default status: `RECEIVED`

### 2) Order Status Management
Allowed statuses (exact):
- `RECEIVED`
- `PROCESSING`
- `READY`
- `DELIVERED`

Supports updating status per order.

### 3) View Orders
- List all orders
- Filter by status
- Filter by customer name or phone number

### 4) Basic Dashboard
- Total orders
- Total revenue
- Orders per status

## Project Structure

```text
presspilot/
  src/
    constants.js      # order statuses
    server.js         # API routes and app bootstrap
    store.js          # in-memory order storage
    utils.js          # helpers (ID, totals, status checks)
    validation.js     # request payload validation
  PressPilot.postman_collection.json
  package.json
  README.md
```

## Setup and Run

### Prerequisites
- Node.js 18+ (or latest LTS)
- npm

### Install
```bash
npm install
```

### Start server
```bash
npm run start
```

Development mode (auto-reload with Node watch):
```bash
npm run dev
```

Server runs on:
- `http://localhost:3000`

## API Endpoints

### Health
- `GET /health`

### Create Order
- `POST /api/orders`

Example request body:
```json
{
  "customerName": "Anita Sharma",
  "phoneNumber": "9876543210",
  "garments": [
    { "garmentType": "Shirt", "quantity": 3, "pricePerItem": 50 },
    { "garmentType": "Pants", "quantity": 2, "pricePerItem": 80 }
  ]
}
```

### Update Order Status
- `PATCH /api/orders/:orderId/status`

Example request body:
```json
{
  "status": "READY"
}
```

### List / Filter Orders
- `GET /api/orders`
- `GET /api/orders?status=PROCESSING`
- `GET /api/orders?search=anita`

### Dashboard
- `GET /api/dashboard`

## Demo Artifact

Postman collection included:
- `PressPilot.postman_collection.json`

Import it into Postman and run requests in this sequence:
1. Create Order
2. List Orders
3. Update Order Status
4. Filter Orders
5. Dashboard Stats

## Validation Rules

- `customerName`: required, non-empty string
- `phoneNumber`: required, 10-15 digits
- `garments`: required, non-empty array
- `garmentType`: required, non-empty string
- `quantity`: positive integer
- `pricePerItem`: non-negative number
- `status`: must be one of exact allowed values

## AI Usage Report

This project was built with AI assistance as required by the assignment.

### AI Tools Used
- Cursor AI agent (for scaffolding, endpoint design, and docs drafting)

### Sample Prompts Used
- "Build a minimal Express backend for laundry order management with create/list/update-status/dashboard endpoints."
- "Add strict status validation for RECEIVED, PROCESSING, READY, DELIVERED."
- "Draft a concise README including setup, features, tradeoffs, and AI usage report."

### Where AI Helped
- Rapid project scaffolding
- Endpoint and payload structure planning
- Validation checklist creation
- README and API artifact drafting

### What AI Got Wrong / Needed Fixes
- Initial drafts were too generic and had to be tightened to match the exact assessment constraints.
- Some phrasing was adjusted manually for clarity and realism in a dry-cleaning workflow.

### Manual Improvements
- Simplified architecture to avoid over-engineering
- Tightened validation messages and endpoint behavior
- Ensured status enum and assignment requirements match exactly
- Curated final structure to stay interview-friendly and readable in one sitting

## Tradeoffs and Notes

- In-memory storage was chosen for speed and simplicity of assessment delivery.
- Data resets on server restart (acceptable for this scope).
- No authentication/UI added to keep focus on core backend workflow requirements.

For production evolution, next logical steps would be:
- persistent DB (PostgreSQL)
- authentication/authorization
- audit logs and pagination
- automated tests and CI
