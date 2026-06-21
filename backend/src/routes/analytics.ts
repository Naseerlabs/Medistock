import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Top requested items
router.get('/top-items', authMiddleware, adminOnly, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('Order_Line_Items')
      .select('Item_ID, Quantity_Requested, Inventory_Items!inner(Item_Name, Category), Requisition_Orders!inner(Order_Timestamp, Order_Status)')
      .gte('Requisition_Orders.Order_Timestamp', new Date(Date.now() - 90 * 86400000).toISOString())
      .neq('Requisition_Orders.Order_Status', 'Rejected');

    if (error) return res.status(500).json({ error: 'Failed to fetch analytics' + error.message });

    const agg: Record<string, { name: string; category: string; total: number }> = {};
    for (const item of data as any[]) {
      const id = item.Item_ID;
      if (!agg[id]) agg[id] = { name: item.Inventory_Items.Item_Name, category: item.Inventory_Items.Category, total: 0 };
      agg[id].total += item.Quantity_Requested;
    }

    const items = Object.entries(agg)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    return res.json({ items });
  } catch (err) {
    console.error('Analytics top items error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Department consumption
router.get('/dept-consumption', authMiddleware, adminOnly, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('Order_Line_Items')
      .select('Quantity_Requested, Requisition_Orders!inner(Department_ID, Order_Status), Inventory_Items!inner(Category)')
      .neq('Requisition_Orders.Order_Status', 'Rejected');

    if (error) return res.status(500).json({ error: 'Failed to fetch analytics' + error.message });

    const agg: Record<string, Record<string, number>> = {};
    for (const item of data as any[]) {
      const dept = item.Requisition_Orders.Department_ID;
      const cat = item.Inventory_Items.Category;
      if (!agg[dept]) agg[dept] = {};
      agg[dept][cat] = (agg[dept][cat] || 0) + item.Quantity_Requested;
    }

    return res.json({ departments: agg });
  } catch (err) {
    console.error('Analytics dept error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Monthly trends
router.get('/trends', authMiddleware, adminOnly, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('Requisition_Orders')
      .select('Order_Timestamp, Order_Status')
      .gte('Order_Timestamp', new Date(Date.now() - 365 * 86400000).toISOString());

    if (error) return res.status(500).json({ error: 'Failed to fetch trends' });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trends: Record<string, { total: number; dispatched: number; rejected: number }> = {};

    for (const order of data as any[]) {
      const d = new Date(order.Order_Timestamp);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      if (!trends[key]) trends[key] = { total: 0, dispatched: 0, rejected: 0 };
      trends[key].total++;
      if (order.Order_Status === 'Dispatched') trends[key].dispatched++;
      if (order.Order_Status === 'Rejected') trends[key].rejected++;
    }

    const series = Object.entries(trends).map(([month, v]) => ({ month, ...v })).sort((a, b) => {
      const [aMon, aYear] = a.month.split(' ');
      const [bMon, bYear] = b.month.split(' ');
      const monthIndex = (m: string) => months.indexOf(m);
      const yearDiff = parseInt(aYear) - parseInt(bYear);
      if (yearDiff !== 0) return yearDiff;
      return monthIndex(aMon) - monthIndex(bMon);
    });

    return res.json({ series });
  } catch (err) {
    console.error('Analytics trends error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
