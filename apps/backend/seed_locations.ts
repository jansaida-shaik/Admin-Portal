import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Master Locations...');

  const locationsToSeed = [
    // Hyderabad
    { name: '1st Campus (JNTU-HYD)', city: 'Hyderabad', isMaster: true },
    { name: '2nd Campus (JNTU-HYD)', city: 'Hyderabad', isMaster: true },
    { name: '3rd Campus (Pista House-HYD)', city: 'Hyderabad', isMaster: true },
    { name: '4th Campus (Vasanth Nagar-HYD)', city: 'Hyderabad', isMaster: true },
    { name: '5th Campus (Chaitanya-HYD)', city: 'Hyderabad', isMaster: true },
    { name: '6th Campus (Placement-HYD)', city: 'Hyderabad', isMaster: true },
    { name: '7th Campus (Mock Interview-HYD)', city: 'Hyderabad', isMaster: true },

    // Vijayawada
    { name: '1st Campus (Main-VIJ)', city: 'Vijayawada', isMaster: true },
    { name: '2nd Campus (Java-VIJ)', city: 'Vijayawada', isMaster: true },
    { name: '3rd Campus (Studio-VIJ)', city: 'Vijayawada', isMaster: true },
    { name: '4th Campus (Modern-VIJ)', city: 'Vijayawada', isMaster: true },
    { name: '5th Campus (Hostel-VIJ)', city: 'Vijayawada', isMaster: true },

    // Visakhapatnam
    { name: '1st Campus (Main-VSP)', city: 'Visakhapatnam', isMaster: true }
  ];

  // Clear old locations
  await prisma.location.deleteMany();

  for (const loc of locationsToSeed) {
    const existing = await prisma.location.findFirst({
      where: { name: loc.name, city: loc.city }
    });

    if (!existing) {
      await prisma.location.create({ data: loc });
    }
  }

  console.log('Master Locations Seeded!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
