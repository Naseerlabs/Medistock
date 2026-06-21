CREATE TABLE IF NOT EXISTS "Stock_Movements" (
  "Movement_ID" TEXT PRIMARY KEY,
  "Item_ID" TEXT NOT NULL REFERENCES "Inventory_Items"("Item_ID"),
  "Order_ID" TEXT REFERENCES "Requisition_Orders"("Order_ID"),
  "Movement_Type" TEXT NOT NULL CHECK ("Movement_Type" IN ('Inward', 'Dispatch', 'Rejection_Return', 'Adjustment')),
  "Quantity" INTEGER NOT NULL,
  "Previous_Stock" INTEGER NOT NULL,
  "New_Stock" INTEGER NOT NULL,
  "Performed_By" TEXT NOT NULL REFERENCES "Staff_Master"("Staff_UID"),
  "Created_At" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON "Stock_Movements"("Item_ID");
CREATE INDEX IF NOT EXISTS idx_stock_movements_order ON "Stock_Movements"("Order_ID");
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON "Stock_Movements"("Created_At");
