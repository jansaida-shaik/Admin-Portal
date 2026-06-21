require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const vendorNames = [
  'ATRIA CONVERGENCE TECHNOLOGIES LIMITED',
  'RELIANCE JIO INFOCOMM LIMITED',
  'JIO PLATFORMS LIMITED',
  'BHARTI AIRTEL LIMITED',
  'BHARTI AIRTEL LIMITED-TG',
  'EXCELL MEDIA PVT LTD',
  'M/S KRISHNA COMPUTER PERIPHERALS',
  'ATRIA CONVERGENCE TECHNOLOGIES LTD',
  'FUTURIQ SYSTEMS PRIVATE LIMITED',
  'KUMAR ELECTRONICS'
];

async function main() {
  console.log('Importing ISP/IT vendors from ledger to Vendors module...');
  let addedCount = 0;

  for (const name of vendorNames) {
    // Prisma Upsert will safely insert if it doesn't exist, and leave alone if it does!
    await prisma.vendor.upsert({
      where: { name },
      update: {}, // No change needed if existing
      create: {
        name,
        contact: 'ISP/Internet Service Provider'
      }
    });
    addedCount++;
  }

  console.log(`✅ Done! Successfully ensured ${addedCount} ISP/IT vendors exist in the database!`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
