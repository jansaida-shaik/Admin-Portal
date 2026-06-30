import { Router } from 'express';
import authenticate from '../../middleware/auth.middleware';
import asyncHandler from '../../utils/asyncHandler';
import { sendEmail } from '../../utils/mailer';
const { prisma } = require('../../prisma');

const router = Router();

// GET all subscriptions (with optional upcoming renewals filter)
router.get('/', authenticate, asyncHandler(async (req: any, res: any) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 25;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const upcoming = req.query.upcoming === 'true'; // Filter by upcoming renewals only

  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { vendor: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } }
    ];
  }

  // If upcoming filter is set, show subscriptions renewing in the next X days
  if (upcoming) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 90); // default lookahead 90 days
    where.renewalDate = {
      gte: today,
      lte: futureDate
    };
    where.status = 'ACTIVE';
  }

  const [data, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      skip,
      take: limit,
      orderBy: upcoming ? { renewalDate: 'asc' } : { createdAt: 'desc' }
    }),
    prisma.subscription.count({ where })
  ]);

  res.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}));

// GET single subscription
router.get('/:id', authenticate, asyncHandler(async (req: any, res: any) => {
  const sub = await prisma.subscription.findUnique({
    where: { id: BigInt(req.params.id) }
  });
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });
  res.json(sub);
}));

// POST new subscription
router.post('/', authenticate, asyncHandler(async (req: any, res: any) => {
  const {
    name, vendor, plan, category, licenseCount, cost, 
    billingFrequency, purchaseDate, renewalDate, autoRenew, 
    paymentMethod, owner, notes, attachments
  } = req.body;

  const sub = await prisma.subscription.create({
    data: {
      name,
      vendor,
      plan,
      category,
      licenseCount: licenseCount ? parseInt(licenseCount) : null,
      cost: parseFloat(cost) || 0,
      billingFrequency,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      renewalDate: new Date(renewalDate),
      autoRenew: autoRenew === true || autoRenew === 'true',
      paymentMethod,
      owner,
      notes,
      attachments
    }
  });

  // FIRE EMAIL (Automation Engine)
  await sendEmail(
    process.env.ADMIN_EMAIL || 'admin@codegnan.com',
    `New Subscription Created: ${sub.name}`,
    `<h2>New Subscription Alert</h2>
     <p>A new SaaS subscription for <b>${sub.name}</b> (Vendor: ${sub.vendor}) was just created in the Codegnan Admin Portal.</p>
     <p><b>Cost:</b> ₹${sub.cost} / ${sub.billingFrequency}</p>`
  );

  res.status(201).json(sub);
}));

// PUT update subscription
router.put('/:id', authenticate, asyncHandler(async (req: any, res: any) => {
  const {
    name, vendor, plan, category, licenseCount, cost, 
    billingFrequency, purchaseDate, renewalDate, autoRenew, 
    paymentMethod, owner, notes, attachments, status
  } = req.body;

  const updateData: any = {
    name, vendor, plan, category, billingFrequency, paymentMethod, owner, notes, attachments, status
  };

  if (licenseCount !== undefined) updateData.licenseCount = licenseCount ? parseInt(licenseCount) : null;
  if (cost !== undefined) updateData.cost = parseFloat(cost) || 0;
  if (purchaseDate) updateData.purchaseDate = new Date(purchaseDate);
  if (renewalDate) updateData.renewalDate = new Date(renewalDate);
  if (autoRenew !== undefined) updateData.autoRenew = autoRenew === true || autoRenew === 'true';

  const sub = await prisma.subscription.update({
    where: { id: BigInt(req.params.id) },
    data: updateData
  });

  res.json(sub);
}));

// DELETE subscription
router.delete('/:id', authenticate, asyncHandler(async (req: any, res: any) => {
  await prisma.subscription.delete({
    where: { id: BigInt(req.params.id) }
  });
  res.json({ success: true });
}));

export default router;
