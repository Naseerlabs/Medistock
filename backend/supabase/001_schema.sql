-- MediStock SaaS MVP - Database Schema

-- 1. User_Department
CREATE TABLE IF NOT EXISTS "User_Department" (
  "Department_ID" TEXT PRIMARY KEY,
  "Department_Name" TEXT NOT NULL
);

-- 2. Staff_Master
CREATE TABLE IF NOT EXISTS "Staff_Master" (
  "Staff_UID" TEXT PRIMARY KEY,
  "Staff_3_Digit_ID" INTEGER UNIQUE NOT NULL,
  "Staff_Name" TEXT NOT NULL,
  "Department_ID" TEXT NOT NULL REFERENCES "User_Department"("Department_ID")
);

-- 3. Inventory_Items
CREATE TABLE IF NOT EXISTS "Inventory_Items" (
  "Item_ID" TEXT PRIMARY KEY,
  "Item_Name" TEXT NOT NULL,
  "Category" TEXT NOT NULL,
  "Current_Stock" INTEGER NOT NULL DEFAULT 0,
  "Low_Stock_Threshold" INTEGER NOT NULL DEFAULT 10,
  "Item_Image" TEXT
);

-- 4. Requisition_Orders
CREATE TABLE IF NOT EXISTS "Requisition_Orders" (
  "Order_ID" TEXT PRIMARY KEY,
  "Department_ID" TEXT NOT NULL REFERENCES "User_Department"("Department_ID"),
  "Staff_ID" TEXT NOT NULL REFERENCES "Staff_Master"("Staff_UID"),
  "Order_Timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "Order_Status" TEXT NOT NULL DEFAULT 'Pending' CHECK ("Order_Status" IN ('Pending', 'Packed', 'Dispatched', 'Rejected'))
);

CREATE INDEX IF NOT EXISTS idx_orders_status_dept ON "Requisition_Orders"("Order_Status", "Department_ID");

-- 5. Order_Line_Items
CREATE TABLE IF NOT EXISTS "Order_Line_Items" (
  "Line_Item_ID" TEXT PRIMARY KEY,
  "Order_ID" TEXT NOT NULL REFERENCES "Requisition_Orders"("Order_ID"),
  "Item_ID" TEXT NOT NULL REFERENCES "Inventory_Items"("Item_ID"),
  "Quantity_Requested" INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_line_items_order ON "Order_Line_Items"("Order_ID");
