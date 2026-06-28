const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  try {
    const user = await prisma.user.upsert({
      where: { email: 'jansaida@codegnan.com' },
      update: { password: 'Codegnan@2026', role: 'ADMIN' },
      create: {
        name: 'Jan Saida',
        email: 'jansaida@codegnan.com',
        password: 'Codegnan@2026',
        role: 'ADMIN'
      }
    });
    console.log('Seed successful:', user);
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
seed();
