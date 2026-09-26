# 📦 StockSense — Enterprise Inventory Management System

> **Vertical Slice 1 Ownership**: Authentication, Dynamic Dashboard & KPIs, Warehouse/Location Settings, User Profile, and Glassmorphic UI/UX Cohesion.

StockSense is an enterprise-grade Inventory Management System built using a **Vertical Slice Architecture**. Each team member owns a complete feature end-to-end (Database schema, REST API, and Frontend UI) for clear individual commit evaluation.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + Outfit/Inter Typography
- **Backend**: Node.js + Express REST API
- **Database Engine**: Relational Schema (SQLite / PostgreSQL / MySQL) + In-Memory Seed Engine
- **Auth**: JWT Bearer Authentication + Bcrypt Password Hashing + OTP Code Generator

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- NPM (v9+)

### 2. Backend Server Setup
```bash
cd server
npm install
npm start
# Express Server running on http://localhost:5000/api
```

### 3. Frontend Client Setup
```bash
cd client
npm install
npm run dev
# Vite React Client running on http://localhost:3000
```

---

## 📐 Shared ER Diagram (12 Core Entities)

```
+----------------+      +-------------------+      +------------------+
|      User      |      |     Warehouse     |----->|     Location     |
+----------------+      +-------------------+      +------------------+
                                  |
                                  v
+----------------+      +-------------------+      +------------------+
|    Category    |----->|      Product      |----->|  StockQuantity   |
+----------------+      +-------------------+      +------------------+
                                  |
            +---------------------+---------------------+
            |                     |                     |
            v                     v                     v
   +-----------------+   +-----------------+   +------------------+
   |     Receipt     |   |  DeliveryOrder  |   | InternalTransfer |
   +-----------------+   +-----------------+   +------------------+
                                                        |
                                                        v
                                               +------------------+
                                               |   StockLedger    |
                                               +------------------+
```

1. `User`: `id`, `name`, `email`, `password_hash`, `role`, `warehouse_id`
2. `Warehouse`: `id`, `code`, `name`, `address`, `manager_name`, `status`, `capacity`
3. `Location`: `id`, `warehouse_id`, `code`, `name`, `type`, `capacity`
4. `Category`: `id`, `name`, `code`, `description`
5. `UnitOfMeasure`: `id`, `name`, `abbreviation`
6. `Product`: `id`, `sku`, `name`, `category_id`, `uom_id`, `min_stock_threshold`, `reorder_qty`
7. `StockQuantity`: `id`, `product_id`, `warehouse_id`, `location_id`, `qty_on_hand`, `qty_reserved`
8. `Receipt`: `id`, `receipt_number`, `supplier_name`, `warehouse_id`, `status`, `expected_date`
9. `DeliveryOrder`: `id`, `do_number`, `customer_name`, `warehouse_id`, `status`, `scheduled_date`
10. `InternalTransfer`: `id`, `transfer_number`, `src_warehouse_id`, `dest_warehouse_id`, `product_id`, `qty`
11. `StockAdjustment`: `id`, `adj_number`, `warehouse_id`, `location_id`, `product_id`, `old_qty`, `new_qty`
12. `StockLedger`: `id`, `timestamp`, `doc_type`, `doc_number`, `product_id`, `qty_change`, `balance_after`

---

## ⚡ API Endpoint Specification

### Authentication & Profile (Slice 1)
- `POST /api/auth/signup` — Register a new team member or user
- `POST /api/auth/login` — Authenticate and return JWT token
- `POST /api/auth/otp/request` — Generate 6-digit OTP code for password reset
- `POST /api/auth/otp/verify` — Verify OTP code and reset password
- `GET /api/profile` — Fetch user profile & assigned warehouse
- `PUT /api/profile` — Update user profile settings

### Dashboard & Analytics (Slice 1)
- `GET /api/dashboard/kpis` — Aggregate KPIs dynamically filtered by `doc_type`, `status`, `warehouse_id`, `category_id`

### Settings & Facilities (Slice 1)
- `GET /api/warehouses` — List all facilities with location breakdown
- `POST /api/warehouses` — Create a new warehouse facility
- `POST /api/warehouses/:id/locations` — Add storage sub-location (Rack/Bin/Pallet)

---

## 👥 Vertical Slice Ownership Matrix

- **Slice 1 (OWNER: Alex Rivera)**: Auth, Dashboard, Settings, Profile & UI/UX Cohesion
- **Slice 2**: Products Catalog & Inbound Purchase Receipts
- **Slice 3**: Outbound Sales Delivery Orders & Stock Depletion
- **Slice 4**: Internal Warehouse Transfers, Stock Adjustments & Stock Ledger Audit Trail

---

## 📄 License
MIT License — StockSense Project Team.
