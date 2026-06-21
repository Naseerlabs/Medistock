import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// List all departments
router.get('/departments', authMiddleware, adminOnly, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('User_Department')
      .select('Department_ID, Department_Name')
      .order('Department_Name');
    if (error) return res.status(500).json({ error: 'Failed to fetch departments' });
    return res.json({ departments: data });
  } catch (err) {
    console.error('Fetch departments error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// List all staff
router.get('/', authMiddleware, adminOnly, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('Staff_Master')
      .select('*, User_Department!inner(Department_Name)')
      .order('Staff_Name');
    if (error) return res.status(500).json({ error: 'Failed to fetch staff' });
    return res.json({ staff: data });
  } catch (err) {
    console.error('Fetch staff error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create staff
router.post('/', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { name, departmentId, staffId } = req.body;
    if (!name || !departmentId || !staffId) {
      return res.status(400).json({ error: 'Name, department, and 3-digit ID required' });
    }
    if (staffId < 1 || staffId > 999) {
      return res.status(400).json({ error: 'Staff ID must be between 1 and 999' });
    }
    const uid = `stf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const { error } = await supabase.from('Staff_Master').insert({
      Staff_UID: uid,
      Staff_3_Digit_ID: staffId,
      Staff_Name: name,
      Department_ID: departmentId,
    });
    if (error) {
      if (error.message?.includes('duplicate')) {
        return res.status(409).json({ error: 'Staff ID already exists' });
      }
      return res.status(500).json({ error: 'Failed to create staff' });
    }
    return res.status(201).json({ staffUid: uid });
  } catch (err) {
    console.error('Create staff error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update staff
router.put('/:uid', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { name, departmentId, staffId } = req.body;
    const updates: any = {};
    if (name) updates.Staff_Name = name;
    if (departmentId) updates.Department_ID = departmentId;
    if (staffId) updates.Staff_3_Digit_ID = staffId;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    const { error } = await supabase.from('Staff_Master').update(updates).eq('Staff_UID', uid);
    if (error) {
      if (error.message?.includes('duplicate')) {
        return res.status(409).json({ error: 'Staff ID already exists' });
      }
      return res.status(500).json({ error: 'Failed to update staff' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Update staff error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete staff
router.delete('/:uid', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { count } = await supabase
      .from('Requisition_Orders')
      .select('*', { count: 'exact', head: true })
      .eq('Staff_ID', uid);
    if (count && count > 0) {
      return res.status(409).json({ error: 'Cannot delete staff with existing orders' });
    }
    const { error } = await supabase.from('Staff_Master').delete().eq('Staff_UID', uid);
    if (error) return res.status(500).json({ error: 'Failed to delete staff' });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete staff error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk import staff
router.post('/bulk', authMiddleware, adminOnly, async (req: Request, res: Response) => {
  try {
    const { staff } = req.body;
    if (!staff || !Array.isArray(staff) || staff.length === 0) {
      return res.status(400).json({ error: 'Staff array required' });
    }
    const results = { success: 0, errors: 0, items: [] as any[] };
    for (const s of staff) {
      if (!s.name || !s.departmentId || !s.staffId) {
        results.errors++;
        results.items.push({ name: s.name, error: 'Missing fields' });
        continue;
      }
      if (s.staffId < 1 || s.staffId > 999) {
        results.errors++;
        results.items.push({ name: s.name, error: 'Invalid ID (1-999)' });
        continue;
      }
      const uid = `stf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const { error } = await supabase.from('Staff_Master').insert({
        Staff_UID: uid,
        Staff_3_Digit_ID: s.staffId,
        Staff_Name: s.name,
        Department_ID: s.departmentId,
      });
      if (error) {
        results.errors++;
        results.items.push({ name: s.name, error: error.message });
      } else {
        results.success++;
        results.items.push({ name: s.name, status: 'created' });
      }
    }
    return res.json(results);
  } catch (err) {
    console.error('Bulk import error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
