# StockSense — Team Work Division & Execution Plan

## 1. Project Overview & Collaborative Foundation

- **Problem Domain**: Enterprise Inventory Management System (StockSense)
- **Team Size**: 4 Engineers
- **Architecture Strategy**: Vertical Slices (Full-stack feature ownership per developer: Database Tables + REST API Endpoints + User Interface)
- **Tech Stack**:
  - **Backend**: Node.js + Express.js REST API
  - **Database**: Local Relational DB (MySQL / PostgreSQL / SQLite Engine)
  - **Frontend**: React (Vite) + Lucide Icons + Glassmorphism Custom CSS Design System
  - **Auth**: JWT Bearer Tokens + Bcrypt Hashing + OTP Code Generator

---

## 2. Shared ER Diagram & 12 Core Entities

All 4 team members agreed upon and whiteboarded the following 12 database tables before starting vertical slice development:

| # | Entity Name | Primary Key | Foreign Keys / References | Description & Usage |
|---|-------------|-------------|---------------------------|---------------------|
| 1 | `User` | `id` | `warehouse_id` | User accounts, roles, hashed passwords |
| 2 | `Category` | `id` | None | Product category classifications |
| 3 | `UnitOfMeasure` | `id` | None | Measurement units (`pcs`, `kg`, `m`, `box`) |
| 4 | `Warehouse` | `id` | None | Physical storage hubs and facility metadata |
| 5 | `Location` | `id` | `warehouse_id` | Specific racks, bins, pallets within warehouses |
| 6 | `Product` | `id` | `category_id`, `uom_id` | Master product SKU catalog & thresholds |
| 7 | `StockQuantity` | `id` | `product_id`, `warehouse_id`, `location_id` | Real-time stock on hand and reserved units |
| 8 | `Receipt` | `id` | `warehouse_id` | Inbound purchase order receipts from suppliers |
| 9 | `DeliveryOrder` | `id` | `warehouse_id` | Outbound sales delivery orders to customers |
| 10 | `InternalTransfer` | `id` | `src_warehouse_id`, `dest_warehouse_id`, `product_id` | Inter-warehouse stock transfers |
| 11 | `StockAdjustment` | `id` | `warehouse_id`, `location_id`, `product_id` | Physical stock count discrepancy adjustments |
| 12 | `StockLedger` | `id` | `product_id`, `warehouse_id`, `location_id` | Immutable transaction movement audit log |

---

## 3. Team Work Division (4 Vertical Slices)

### **Slice 1 (OWNED BY YOU): Auth, Dashboard, Settings & UI/UX Cohesion**
- **DB Tables Owned**: `User`, `Warehouse`, `Location`
- **Core Responsibilities**:
  1. **Authentication Flow**: Signup, Login, OTP-based password reset, token persistence, redirect.
  2. **Dashboard KPIs**: Aggregate counts from all 4 slices (`Total Products in Stock`, `Low/Out of Stock`, `Pending Receipts`, `Pending Deliveries`, `Scheduled Transfers`).
  3. **4 Dynamic Filters**: Document Type, Document Status, Warehouse/Location, Product Category.
  4. **Settings → Warehouse Management**: Create & edit warehouses, add sub-locations, capacity monitoring.
  5. **Profile Menu**: User profile view/edit, role assignment, logout.
  6. **UI/UX Design System**: Theme system (Dark/Light mode), consistent spacing, navigation, badges, toast/modal feedback.
- **API Endpoints**:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/otp/request`
  - `POST /api/auth/otp/verify`
  - `GET /api/dashboard/kpis`
  - `GET /api/warehouses`
  - `POST /api/warehouses`
  - `PUT /api/warehouses/:id`
  - `POST /api/warehouses/:id/locations`
  - `GET /api/profile`
  - `PUT /api/profile`

---

### **Slice 2: Product Catalog & Inbound Receipts (Member 2)**
- **DB Tables Owned**: `Product`, `Category`, `UnitOfMeasure`, `Receipt`
- **Core Responsibilities**: SKU catalog creation, category mapping, unit of measure configuration, supplier purchase order receipts processing into warehouse stock.

### **Slice 3: Outbound Sales Deliveries & Customer Fulfillment (Member 3)**
- **DB Tables Owned**: `DeliveryOrder`, `StockQuantity`
- **Core Responsibilities**: Customer sales delivery orders, stock reservation engine, delivery status workflow (`Draft` → `Waiting` → `Ready` → `Done`), stock depletion.

### **Slice 4: Internal Transfers, Adjustments & Audit Stock Ledger (Member 4)**
- **DB Tables Owned**: `InternalTransfer`, `StockAdjustment`, `StockLedger`
- **Core Responsibilities**: Inter-warehouse stock transfers, physical count stock discrepancy adjustments, immutable audit logging in `StockLedger`.

---

## 4. Evaluator Commit & Verification Protocol

1. **Commit Granularity**: Every commit for Slice 1 must contain changes exclusively related to Auth, Dashboard, Warehouses, or Profile endpoints/components to ensure 100% commit-based evaluation clarity.
2. **Evaluator Q&A Preparedness**: Evaluator can inspect any function in `server/src/server.js` or `client/src/components/DashboardView.jsx` and trace SQL queries/JSON aggregations back to `User`, `Warehouse`, and `Location` tables.
