require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const locIdStr = '400000000000000003';

async function main() {
  const targetId = BigInt(locIdStr);
  console.log(`Analyzing dependent records for Location ID: ${targetId}...\n`);

  const location = await prisma.location.findUnique({ where: { id: targetId } });
  const stocks = await prisma.stock.count({ where: { locationId: targetId } });
  const assignments = await prisma.assignment.count({ where: { locationId: targetId } });
  const transactionsFrom = await prisma.transaction.count({ where: { fromLocationId: targetId } });
  const transactionsTo = await prisma.transaction.count({ where: { toLocationId: targetId } });
  const bills = await prisma.internetBill.count({ where: { locationId: targetId } });


  if (!location) {
    console.log(`❌ Location with ID ${targetId} not found in the database.`);
    return;
  }

  console.log(`📍 Location Name: "${location.name}"`);
  console.log('─'.repeat(40));
  console.log(`📦 Stocks linked:        ${stocks}`);
  console.log(`🧑 Assignments linked:   ${assignments}`);
  console.log(`💸 Transactions (From):  ${transactionsFrom}`);
  console.log(`📥 Transactions (To):    ${transactionsTo}`);
  console.log(`🌐 Internet Bills:       ${bills}`);
  console.log('─'.repeat(40));

  if (stocks + assignments + transactionsFrom + transactionsTo + bills > 0) {
    console.log(`\n🛑 BLOCKED: You cannot delete this location because of these active references.`);
    console.log(`To delete this location, you must first remove or move these linked items!`);
  } else {
    console.log(`\n✅ SAFE: No active references found. Deletion should have succeeded.`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
