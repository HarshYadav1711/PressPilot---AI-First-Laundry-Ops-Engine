# PressPilot — AI-First Laundry Operations Engine

A fast, practical, and production-minded system to manage laundry orders end-to-end — built with an **AI-first workflow** and a focus on real business usability over over-engineering.

---

## Why this project exists

Laundry businesses don’t need complex systems — they need **speed, clarity, and reliability**.

PressPilot is designed to reflect how a real dry cleaning store operates:

* Orders come in quickly
* Status must be tracked clearly
* Billing must be accurate
* Insights should be instantly available

This project intentionally avoids unnecessary complexity and focuses on **shipping a working, usable system fast** — the same mindset required in a real product environment.

---

## What this system does

### Core Features

#### 1. Create Orders

* Capture customer details (name, phone)
* Add multiple garments with quantity and pricing
* Automatically calculate total bill
* Generate a clean, unique Order ID

#### 2. Order Status Workflow

Each order moves through a real-world lifecycle:

```
RECEIVED → PROCESSING → READY → DELIVERED
```

* Status can be updated at any time
* Designed to reflect actual store operations

#### 3. View & Filter Orders

* Retrieve all orders
* Filter by:

  * Status
  * Customer name
  * Phone number
* Fast lookup for day-to-day usage

#### 4. Dashboard Insights

* Total number of orders
* Total revenue generated
* Breakdown of orders by status

#### 5. Bonus Implementations

* Estimated delivery date
* Search by garment type

---

## Tech Stack

* **Backend:** Node.js + Express
* **Database:** SQLite (lightweight, persistent, fast setup)
* **API Testing:** Postman
* **AI Tools Used:** ChatGPT, GitHub Copilot

This stack was chosen to maximize **speed of development and clarity**, not complexity.

---

## Project Structure

```
presspilot/
│
├── src/
│   ├── controllers/      # Handles request/response
│   ├── services/         # Core business logic
│   ├── routes/           # API routes
│   ├── db/               # Database connection
│   ├── utils/            # Helpers (ID generation, etc.)
│   └── app.js            # Entry point
│
├── data/                 # SQLite database
├── postman/              # API collection
├── README.md
└── package.json
```

The structure is intentionally simple and readable — avoiding unnecessary abstraction.

---

## Setup Instructions

### 1. Clone the repository

```
git clone https://github.com/HarshYadav1711/presspilot.git
cd presspilot
```

### 2. Install dependencies

```
npm install
```

### 3. Run the server

```
npm start
```

Server will start at:

```
http://localhost:3000
```

---

## API Overview

### Create Order

```
POST /orders
```

**Request**

```json
{
  "customerName": "Ravi Kumar",
  "phone": "9876543210",
  "items": [
    { "type": "Shirt", "quantity": 2, "price": 10 }
  ]
}
```

**Response**

```json
{
  "id": "ORD-20260430-001",
  "totalAmount": 20,
  "status": "RECEIVED"
}
```

---

### Get Orders (with filters)

```
GET /orders?status=PROCESSING&search=Ravi
```

---

### Update Order Status

```
PATCH /orders/:id/status
```

---

### Dashboard

```
GET /dashboard
```

**Response**

```json
{
  "totalOrders": 10,
  "totalRevenue": 1850,
  "statusBreakdown": {
    "RECEIVED": 2,
    "PROCESSING": 3,
    "READY": 2,
    "DELIVERED": 3
  }
}
```

---

## AI Usage Report (Critical)

This project was built using an **AI-first development approach**, with deliberate human intervention at key stages.

### Tools Used

* ChatGPT (for system design, logic generation, debugging)
* GitHub Copilot (for inline code assistance)

---

### Where AI Helped

* Initial Express API scaffolding
* Generating CRUD endpoints
* Writing SQL queries for aggregation
* Drafting initial validation logic
* Structuring README

---

### Sample Prompts Used

**1. API scaffolding**

> “Create a minimal Node.js Express backend for a laundry order system with create, update, list, and dashboard endpoints using SQLite.”

**2. Billing logic**

> “Write a function to calculate total price from items with quantity and price.”

**3. Dashboard aggregation**

> “Generate logic to compute total orders, total revenue, and count by status.”

---

### What AI Got Wrong

* Over-engineered service layers
* Unnecessary abstraction (extra files, unused helpers)
* Inconsistent naming conventions
* Missing edge-case validation
* Inefficient filtering logic

---

### What I Improved

* Simplified architecture to reduce cognitive overhead
* Rewrote parts of business logic for clarity
* Added validation for inputs (empty items, invalid numbers)
* Optimized filtering logic for real usage
* Standardized naming across the project

---

## Tradeoffs

### What I intentionally did NOT do

* No authentication (not required for core workflow)
* No complex UI (backend-first focus)
* No microservices or advanced architecture
* No heavy ORM (kept raw and readable)

---

### Why

The goal was to:

> **Ship a working, clean system quickly — not over-engineer it**

---

## What I would improve with more time

* Customer notifications (SMS/WhatsApp)
* Payment integration
* Multi-store support
* Role-based access
* Better analytics (daily/weekly trends)
* Deployment with live demo

---

## Key Design Decisions

* **SQLite over in-memory** → persistence without setup overhead
* **Simple structure over layered architecture** → faster understanding
* **Explicit status workflow** → mirrors real operations
* **Readable code over abstraction** → easier maintenance

---

## How to Test

Use the included Postman collection:

```
/postman/presspilot_collection.json
```

Flow:

1. Create order
2. Update status
3. Fetch orders
4. Check dashboard

---

## Final Note

This project was built with a clear philosophy:

> Build what matters. Ship fast. Keep it clean.

Instead of focusing on perfection, the focus was on:

* Practical usability
* Real-world workflow alignment
* Fast iteration using AI
* Thoughtful simplification

---