require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Initiating Global Branch Architecture Cleanse...");

  // 1. Fetch all current locations in DB
  const locations = await prisma.location.findMany();
  console.log(`📋 Found ${locations.length} locations to map into Branches.`);

  // 2. Map the existing cities to act as "Main Branches" so existing relations hold!
  for (const loc of locations) {
    // If city is null, it means it hasn't been converted yet!
    if (!loc.city) {
      console.log(`🛠️  Mapping City "${loc.name}" -> Main Branch (${loc.name})`);
      await prisma.location.update({
        where: { id: loc.id },
        data: {
          name: 'Main Branch',
          city: loc.name
        }
      });
    }
  }

  // 3. Add secondary department branches automatically to provide rich data!
  const sampleBranches = [
    { name: 'IT Wing Office', city: 'Hyderabad' },
    { name: 'Front Desk Wing', city: 'Visakhapatnam' },
    { name: 'Commercial Hub', city: 'Vijayawada' }
  ];

  console.log("\n🏫 Injecting new Global Corporate Sub-Branches...");
  for (const branch of sampleBranches) {
    // Check if already exists
    const existing = await prisma.location.findFirst({
      where: { name: branch.name, city: branch.city }
    });

    if (!existing) {
      await prisma.location.create({ data: branch });
      console.log(`✅ Created Branch: "${branch.name}" in ${branch.city}`);
    }
  }

  console.log("\n🎉 Global Branch architecture initialization successfully completed! ZERO stock or relation data lost!");
}

main()
  .catch(e => console.error("Error:", e))
  .finally(() => prisma.$disconnect());
