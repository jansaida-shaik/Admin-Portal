require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const showcaseNumbers = [
  {
    number: '9000100101',
    provider: 'Jio',
    planDetails: 'Showcase 5G Demo',
    status: 'ASSIGNED',
    assignedTo: 'Demo Pool - Jio',
    isDummy: true,
  },
  {
    number: '9000100102',
    provider: 'Jio',
    planDetails: 'Showcase 5G Demo',
    status: 'AVAILABLE',
    assignedTo: null,
    isDummy: true,
  },
  {
    number: '9000100201',
    provider: 'BSNL',
    planDetails: 'Showcase Voice + Data Demo',
    status: 'ASSIGNED',
    assignedTo: 'Demo Pool - BSNL',
    isDummy: true,
  },
  {
    number: '9000100202',
    provider: 'BSNL',
    planDetails: 'Showcase Voice + Data Demo',
    status: 'AVAILABLE',
    assignedTo: null,
    isDummy: true,
  },
];

async function main() {
  console.log('Adding showcase Jio and BSNL dummy numbers...');

  for (const record of showcaseNumbers) {
    await prisma.mobileNumber.upsert({
      where: { number: record.number },
      update: {
        provider: record.provider,
        planDetails: record.planDetails,
        status: record.status,
        assignedTo: record.assignedTo,
        assignedAt: record.assignedTo ? new Date() : null,
        isDummy: true,
      },
      create: {
        ...record,
        assignedAt: record.assignedTo ? new Date() : null,
      },
    });

    console.log(`- ${record.provider}: ${record.number} (${record.status})`);
  }

  const providerCounts = await prisma.mobileNumber.groupBy({
    by: ['provider'],
    _count: { provider: true },
    where: {
      provider: {
        in: ['Jio', 'BSNL'],
      },
    },
    orderBy: {
      provider: 'asc',
    },
  });

  console.log('Current Jio/BSNL counts:');
  for (const row of providerCounts) {
    console.log(`- ${row.provider}: ${row._count.provider}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
