import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Create order (Department user)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    const user = req.user!;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }

    const itemDetails: any[] = [];
    for (const item of items) {
      const { data: inv, error } = await supabase
        .from('Inventory_Items')
        .select('Current_Stock, Item_Name')
        .eq('Item_ID', item.itemId)
        .single();
      if (error || !inv) {
        return res.status(400).json({ error: `Item ${item.itemId} not found` });
      }
      if (inv.Current_Stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${inv.Item_Name}` });
      }
      itemDetails.push({ ...inv, itemId: item.itemId, quantity: item.quantity });
    }

    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const { error: orderError } = await supabase.from('Requisition_Orders').insert({
      Order_ID: orderId,
      Department_ID: user.department_id,
      Staff_ID: user.staff_uid,
      Order_Status: 'Pending',
    });
    if (orderError) return res.status(500).json({ error: 'Failed to create order' });

    const lineItems = items.map((item: any, idx: number) => ({
      Line_Item_ID: `LI_${orderId}_${idx}`,
      Order_ID: orderId,
      Item_ID: item.itemId,
      Quantity_Requested: item.quantity,
    }));

    const { error: lineError } = await supabase.from('Order_Line_Items').insert(lineItems);
    if (lineError) {
      await supabase.from('Requisition_Orders').delete().eq('Order_ID', orderId);
      return res.status(500).json({ error: 'Failed to create order items' });
    }

    return res.status(201).json({ orderId, items: itemDetails });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get orders for current department (with pagination + status filter)
router.get('/department', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { limit = '20', offset = '0', status } = req.query;

    let query = supabase
      .from('Requisition_Orders')
      .select('*, Order_Line_Items(*, Inventory_Items!inner(Item_Name, Category))', { count: 'exact' })
      .eq('Department_ID', user.department_id)
      .eq('Staff_ID', user.staff_uid);

    if (status && status !== 'all') {
      query = query.eq('Order_Status', status as string);
    }

    const { data: orders, error, count } = await query
      .order('Order_Timestamp', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) return res.status(500).json({ error: 'Failed to fetch orders' });
    return res.json({ orders, total: count });
  } catch (err) {
    console.error('Fetch department orders error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all pending orders (Admin)
router.get('/pending', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { data: orders, error } = await supabase
      .from('Requisition_Orders')
      .select('*, User_Department!inner(Department_Name), Staff_Master!inner(Staff_Name), Order_Line_Items(*, Inventory_Items!inner(Item_Name, Category))')
      .in('Order_Status', ['Pending', 'Packed'])
      .order('Order_Timestamp', { ascending: true });

    if (error) return res.status(500).json({ error: 'Failed to fetch orders' });
    // #region agent log
    fetch('http://127.0.0.1:7938/ingest/4cc01ec9-c339-433d-bf09-8d0023db4574',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'55ad04'},body:JSON.stringify({sessionId:'55ad04',location:'orders.ts:pending',message:'Pending orders fetched',data:{count:orders?.length??0,statuses:orders?.map((o:any)=>o.Order_Status)??[]},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    return res.json({ orders });
  } catch (err) {
    console.error('Fetch pending orders error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dispatched history (Admin, with pagination)
router.get('/history', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { limit = '20', offset = '0' } = req.query;

    const { data: orders, error, count } = await supabase
      .from('Requisition_Orders')
      .select('*, User_Department!inner(Department_Name), Staff_Master!inner(Staff_Name)', { count: 'exact' })
      .eq('Order_Status', 'Dispatched')
      .order('Order_Timestamp', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) return res.status(500).json({ error: 'Failed to fetch history' });
    return res.json({ orders, total: count });
  } catch (err) {
    console.error('Fetch history error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk update order status (Admin)
router.patch('/bulk-status', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { orderIds, status } = req.body;
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'Order IDs required' });
    }
    if (!['Packed', 'Dispatched', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (status === 'Dispatched') {
      for (const orderId of orderIds) {
        const { data: existingOrder } = await supabase
          .from('Requisition_Orders')
          .select('Order_Status')
          .eq('Order_ID', orderId)
          .single();
        if (existingOrder?.Order_Status === 'Dispatched') continue;

        const { data: lineItems } = await supabase
          .from('Order_Line_Items')
          .select('*')
          .eq('Order_ID', orderId);
        if (lineItems) {
          for (const item of lineItems) {
            const { error: deductError } = await supabase.rpc('deduct_stock', {
              p_item_id: item.Item_ID,
              p_quantity: item.Quantity_Requested,
            });
            if (deductError) {
              return res.status(500).json({ error: `Stock deduction failed for order ${orderId}` });
            }
          }
        }
      }
    }

    const { error } = await supabase
      .from('Requisition_Orders')
      .update({ Order_Status: status })
      .in('Order_ID', orderIds);

    if (error) return res.status(500).json({ error: 'Failed to update orders' });
    return res.json({ success: true, updated: orderIds.length });
  } catch (err) {
    console.error('Bulk status update error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel order (department user or admin)
router.patch('/:orderId/cancel', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const user = req.user!;

    const { data: order, error: fetchError } = await supabase
      .from('Requisition_Orders')
      .select('*')
      .eq('Order_ID', orderId)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.Order_Status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    }

    if (!user.is_admin && order.Staff_ID !== user.staff_uid) {
      return res.status(403).json({ error: 'You can only cancel your own orders' });
    }

    const { error: updateError } = await supabase
      .from('Requisition_Orders')
      .update({ Order_Status: 'Rejected' })
      .eq('Order_ID', orderId);

    if (updateError) return res.status(500).json({ error: 'Failed to cancel order' });

    return res.json({ success: true, status: 'Rejected' });
  } catch (err) {
    console.error('Cancel order error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order details with line items
router.get('/:orderId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const { data: order, error } = await supabase
      .from('Requisition_Orders')
      .select('*, Order_Line_Items(*, Inventory_Items!inner(Item_Name, Category)), Staff_Master!inner(Staff_Name), User_Department!inner(Department_Name)')
      .eq('Order_ID', orderId)
      .single();

    if (error) return res.status(404).json({ error: 'Order not found' });

    const caller = req.user!;
    if (!caller.is_admin && order.Department_ID !== caller.department_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const itemIds = order.Order_Line_Items.map((li: any) => li.Item_ID);
    const { data: history } = await supabase
      .from('Order_Line_Items')
      .select('*, Requisition_Orders!inner(Order_Timestamp, Department_ID, Order_Status)')
      .in('Item_ID', itemIds)
      .eq('Requisition_Orders.Department_ID', order.Department_ID)
      .eq('Requisition_Orders.Order_Status', 'Dispatched')
      .neq('Order_ID', orderId)
      .order('Requisition_Orders.Order_Timestamp', { ascending: false })
      .limit(10);

    return res.json({ order, history });
  } catch (err) {
    console.error('Fetch order details error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status (Admin)
router.patch('/:orderId/status', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const user = req.user!;

    if (!['Pending', 'Packed', 'Dispatched', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data: existingOrder, error: fetchOrderError } = await supabase
      .from('Requisition_Orders')
      .select('Order_Status')
      .eq('Order_ID', orderId)
      .single();
    if (fetchOrderError || !existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status === 'Dispatched' && existingOrder.Order_Status === 'Dispatched') {
      return res.json({ success: true, status: 'Dispatched' });
    }

    if (status === 'Dispatched') {
      const { data: lineItems, error: fetchError } = await supabase
        .from('Order_Line_Items')
        .select('*')
        .eq('Order_ID', orderId);
      if (fetchError || !lineItems) {
        return res.status(500).json({ error: 'Failed to fetch order items' });
      }

      for (const item of lineItems) {
        const { data: inv } = await supabase
          .from('Inventory_Items')
          .select('Current_Stock')
          .eq('Item_ID', item.Item_ID)
          .single();

        const prevStock = inv?.Current_Stock ?? 0;

        const { error: deductError } = await supabase.rpc('deduct_stock', {
          p_item_id: item.Item_ID,
          p_quantity: item.Quantity_Requested,
        });
        if (deductError) {
          return res.status(500).json({ error: `Failed to deduct stock for ${item.Item_ID}` });
        }

        const newStock = prevStock - item.Quantity_Requested;
        const movId = `MOV_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        await supabase.from('Stock_Movements').insert({
          Movement_ID: movId,
          Item_ID: item.Item_ID,
          Order_ID: orderId,
          Movement_Type: 'Dispatch',
          Quantity: item.Quantity_Requested,
          Previous_Stock: prevStock,
          New_Stock: Math.max(0, newStock),
          Performed_By: user.staff_uid,
        }).maybeSingle();
      }
    }

    const { error: updateError } = await supabase
      .from('Requisition_Orders')
      .update({ Order_Status: status })
      .eq('Order_ID', orderId);

    if (updateError) return res.status(500).json({ error: 'Failed to update order status' });

    return res.json({ success: true, status });
  } catch (err) {
    console.error('Update order status error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
