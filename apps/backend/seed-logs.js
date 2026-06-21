require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🛠️ Starting enterprise lifecycle audit seeder...");

  // 1. Fetch some items
  const items = await prisma.item.findMany({ take: 5 });
  if (items.length > 0) {
    console.log(`Found ${items.length} items to seed repair history...`);
    for (const item of items) {
      // Check if repairs already exist
      const existingRepairs = await prisma.repairHistory.count({ where: { itemId: item.id } });
      if (existingRepairs === 0) {
        await prisma.repairHistory.createMany({
          data: [
            {
              itemId: item.id,
              repairDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
              cost: 1500.00,
              description: "Screen flicker servicing & cable replacement",
              vendorName: "Apple Care Guntur",
              status: "COMPLETED"
            },
            {
              itemId: item.id,
              repairDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
              cost: 800.00,
              description: "General physical maintenance & dust removal",
              vendorName: "Internal IT Support",
              status: "COMPLETED"
            }
          ]
        });
        console.log(`✅ Seeded 2 repair logs for item: ${item.name}`);
      }
    }
  }

  // 2. Fetch some mobile numbers
  const mobiles = await prisma.mobileNumber.findMany({ take: 5, include: { user: true } });
  if (mobiles.length > 0) {
    console.log(`Found ${mobiles.length} SIM cards to seed handovers and recharges...`);
    for (const mob of mobiles) {
      // A. Seed recharges
      const existingRecharges = await prisma.mobileRecharge.count({ where: { mobileId: mob.id } });
      if (existingRecharges === 0) {
        await prisma.mobileRecharge.createMany({
          data: [
            {
              mobileId: mob.id,
              rechargeDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
              amount: 749.00,
              planDetails: "Unlimited Call + 2GB/day (84 Days)"
            },
            {
              mobileId: mob.id,
              rechargeDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
              amount: 699.00,
              planDetails: "Standard Corporate Unlimited Plan"
            }
          ]
        });
        console.log(`✅ Seeded 2 recharge payments for SIM: ${mob.number}`);
      }

      // B. Seed assignments history
      const existingAssignments = await prisma.mobileAssignment.count({ where: { mobileId: mob.id } });
      if (existingAssignments === 0) {
        // We'll create a historical returned assignment, and an active one if applicable
        const data = [
          {
            mobileId: mob.id,
            userId: null,
            assignedTo: "Arthi Sri (Sales Dep)",
            assignedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            returnedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            status: "RETURNED"
          }
        ];

        if (mob.userId) {
          data.push({
            mobileId: mob.id,
            userId: mob.userId,
            assignedTo: mob.user?.name || mob.assignedTo,
            assignedAt: new Date(Date.now() - 89 * 24 * 60 * 60 * 1000),
            returnedAt: null,
            status: "ACTIVE"
          });
        }

        await prisma.mobileAssignment.createMany({ data });
        console.log(`✅ Seeded assignments history journal for SIM: ${mob.number}`);
      }
    }
  }

  console.log("🎉 Enterprise audit trail seeding completed successfully!");
}

main()
  .catch(e => {
    console.error("Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
