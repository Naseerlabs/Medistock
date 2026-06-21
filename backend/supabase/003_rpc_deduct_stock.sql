-- Supabase RPC: Deduct stock atomically
CREATE OR REPLACE FUNCTION deduct_stock(p_item_id TEXT, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT "Current_Stock" INTO current_stock
  FROM "Inventory_Items"
  WHERE "Item_ID" = p_item_id
  FOR UPDATE;

  IF current_stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock for item %', p_item_id;
  END IF;

  UPDATE "Inventory_Items"
  SET "Current_Stock" = "Current_Stock" - p_quantity
  WHERE "Item_ID" = p_item_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
