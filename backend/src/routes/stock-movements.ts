import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Get stock movements (with pagination & filters)
router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { itemId, type, limit = '50', offset = '0' } = req.query;

    let query = supabase
      .from('Stock_Movements')
      .select('*, Inventory_Items!inner(Item_Name, Category), Staff_Master!inner(Staff_Name)', { count: 'exact' });

    if (itemId) query = query.eq('Item_ID', itemId);
    if (type) query = query.eq('Movement_Type', type);

    const { data, error, count } = await query
      .order('Created_At', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) return res.status(500).json({ error: 'Failed to fetch stock movements' });
    return res.json({ movements: data, total: count });
  } catch (err) {
    console.error('Fetch stock movements error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
