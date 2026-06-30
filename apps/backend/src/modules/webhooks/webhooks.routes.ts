import { Router } from 'express';
import authenticate from '../../middleware/auth.middleware';
import asyncHandler from '../../utils/asyncHandler';
const { prisma } = require('../../prisma');

const router = Router();

// GET all active webhooks
router.get('/', authenticate, asyncHandler(async (req: any, res: any) => {
  const webhooks = await prisma.webhook.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json(webhooks);
}));

// POST create webhook
router.post('/', authenticate, asyncHandler(async (req: any, res: any) => {
  const { url, event } = req.body;
  if (!url || !event) {
    return res.status(400).json({ error: 'URL and Event are required' });
  }

  const webhook = await prisma.webhook.create({
    data: {
      name: `Webhook - ${event}`,
      url,
      events: JSON.stringify([event]),
      isActive: true
    }
  });
  res.status(201).json(webhook);
}));

// PUT toggle webhook active status
router.put('/:id', authenticate, asyncHandler(async (req: any, res: any) => {
  const { isActive } = req.body;
  const webhook = await prisma.webhook.update({
    where: { id: BigInt(req.params.id) },
    data: { isActive }
  });
  res.json(webhook);
}));

// DELETE webhook
router.delete('/:id', authenticate, asyncHandler(async (req: any, res: any) => {
  await prisma.webhook.delete({
    where: { id: BigInt(req.params.id) }
  });
  res.json({ success: true });
}));

export default router;
