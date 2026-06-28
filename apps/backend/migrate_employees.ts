require('dotenv').config({ path: './.env' });
const { prisma } = require('./src/prisma');

async function main() {
  console.log('Starting migration to create missing employees...');
  
  // Find all mobile numbers that have an assignedTo string but no userId
  const numbers = await prisma.mobileNumber.findMany({
    where: {
      assignedTo: { not: null, not: '' },
      userId: null
    }
  });
  
  console.log(`Found ${numbers.length} mobile numbers with unlinked assignments.`);
  
  let createdCount = 0;
  let linkedCount = 0;

  for (const mobile of numbers) {
    const rawName = mobile.assignedTo.trim();
    if (!rawName) continue;

    // Check if a user with this name already exists
    let user = await prisma.user.findFirst({
      where: {
        name: { equals: rawName, mode: 'insensitive' }
      }
    });

    if (!user) {
      // Create new user
      // Generate a unique email using the phone number to avoid collisions
      const cleanNumber = mobile.number.replace(/\D/g, '');
      const defaultEmail = `${cleanNumber}@codegnan.com`;
      
      try {
        user = await prisma.user.create({
          data: {
            name: rawName,
            email: defaultEmail,
            role: 'STAFF',
            phone: mobile.number
          }
        });
        console.log(`Created new employee: ${rawName} (${defaultEmail})`);
        createdCount++;
      } catch (err) {
        console.error(`Failed to create user for ${rawName}:`, err.message);
        continue;
      }
    } else {
      console.log(`Found existing employee: ${rawName}`);
    }

    // Link the mobile number to this user
    if (user) {
      await prisma.mobileNumber.update({
        where: { id: mobile.id },
        data: { 
          userId: user.id,
          assignedTo: user.name // Normalize the name
        }
      });
      linkedCount++;
    }
  }

  console.log('--- Migration Complete ---');
  console.log(`Created ${createdCount} new employees.`);
  console.log(`Successfully linked ${linkedCount} mobile numbers to employee profiles.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
