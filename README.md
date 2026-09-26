# StockSense — Inventory Management System (IMS)

A centralized, real-time inventory management web application built with the **MERN Stack** (MongoDB, Express, React, Node.js) for warehouse operators and inventory managers.

---

## Architecture Overview

```text
StockSense/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── api.js          # API service connecting to Express / Fallback
│   │   ├── App.jsx         # Landing page, Auth, Dashboard & 5 Core Modules
│   │   ├── index.css       # Clean industrial operational design system
│   │   └── main.jsx
│   └── package.json
├── server/                 # Express & Node.js Backend API
│   ├── models/             # Mongoose schemas (Product, Receipt, Delivery, Transfer, Adjustment, User)
│   ├── routes/             # RESTful API endpoints for each module
│   ├── data/               # Realistic seed dataset for initial inventory
│   ├── store.js            # Dual data store (MongoDB sync + in-memory fallback)
│   ├── server.js           # Server entry point
│   ├── .env.example
│   └── package.json
└── package.json            # Monorepo runner (concurrent dev scripts)
```

---

## Core Operational Modules

1. **Dashboard & Live KPIs**: Total catalog items, low/out-of-stock alerts, pending receipts, active delivery queues, and recent activity logs.
2. **Products**: Catalog of items, quantities, minimum thresholds, categories, unit prices, and shelf locations.
3. **Receipts (Incoming Stock)**: Log inbound supplier freight at dock bays, inspect shipments, and update inventory counts upon completion.
4. **Delivery Orders (Outgoing Stock)**: Picking, packing, and dispatching customer shipments with immediate stock balance deduction.
5. **Internal Transfers**: Shift inventory between aisles, shelves, and storage zones with instant origin and destination updates.
6. **Stock Adjustments**: Reconcile counts following physical audits, damaged goods, or returns.

---

## Quick Start (Running Locally)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Run Both Server & Client Concurrently
```bash
npm run dev
```

- **Frontend (React)**: http://localhost:5173
- **Backend (API)**: http://localhost:5000/api

*Note: If MongoDB is not running locally, the server automatically starts in resilient In-Memory Store mode with pre-seeded inventory data so you can test immediately without setup blockers.*

---

## MongoDB Configuration

To connect your local MongoDB or MongoDB Atlas instance:
1. Open `server/.env`
2. Update `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/stocksense
   ```
3. Restart the server. Data will automatically synchronize with your database.
