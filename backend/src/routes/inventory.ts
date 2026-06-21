import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Get all inventory items (with category filter + search)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let query = supabase
      .from('Inventory_Items')
      .select('*')
      .not('Item_Name', 'like', '[Category Placeholder]%')
      .order('Item_Name', { ascending: true });

    if (category && category !== 'all') {
      query = query.eq('Category', category as string);
    }
    if (search) {
      query = query.ilike('Item_Name', `%${search}%`);
    }

    const { data: items, error } = await query;
    if (error) return res.status(500).json({ error: 'Failed to fetch inventory' });
    return res.json({ items });
  } catch (err) {
    console.error('Fetch inventory error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get categories
router.get('/categories', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('Inventory_Items')
      .select('Category')
      .order('Category');
    if (error) return res.status(500).json({ error: 'Failed to fetch categories' });
    const categories = [...new Set(data.map((i: any) => i.Category))];
    return res.json({ categories });
  } catch (err) {
    console.error('Fetch categories error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create category (Admin) — adds a placeholder item to persist the category
router.post('/categories', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Category name required' });
    const trimmed = name.trim();
    const { data: existing } = await supabase
      .from('Inventory_Items')
      .select('Category')
      .eq('Category', trimmed)
      .limit(1);
    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Category already exists' });
    }
    const itemId = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6).toLowerCase()}`;
    const { error: insertError } = await supabase.from('Inventory_Items').insert({
      Item_ID: itemId,
      Item_Name: `[Category Placeholder] ${trimmed}`,
      Category: trimmed,
      Current_Stock: 0,
      Low_Stock_Threshold: 0,
    });
    if (insertError) return res.status(500).json({ error: 'Failed to create category' });
    // #region agent log
    fetch('http://127.0.0.1:7938/ingest/4cc01ec9-c339-433d-bf09-8d0023db4574',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'55ad04'},body:JSON.stringify({sessionId:'55ad04',location:'inventory.ts:createCategory',message:'Category persisted',data:{name:trimmed,itemId},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    return res.json({ success: true, name: trimmed });
  } catch (err) {
    console.error('Create category error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Rename category (Admin)
router.put('/categories/rename', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { oldName, newName } = req.body;
    if (!oldName || !newName) return res.status(400).json({ error: 'Old and new category names required' });
    const { error } = await supabase
      .from('Inventory_Items')
      .update({ Category: newName })
      .eq('Category', oldName);
    if (error) return res.status(500).json({ error: 'Failed to rename category' });
    return res.json({ success: true });
  } catch (err) {
    console.error('Rename category error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete category (Admin) — reassigns items to 'Uncategorized'
router.delete('/categories/:name', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const nameParam = req.params.name as string;
    const decoded = decodeURIComponent(nameParam);
    const { error } = await supabase
      .from('Inventory_Items')
      .update({ Category: 'Uncategorized' })
      .eq('Category', decoded);
    if (error) return res.status(500).json({ error: 'Failed to delete category' });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete category error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get low stock items (Admin)
router.get('/low-stock', authMiddleware, adminOnly, async (_req: Request, res: Response) => {
  try {
    const { data: allItems, error } = await supabase
      .from('Inventory_Items')
      .select('*')
      .order('Current_Stock', { ascending: true });
    if (error) return res.status(500).json({ error: 'Failed to fetch low stock items' });
    const lowStock = allItems.filter((item: any) => item.Current_Stock <= item.Low_Stock_Threshold);
    return res.json({ items: lowStock });
  } catch (err) {
    console.error('Fetch low stock error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new item (Admin)
router.post('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { itemName, category, currentStock, lowStockThreshold } = req.body;
    if (!itemName || !category) {
      return res.status(400).json({ error: 'Item name and category required' });
    }
    const itemId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6).toLowerCase()}`;
    const { error } = await supabase.from('Inventory_Items').insert({
      Item_ID: itemId,
      Item_Name: itemName,
      Category: category,
      Current_Stock: currentStock || 0,
      Low_Stock_Threshold: lowStockThreshold ?? 10,
    });
    if (error) return res.status(500).json({ error: 'Failed to create item' });
    return res.status(201).json({ itemId });
  } catch (err) {
    console.error('Create item error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update item (Admin)
router.put('/:itemId', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { itemName, category, currentStock, lowStockThreshold } = req.body;
    const updates: any = {};
    if (itemName !== undefined) updates.Item_Name = itemName;
    if (category !== undefined) updates.Category = category;
    if (currentStock !== undefined) updates.Current_Stock = currentStock;
    if (lowStockThreshold !== undefined) updates.Low_Stock_Threshold = lowStockThreshold;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    const { error } = await supabase.from('Inventory_Items').update(updates).eq('Item_ID', itemId);
    if (error) return res.status(500).json({ error: 'Failed to update item' });
    return res.json({ success: true });
  } catch (err) {
    console.error('Update item error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete item (Admin)
router.delete('/:itemId', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { count } = await supabase
      .from('Order_Line_Items')
      .select('*', { count: 'exact', head: true })
      .eq('Item_ID', itemId);
    if (count && count > 0) {
      return res.status(409).json({ error: 'Cannot delete item referenced in orders' });
    }
    const { error } = await supabase.from('Inventory_Items').delete().eq('Item_ID', itemId);
    if (error) return res.status(500).json({ error: 'Failed to delete item' });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete item error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Stock inwarding (Admin)
router.post('/inward', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { itemId, quantity } = req.body;
    const user = req.user!;
    if (!itemId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Item ID and valid quantity required' });
    }
    const { data: item, error: fetchError } = await supabase
      .from('Inventory_Items')
      .select('Current_Stock')
      .eq('Item_ID', itemId)
      .single();
    if (fetchError || !item) return res.status(404).json({ error: 'Item not found' });
    const prevStock = item.Current_Stock;
    const newStock = prevStock + quantity;
    const { error: updateError } = await supabase
      .from('Inventory_Items')
      .update({ Current_Stock: newStock })
      .eq('Item_ID', itemId);
    if (updateError) return res.status(500).json({ error: 'Failed to update stock' });
    // Log stock movement
    const movId = `MOV_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    await supabase.from('Stock_Movements').insert({
      Movement_ID: movId,
      Item_ID: itemId,
      Movement_Type: 'Inward',
      Quantity: quantity,
      Previous_Stock: prevStock,
      New_Stock: newStock,
      Performed_By: user.staff_uid,
    }).maybeSingle();
    return res.json({ success: true, newStock });
  } catch (err) {
    console.error('Stock inward error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
