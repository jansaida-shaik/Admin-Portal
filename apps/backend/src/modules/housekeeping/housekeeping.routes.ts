import { Router } from 'express';
import authenticate from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';
import asyncHandler from '../../utils/asyncHandler';
const { prisma } = require('../../prisma');

const router = Router();

// ==========================================
// SALARIES (Admin Only for CRUD, Staff can Read their own)
// ==========================================

// Get all salaries (Admin) or own salaries (Staff)
router.get('/salaries', authenticate, asyncHandler(async (req: any, res: any) => {
  if (req.user.role === 'ADMIN') {
    const salaries = await prisma.salary.findMany({
      include: { user: { select: { name: true, department: true } } },
      orderBy: { effectiveDate: 'desc' }
    });
    res.json(salaries);
  } else {
    const salaries = await prisma.salary.findMany({
      where: { userId: BigInt(req.user.id) },
      orderBy: { effectiveDate: 'desc' }
    });
    res.json(salaries);
  }
}));

// Admin routes for Salaries
router.post('/salaries', authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
  const { userId, amount, effectiveDate } = req.body;
  const salary = await prisma.salary.create({
    data: {
      userId: BigInt(userId),
      amount: parseFloat(amount),
      effectiveDate: new Date(effectiveDate)
    }
  });
  res.status(201).json(salary);
}));

router.put('/salaries/:id', authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
  const { amount, effectiveDate } = req.body;
  const salary = await prisma.salary.update({
    where: { id: BigInt(req.params.id) },
    data: {
      amount: parseFloat(amount),
      effectiveDate: new Date(effectiveDate)
    }
  });
  res.json(salary);
}));

router.delete('/salaries/:id', authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
  await prisma.salary.delete({ where: { id: BigInt(req.params.id) } });
  res.json({ success: true });
}));

// ==========================================
// ATTENDANCE (Admin can mark for others, Staff can view)
// ==========================================

router.get('/attendance', authenticate, asyncHandler(async (req: any, res: any) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  // Ensure date comparison covers the whole day or exact date match
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0,0,0,0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23,59,59,999);

  if (req.user.role === 'ADMIN') {
    const records = await prisma.attendance.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay } },
      include: { user: { select: { name: true, department: true } } }
    });
    res.json(records);
  } else {
    const records = await prisma.attendance.findMany({
      where: { 
        userId: BigInt(req.user.id),
        date: { gte: startOfDay, lte: endOfDay }
      }
    });
    res.json(records);
  }
}));

// Mark attendance (Admin can mark for anyone, staff mark for themselves)
router.post('/attendance', authenticate, asyncHandler(async (req: any, res: any) => {
  let { userId, date, checkIn, checkOut, status } = req.body;
  if (req.user.role !== 'ADMIN') {
    userId = req.user.id; // Force staff to only mark their own
    // Staff can only update today's attendance
    date = new Date(); 
  }

  const parsedDate = new Date(date);
  parsedDate.setUTCHours(0,0,0,0); // Normalize to start of day

  const record = await prisma.attendance.upsert({
    where: {
      userId_date: {
        userId: BigInt(userId),
        date: parsedDate
      }
    },
    update: {
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      status
    },
    create: {
      userId: BigInt(userId),
      date: parsedDate,
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      status
    }
  });
  res.status(200).json(record);
}));

router.post('/attendance/bulk', authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
  const { date, records } = req.body;
  const parsedDate = new Date(date);
  parsedDate.setUTCHours(0,0,0,0);

  const ops = records.map((r: any) => prisma.attendance.upsert({
    where: { userId_date: { userId: BigInt(r.userId), date: parsedDate } },
    update: { status: r.status, checkIn: r.checkIn ? new Date(r.checkIn) : null, checkOut: r.checkOut ? new Date(r.checkOut) : null },
    create: { userId: BigInt(r.userId), date: parsedDate, status: r.status, checkIn: r.checkIn ? new Date(r.checkIn) : null, checkOut: r.checkOut ? new Date(r.checkOut) : null }
  }));
  
  await prisma.$transaction(ops);
  res.status(200).json({ success: true, count: ops.length });
}));

// ==========================================
// LEAVES
// ==========================================

router.get('/leaves', authenticate, asyncHandler(async (req: any, res: any) => {
  if (req.user.role === 'ADMIN') {
    const leaves = await prisma.leave.findMany({
      include: { user: { select: { name: true, department: true } } },
      orderBy: { startDate: 'desc' }
    });
    res.json(leaves);
  } else {
    const leaves = await prisma.leave.findMany({
      where: { userId: BigInt(req.user.id) },
      orderBy: { startDate: 'desc' }
    });
    res.json(leaves);
  }
}));

router.post('/leaves', authenticate, asyncHandler(async (req: any, res: any) => {
  const { startDate, endDate, reason, leaveType } = req.body;
  const leave = await prisma.leave.create({
    data: {
      userId: BigInt(req.user.id),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      leaveType: leaveType || 'CASUAL',
      status: 'PENDING'
    }
  });
  res.status(201).json(leave);
}));

router.get('/leaves/quota', authenticate, asyncHandler(async (req: any, res: any) => {
  const userId = req.user.role === 'ADMIN' && req.query.userId ? BigInt(req.query.userId) : BigInt(req.user.id);
  const quota = await prisma.leaveQuota.findUnique({ where: { userId } });
  if (!quota) return res.json({ sickLeave: 12, casualLeave: 12, earnedLeave: 0 }); // Default fallback
  res.json(quota);
}));

router.put('/leaves/:id/status', authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
  const { status } = req.body;
  const leave = await prisma.leave.update({
    where: { id: BigInt(req.params.id) },
    data: { status }
  });
  res.json(leave);
}));

// ==========================================
// DAILY CHECKLIST (Admin manages, Staff completes)
// ==========================================

router.get('/checklist', authenticate, asyncHandler(async (req: any, res: any) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0,0,0,0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23,59,59,999);

  if (req.user.role === 'ADMIN') {
    const checklists = await prisma.dailyChecklist.findMany({
      where: { date: { gte: startOfDay, lte: endOfDay } },
      include: { user: { select: { name: true, department: true } } }
    });
    res.json(checklists);
  } else {
    const checklists = await prisma.dailyChecklist.findMany({
      where: { 
        userId: BigInt(req.user.id),
        date: { gte: startOfDay, lte: endOfDay }
      }
    });
    res.json(checklists);
  }
}));

// Admin assigns task
router.post('/checklist', authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
  const { userId, date, task } = req.body;
  const parsedDate = new Date(date);
  parsedDate.setUTCHours(0,0,0,0);

  const checklist = await prisma.dailyChecklist.create({
    data: {
      userId: BigInt(userId),
      date: parsedDate,
      task
    }
  });
  res.status(201).json(checklist);
}));

// Staff (or admin) marks task as completed
router.put('/checklist/:id', authenticate, asyncHandler(async (req: any, res: any) => {
  const { isCompleted, photoUrl } = req.body;
  
  const existingTask = await prisma.dailyChecklist.findUnique({ where: { id: BigInt(req.params.id) } });
  if (!existingTask) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (req.user.role !== 'ADMIN' && existingTask.userId !== BigInt(req.user.id)) {
    return res.status(403).json({ error: 'Unauthorized to update this task' });
  }

  if (isCompleted && !photoUrl) {
    return res.status(400).json({ error: 'A photo upload is mandatory to complete this checklist task.' });
  }

  const checklist = await prisma.dailyChecklist.update({
    where: { id: BigInt(req.params.id) },
    data: { isCompleted, photoUrl }
  });
  res.json(checklist);
}));

// ==========================================
// DUTY ALLOCATION (Roster)
// ==========================================

router.get('/roster', authenticate, asyncHandler(async (req: any, res: any) => {
  if (req.user.role === 'ADMIN') {
    const roster = await prisma.dutyAllocation.findMany({
      include: { 
        user: { select: { name: true, department: true } },
        location: true 
      },
      orderBy: { assignedDate: 'desc' }
    });
    res.json(roster);
  } else {
    const roster = await prisma.dutyAllocation.findMany({
      where: { userId: BigInt(req.user.id) },
      include: { location: true },
      orderBy: { assignedDate: 'desc' }
    });
    res.json(roster);
  }
}));

router.post('/roster', authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
  const { userId, locationId, shiftTime, assignedDate } = req.body;
  const aDate = new Date(assignedDate);
  
  // Conflict Detection
  const existing = await prisma.dutyAllocation.findFirst({
    where: { userId: BigInt(userId), assignedDate: aDate }
  });
  
  if (existing) {
    return res.status(409).json({ error: 'User is already assigned to a shift on this date. Conflict detected.' });
  }

  const roster = await prisma.dutyAllocation.create({
    data: {
      userId: BigInt(userId),
      locationId: BigInt(locationId),
      shiftTime,
      assignedDate: aDate
    }
  });
  res.status(201).json(roster);
}));

router.delete('/roster/:id', authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
  await prisma.dutyAllocation.delete({ where: { id: BigInt(req.params.id) } });
  res.json({ success: true });
}));

// ==========================================
// CLEANING INVENTORY
// ==========================================

router.get('/inventory', authenticate, asyncHandler(async (req: any, res: any) => {
  const stock = await prisma.cleaningStock.findMany({
    include: { item: true, location: true },
    orderBy: { lastUpdated: 'desc' }
  });
  res.json(stock);
}));

router.get('/inventory/alerts', authenticate, asyncHandler(async (req: any, res: any) => {
  // Low stock alerts where quantity <= minStock
  const alerts = await prisma.cleaningStock.findMany({
    where: {
      quantity: { lte: prisma.cleaningStock.fields.minStock }
    },
    include: { item: true, location: true }
  });
  res.json(alerts);
}));

router.post('/inventory/update', authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
  const { itemId, locationId, quantityAdded } = req.body;
  
  // Find existing stock or create new
  let stock = await prisma.cleaningStock.findFirst({
    where: { itemId: BigInt(itemId), locationId: BigInt(locationId) }
  });

  if (stock) {
    stock = await prisma.cleaningStock.update({
      where: { id: stock.id },
      data: { quantity: stock.quantity + Number(quantityAdded) }
    });
  } else {
    stock = await prisma.cleaningStock.create({
      data: {
        itemId: BigInt(itemId),
        locationId: BigInt(locationId),
        quantity: Number(quantityAdded)
      }
    });
  }

  res.status(200).json(stock);
}));

// ==========================================
// ISSUES (Service Requests)
// ==========================================

router.get('/issues', authenticate, asyncHandler(async (req: any, res: any) => {
  const issues = await prisma.serviceRequest.findMany({
    include: { user: { select: { name: true, department: true } }, item: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(issues);
}));

router.post('/issues', authenticate, asyncHandler(async (req: any, res: any) => {
  const { title, description, priority, itemId } = req.body;
  
  // Basic SLA calculation based on priority
  let slaDays = 7;
  if (priority === 'URGENT') slaDays = 1;
  else if (priority === 'HIGH') slaDays = 2;
  else if (priority === 'MEDIUM') slaDays = 3;

  const slaDueDate = new Date();
  slaDueDate.setDate(slaDueDate.getDate() + slaDays);

  const issue = await prisma.serviceRequest.create({
    data: {
      userId: BigInt(req.user.id),
      title,
      description,
      priority: priority || 'MEDIUM',
      itemId: itemId ? BigInt(itemId) : null,
      slaDueDate
    }
  });
  res.status(201).json(issue);
}));

router.put('/issues/:id/status', authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
  const { status } = req.body;
  const issue = await prisma.serviceRequest.update({
    where: { id: BigInt(req.params.id) },
    data: { status }
  });
  res.json(issue);
}));

// ==========================================
// PAYROLL (Payslips)
// ==========================================

router.get('/payroll', authenticate, asyncHandler(async (req: any, res: any) => {
  if (req.user.role === 'ADMIN') {
    const payrolls = await prisma.payroll.findMany({
      include: { user: { select: { name: true, department: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payrolls);
  } else {
    const payrolls = await prisma.payroll.findMany({
      where: { userId: BigInt(req.user.id) },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payrolls);
  }
}));

router.post('/payroll/generate', authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
  const { userId, month, basicSalary, allowances, deductions } = req.body;
  
  const b = parseFloat(basicSalary || 0);
  const a = parseFloat(allowances || 0);
  const d = parseFloat(deductions || 0);
  const netPay = b + a - d;

  const payroll = await prisma.payroll.create({
    data: {
      userId: BigInt(userId),
      month,
      basicSalary: b,
      allowances: a,
      deductions: d,
      netPay,
      status: 'PENDING'
    }
  });
  res.status(201).json(payroll);
}));

router.put('/payroll/:id/pay', authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
  const payroll = await prisma.payroll.update({
    where: { id: BigInt(req.params.id) },
    data: { status: 'PAID', paymentDate: new Date() }
  });
  res.json(payroll);
}));

export default router;
