require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔄 Seeding Next Recharge Dates...");
  
  const mobiles = await prisma.mobileNumber.findMany({ take: 5 });
  
  for (let i = 0; i < mobiles.length; i++) {
    const mob = mobiles[i];
    const futureDays = (i + 1) * 8; // spread dates out 8, 16, 24 days from now
    const futureDate = new Date(Date.now() + futureDays * 24 * 60 * 60 * 1000);
    
    await prisma.mobileNumber.update({
      where: { id: mob.id },
      data: { nextRechargeDate: futureDate }
    });
    console.log(`✅ Set next recharge for ${mob.number} to ${futureDate.toDateString()}`);
  }
  console.log("🎉 Done seeding next recharge dates!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
