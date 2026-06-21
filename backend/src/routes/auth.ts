import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { generateToken, authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { staffId, password, role } = req.body;

    if (!staffId || !password || !role) {
      return res.status(400).json({ error: 'Staff ID, password, and role are required' });
    }

    if (password !== '12345') {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const staffIdNum = parseInt(staffId, 10);
    if (isNaN(staffIdNum) || staffIdNum < 1 || staffIdNum > 999) {
      return res.status(400).json({ error: 'Invalid Staff ID format' });
    }

    const { data: staff, error } = await supabase
      .from('Staff_Master')
      .select('*')
      .eq('Staff_3_Digit_ID', staffIdNum)
      .single();

    if (error || !staff) {
      return res.status(401).json({ error: 'Staff ID not found' });
    }

    const { data: dept } = await supabase
      .from('User_Department')
      .select('Department_Name')
      .eq('Department_ID', staff.Department_ID)
      .single();

    const isAdmin = staff.Department_ID === 'dept_admin';
    const departmentName = dept?.Department_Name || '';

    if (role === 'admin' && !isAdmin) {
      return res.status(403).json({ error: 'You are not an admin' });
    }

    if (role === 'department' && isAdmin) {
      return res.status(403).json({ error: 'Admin cannot access department' });
    }

    const payload = {
      staff_uid: staff.Staff_UID,
      staff_id: staff.Staff_3_Digit_ID,
      name: staff.Staff_Name,
      department_id: staff.Department_ID,
      department_name: departmentName,
      is_admin: isAdmin,
    };

    const token = generateToken(payload);

    return res.json({ token, user: payload });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  // #region agent log
  fetch('http://127.0.0.1:7938/ingest/4cc01ec9-c339-433d-bf09-8d0023db4574',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'55ad04'},body:JSON.stringify({sessionId:'55ad04',location:'auth.ts:me',message:'GET /auth/me called',data:{staffId:req.user?.staff_id,isAdmin:req.user?.is_admin},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
  // #endregion
  return res.json({ user: req.user });
});

export default router;
