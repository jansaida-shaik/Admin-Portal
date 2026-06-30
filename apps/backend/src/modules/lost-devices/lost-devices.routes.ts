import { Router } from 'express';
import authenticate from '../../middleware/auth.middleware';
import asyncHandler from '../../utils/asyncHandler';
const { prisma } = require('../../prisma');

const router = Router();

// GET all lost/damaged devices
router.get('/', authenticate, asyncHandler(async (req: any, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 25;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.lostDamagedDevice.findMany({
      skip,
      take: limit,
      include: {
        item: { include: { category: true } },
        user: true,
        location: true
      },
      orderBy: { incidentDate: 'desc' }
    }),
    prisma.lostDamagedDevice.count()
  ]);

  res.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}));

// POST new incident
router.post('/', authenticate, asyncHandler(async (req: any, res: any) => {
  const {
    itemId, userId, locationId, status, incidentDate, 
    description, attachments, insuranceDetails, recoveryStatus
  } = req.body;

  const record = await prisma.lostDamagedDevice.create({
    data: {
      itemId: BigInt(itemId),
      userId: userId ? BigInt(userId) : null,
      locationId: locationId ? BigInt(locationId) : null,
      status, // LOST, DAMAGED, STOLEN, UNDER_REPAIR, RECOVERED
      incidentDate: new Date(incidentDate),
      description,
      attachments,
      insuranceDetails,
      recoveryStatus
    }
  });

  // Optional: automatically adjust stock or assignment status based on logic here
  // e.g., if status === 'LOST', decrement stock

  res.status(201).json(record);
}));

export default router;
