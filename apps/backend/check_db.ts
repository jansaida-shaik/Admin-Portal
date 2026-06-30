import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

async function check() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  
  try {
    const uc = await prisma.user.count();
    const ic = await prisma.item.count();
    const vc = await prisma.vendor.count();
    const mc = await prisma.mobileNumber.count();
    console.log('DB_CHECK_RESULTS:', { users: uc, items: ic, vendors: vc, mobiles: mc });
  } catch (err) {
    console.error('DB_ERROR:', err);
  }
}

check();
