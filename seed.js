const { PrismaClient } = require('./apps/backend/node_modules/@prisma/client');
const prisma = new PrismaClient({});

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
  }
}
seed();
