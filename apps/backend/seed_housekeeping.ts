import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Housekeeping Dummy Data...');

  // Create Housekeeping Staff (including Office Boys)
  const staffMembers = [
    { name: 'Ramesh (Office Boy)', email: 'ramesh@codegnan.local', department: 'HOUSEKEEPING' },
    { name: 'Suresh (Office Boy)', email: 'suresh@codegnan.local', department: 'HOUSEKEEPING' },
    { name: 'Lakshmi (Cleaner)', email: 'lakshmi@codegnan.local', department: 'HOUSEKEEPING' },
    { name: 'Ravi (Maintenance)', email: 'ravi@codegnan.local', department: 'HOUSEKEEPING' }
  ];

  const location = await prisma.location.findFirst();
  
  const createdUsers = [];
  for (const staff of staffMembers) {
    const user = await prisma.user.upsert({
      where: { email: staff.email },
      update: {},
      create: {
        name: staff.name,
        email: staff.email,
        role: 'STAFF',
        department: staff.department,
        locationId: location?.id
      }
    });
    createdUsers.push(user);
  }

  // Create past 7 days of attendance
  const today = new Date();
  today.setUTCHours(0,0,0,0);
  
  for (const user of createdUsers) {
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const checkInTime = new Date(date);
      checkInTime.setHours(9, Math.floor(Math.random() * 30), 0, 0); // ~9:00 AM
      
      const checkOutTime = new Date(date);
      checkOutTime.setHours(18, Math.floor(Math.random() * 30), 0, 0); // ~6:00 PM
      
      // Randomly make someone absent (10% chance)
      const isAbsent = Math.random() < 0.1;

      await prisma.attendance.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: date
          }
        },
        update: {},
        create: {
          userId: user.id,
          date: date,
          checkIn: isAbsent ? null : checkInTime,
          checkOut: isAbsent ? null : checkOutTime,
          status: isAbsent ? 'ABSENT' : 'PRESENT'
        }
      });
    }

    // Assign some salaries
    await prisma.salary.create({
      data: {
        userId: user.id,
        amount: Math.floor(Math.random() * 5000) + 15000, // 15k-20k
        effectiveDate: new Date(new Date().setMonth(new Date().getMonth() - 1)) // Last month
      }
    });

    // Assign Daily Checklists
    const tasks = ['Clean Lobby', 'Restock Restrooms', 'Empty Trash Bins', 'Serve Tea/Coffee', 'Prepare Meeting Room'];
    for (let i = 0; i < 3; i++) {
      const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
      await prisma.dailyChecklist.create({
        data: {
          userId: user.id,
          date: today,
          task: randomTask,
          isCompleted: Math.random() > 0.5
        }
      });
    }
  }

  console.log('Housekeeping seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
