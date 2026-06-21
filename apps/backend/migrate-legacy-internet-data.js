require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔧 Initializing Internet Bills Legacy Content Restoration...");

  const bills = await prisma.internetBill.findMany();
  console.log(`📋 Analyzing ${bills.length} active corporate internet connections...`);

  let migratedCount = 0;

  for (const bill of bills) {
    let needsUpdate = false;
    let updatedSpeed = bill.speed;
    let updatedPlan = bill.planDetails;

    // 1. Scan planDetails for numeric speed indicators!
    if (bill.planDetails && !['Retail', 'SME', 'ILL'].includes(bill.planDetails)) {
      const speedMatch = bill.planDetails.match(/(\d+)\s*(Mbps|Gbps|M|G)?/i);
      if (speedMatch) {
        const parsedSpeed = parseInt(speedMatch[1]);
        if (!isNaN(parsedSpeed)) {
          updatedSpeed = parsedSpeed;
          console.log(`⚡ Extracted speed ${parsedSpeed} Mbps from legacy planDetails "${bill.planDetails}" for connection: ${bill.provider}`);
        }
      }
      // Normalize to valid dropdown value!
      updatedPlan = 'Retail';
      needsUpdate = true;
    }

    // 2. Heal recently cleared/nullified calendar dates
    let updatedDueDate = bill.dueDate;
    if (!bill.dueDate) {
      // Initialize to 15th of this month/year as a clean baseline
      const now = new Date();
      updatedDueDate = new Date(now.getFullYear(), now.getMonth(), 15);
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.internetBill.update({
        where: { id: bill.id },
        data: {
          speed: updatedSpeed,
          planDetails: updatedPlan,
          dueDate: updatedDueDate
        }
      });
      migratedCount++;
    }
  }

  console.log(`\n🎉 Heal complete! Refined and migrated ${migratedCount} legacy records successfully.`);
}

main()
  .catch(e => console.error("Migration Error:", e))
  .finally(() => prisma.$disconnect());
