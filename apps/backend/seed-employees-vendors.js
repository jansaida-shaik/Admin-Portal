require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed process...');

  // 1. Process Mobile Numbers and Employees
  const mobileNumbers = await prisma.mobileNumber.findMany({
    where: { assignedTo: { not: null } }
  });

  console.log(`Found ${mobileNumbers.length} mobile numbers with an assigned user.`);

  // Get unique assignedTo strings
  const uniqueNames = [...new Set(mobileNumbers.map(m => m.assignedTo))];
  console.log(`Found ${uniqueNames.length} unique employee names to reconcile.`);

  for (const name of uniqueNames) {
    const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@codegnan.com`;
    
    // Check if user exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: name },
          { email: email }
        ]
      }
    });

    if (!user) {
      console.log(`Creating user: ${name}`);
      user = await prisma.user.create({
        data: {
          name: name,
          email: email,
          role: 'STAFF',
        }
      });
    }

    // Link mobile numbers to this user
    await prisma.mobileNumber.updateMany({
      where: { assignedTo: name },
      data: { userId: user.id }
    });
  }

  console.log('Finished reconciling employees and linking mobile numbers.');

  // 2. Add Vendors
  const vendorsToAdd = [
    { name: 'Matrix Edge Computers HQ', contact: 'Jaya Sri' },
    { name: 'Apple Inc.', contact: 'enterprise@apple.com' },
    { name: 'Dell Technologies', contact: 'sales.india@dell.com' },
    { name: 'IKEA Corporate', contact: 'business@ikea.in' },
    { name: 'HP Enterprise', contact: 'b2b@hp.com' }
  ];

  console.log('Seeding Vendors...');
  for (const v of vendorsToAdd) {
    const existing = await prisma.vendor.findUnique({
      where: { name: v.name }
    });

    if (!existing) {
      await prisma.vendor.create({
        data: {
          name: v.name,
          contact: v.contact
        }
      });
      console.log(`Created vendor: ${v.name}`);
    }
  }

  console.log('Seed complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
