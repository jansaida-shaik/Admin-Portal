import { Router } from 'express';
import authenticate from '../../middleware/auth.middleware';
import asyncHandler from '../../utils/asyncHandler';
import { z } from 'zod';
import { fireWebhook } from '../../utils/webhook';
const { prisma } = require('../../prisma');

const router = Router();

// GET all users
router.get('/', authenticate, asyncHandler(async (req: any, res: any) => {
  const users = await prisma.user.findMany({
    include: { location: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(users);
}));

// GET single user
router.get('/:id', authenticate, asyncHandler(async (req: any, res: any) => {
  const user = await prisma.user.findUnique({
    where: { id: BigInt(req.params.id) },
    include: { location: true }
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}));

// POST create user (Admin only in real scenario)
router.post('/', authenticate, asyncHandler(async (req: any, res: any) => {
  const userSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    role: z.string().optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
    locationId: z.any().optional()
  });

  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Validation failed', details: parsed.error.format() });
  }

  const { name, email, password, role, locationId, phone, department } = parsed.data;
  
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: password || 'defaultpassword123',
      role: role || 'STAFF',
      locationId: locationId ? BigInt(locationId) : null,
      phone,
      department: department || 'GENERAL'
    }
  });

  // FIRE WEBHOOK
  await fireWebhook('USER_CREATED', {
    content: `🎉 **New Employee Onboarded!**\n**Name:** ${user.name}\n**Role:** ${user.role}`
  });

  res.status(201).json(user);
}));

// PUT update user
router.put('/:id', authenticate, asyncHandler(async (req: any, res: any) => {
  const { name, email, role, locationId, phone, department } = req.body;
  const user = await prisma.user.update({
    where: { id: BigInt(req.params.id) },
    data: {
      name,
      email,
      role,
      locationId: locationId ? BigInt(locationId) : null,
      phone,
      department
    }
  });
  res.json(user);
}));

export default router;
