import express from 'express';
import authenticate from '../../middleware/auth.middleware';
import asyncHandler from '../../utils/asyncHandler';

const router = express.Router();
const { prisma } = require('../../prisma');

// Get High-Level Metrics
router.get('/metrics', authenticate, asyncHandler(async (req: any, res: any) => {
  // Aggregate Employees
  const activeEmployees = await prisma.user.count();
  
  // Aggregate Subscriptions (Monthly Cost)
  const subscriptions = await prisma.subscription.findMany({ where: { status: 'ACTIVE' } });
  const totalMonthlyCost = subscriptions.reduce((acc, sub) => {
    let cost = Number(sub.cost);
    if (sub.billingFrequency === 'YEARLY') cost = cost / 12;
    if (sub.billingFrequency === 'QUARTERLY') cost = cost / 3;
    if (sub.billingFrequency === 'HALF_YEARLY') cost = cost / 6;
    return acc + cost;
  }, 0);

  // Aggregate Total Assets Value
  const assets = await prisma.item.findMany();
  const totalAssetsValue = assets.reduce((acc, asset) => acc + 0, 0); // No cost on items directly

  // Total Salary Outflow (estimate from latest salaries or just total)
  const salaries = await prisma.salary.findMany({
    orderBy: { effectiveDate: 'desc' }
  });
  // simplified logic: just sum up all current latest salaries. 
  // since this is a simple report, we'll just sum all distinct user salaries
  const uniqueSalaries = new Map();
  salaries.forEach(s => {
    if (!uniqueSalaries.has(s.userId)) {
      uniqueSalaries.set(s.userId, Number(s.amount));
    }
  });
  const totalMonthlySalary = Array.from(uniqueSalaries.values()).reduce((acc, val) => acc + val, 0);

  // Return aggregated metrics
  res.json({
    activeEmployees,
    totalMonthlyCost: Math.round(totalMonthlyCost),
    totalAssetsValue,
    totalMonthlySalary
  });
}));

// Get Charts Data (Distribution)
router.get('/charts', authenticate, asyncHandler(async (req: any, res: any) => {
  // Employee Distribution by Branch
  const locs = await prisma.location.findMany({ include: { users: true } });
  const employeesByBranch = locs.map(l => ({
    name: l.name,
    count: l.users.length
  })).filter(l => l.count > 0);

  // Assets by Category
  const assets = await prisma.item.findMany({ include: { category: true } });
  const assetMap: Record<string, number> = {};
  assets.forEach(a => {
    const catName = a.category?.name || 'Uncategorized';
    assetMap[catName] = (assetMap[catName] || 0) + 1;
  });
  const assetsByCategory = Object.keys(assetMap).map(k => ({ name: k, value: assetMap[k] }));

  // Subscription Spend by Vendor
  const subs = await prisma.subscription.findMany({ where: { status: 'ACTIVE' } });
  const vendorMap: Record<string, number> = {};
  subs.forEach(s => {
    let cost = Number(s.cost);
    if (s.billingFrequency === 'YEARLY') cost = cost / 12;
    if (s.billingFrequency === 'QUARTERLY') cost = cost / 3;
    if (s.billingFrequency === 'HALF_YEARLY') cost = cost / 6;
    vendorMap[s.vendor] = (vendorMap[s.vendor] || 0) + cost;
  });
  const spendByVendor = Object.keys(vendorMap).map(k => ({ name: k, spend: Math.round(vendorMap[k]) }))
    .sort((a,b) => b.spend - a.spend).slice(0, 5); // top 5

  res.json({
    employeesByBranch,
    assetsByCategory,
    spendByVendor
  });
}));

export default router;
