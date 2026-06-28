require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const STRICT_LOCATIONS = ['Vijayawada', 'Hyderabad', 'Visakhapatnam'];

async function main() {
  console.log("🛡️ Initiating Refined Strict Location Enclosure...");

  // 1. Ensure core locations exist
  const locMap = {};
  for (const name of STRICT_LOCATIONS) {
    const loc = await prisma.location.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    locMap[name] = loc.id;
    console.log(`✅ Verified Location: "${name}" [ID: ${loc.id}]`);
  }

  // 2. Fetch all locations
  const allLocations = await prisma.location.findMany();
  const unwanted = allLocations.filter(l => !STRICT_LOCATIONS.includes(l.name));
  
  console.log(`📊 Unwanted locations to purge: ${unwanted.length}`);

  for (const target of unwanted) {
    let targetName = 'Vijayawada';
    const upper = target.name.toUpperCase();
    if (upper.includes('HYD') || upper.includes('HYDERABAD')) targetName = 'Hyderabad';
    else if (upper.includes('BZA') || upper.includes('VIJAYAWADA')) targetName = 'Vijayawada';
    else if (upper.includes('VSKP') || upper.includes('VISAKHAPATNAM')) targetName = 'Visakhapatnam';

    const finalLocId = locMap[targetName];
    console.log(`👉 Migrating "${target.name}" references to official branch "${targetName}" [ID: ${finalLocId}]...`);

    // A. Move Internet Bills (Safe updateMany)
    await prisma.internetBill.updateMany({
      where: { locationId: target.id },
      data: { locationId: finalLocId }
    });

    // B. MOVE STOCKS IN AN INTELLIGENT MERGE-LOOP to prevent Unique Constraint violation!
    const targetStocks = await prisma.stock.findMany({ where: { locationId: target.id } });
    for (const oldStock of targetStocks) {
      // Check if final branch ALREADY has stock for this item
      const existingFinalStock = await prisma.stock.findFirst({
        where: { itemId: oldStock.itemId, locationId: finalLocId }
      });

      if (existingFinalStock) {
        // Merge quantities!
        await prisma.stock.update({
          where: { id: existingFinalStock.id },
          data: { quantity: existingFinalStock.quantity + oldStock.quantity }
        });
        // Delete the legacy stock
        await prisma.stock.delete({ where: { id: oldStock.id } });
        console.log(`   Merged ${oldStock.quantity} units of Item ID ${oldStock.itemId} into ${targetName}`);
      } else {
        // Just relocate the single stock record
        await prisma.stock.update({
          where: { id: oldStock.id },
          data: { locationId: finalLocId }
        });
      }
    }

    // C. Move Item Assignments (Safe updateMany)
    await prisma.assignment.updateMany({
      where: { locationId: target.id },
      data: { locationId: finalLocId }
    });

    // D. Move Transactions (Safe updateMany)
    await prisma.transaction.updateMany({
      where: { fromLocationId: target.id },
      data: { fromLocationId: finalLocId }
    });
    await prisma.transaction.updateMany({
      where: { toLocationId: target.id },
      data: { toLocationId: finalLocId }
    });

    // 3. Safe Purge
    await prisma.location.delete({ where: { id: target.id } });
    console.log(`🗑️ Purged legacy record: "${target.name}"`);
  }

  console.log("\n🎉 All strict migrations completed perfectly!");
}

main()
  .catch(e => console.error("Enclosure error:", e))
  .finally(() => prisma.$disconnect());
