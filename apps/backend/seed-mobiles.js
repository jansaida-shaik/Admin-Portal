require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const allNumbers = [
  { number: '8977544081', provider: 'Airtel', assignedTo: 'Kranthi Kumar', status: 'ASSIGNED' },
  { number: '8977544085', provider: 'Airtel', assignedTo: 'Pooja', status: 'ASSIGNED' },
  { number: '8977544083', provider: 'Airtel', assignedTo: 'Anusha', status: 'ASSIGNED' },
  { number: '8977544086', provider: 'Airtel', assignedTo: 'Sowmya', status: 'ASSIGNED' },
  { number: '8977544082', provider: 'Airtel', assignedTo: 'Siva Ram', status: 'ASSIGNED' },
  { number: '8977544087', provider: 'Airtel', assignedTo: 'Vijay Lakshmi - Front Office Hyd', status: 'ASSIGNED' },
  { number: '8977544084', provider: 'Airtel', assignedTo: 'Monika - Vijayawada Sales', status: 'ASSIGNED' },
  { number: '8977544080', provider: 'Airtel', assignedTo: 'Shireesha - Sales Hyd', status: 'ASSIGNED' },
  { number: '8977533094', provider: 'Airtel', assignedTo: 'SaiKalyan - Marketing', status: 'ASSIGNED' },
  { number: '8977544098', provider: 'Airtel', assignedTo: 'Mounika - BDE Hyd', status: 'ASSIGNED' },
  { number: '8977544095', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '8977544091', provider: 'Airtel', assignedTo: 'Sravani - Telecaller Hyd', status: 'ASSIGNED' },
  { number: '8977544094', provider: 'Airtel', assignedTo: 'Ambica', status: 'ASSIGNED' },
  { number: '8977544092', provider: 'Airtel', assignedTo: 'Prakash - Sales Head', status: 'ASSIGNED' },
  { number: '8977544090', provider: 'Airtel', assignedTo: 'Datta Yadav', status: 'ASSIGNED' },
  { number: '8977544097', provider: 'Airtel', assignedTo: 'Vasavee Kone - Vizag Manager', status: 'ASSIGNED' },
  { number: '8977533093', provider: 'Airtel', assignedTo: 'Frontdesk Vijayawada', status: 'ASSIGNED' },
  { number: '8977533095', provider: 'Airtel', assignedTo: 'Maruthi - Sales', status: 'ASSIGNED' },
  { number: '8977544093', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '8977544170', provider: 'Airtel', assignedTo: 'Anadh - Java Trainer', status: 'ASSIGNED' },
  { number: '8977544180', provider: 'Airtel', assignedTo: 'Kiran - Aptitude Trainer', status: 'ASSIGNED' },
  { number: '8977544136', provider: 'Airtel', assignedTo: 'Madhav - Sales Director', status: 'ASSIGNED' },
  { number: '8977544154', provider: 'Airtel', assignedTo: 'Bharath - Soft Skills', status: 'ASSIGNED' },
  { number: '8977544162', provider: 'Airtel', assignedTo: 'Mallkharjun - Java Trainer Hyd', status: 'ASSIGNED' },
  { number: '8977544167', provider: 'Airtel', assignedTo: 'Sudeep - CR', status: 'ASSIGNED' },
  { number: '8977544187', provider: 'Airtel', assignedTo: 'Vasavi - Chatbots', status: 'ASSIGNED' },
  { number: '8977544158', provider: 'Airtel', assignedTo: 'PM Lakshmi', status: 'ASSIGNED' },
  { number: '8977544182', provider: 'Airtel', assignedTo: 'Praneeth - Office', status: 'ASSIGNED' },
  { number: '9966188862', provider: 'Airtel', assignedTo: 'Chat Race (Maruthi)', status: 'ASSIGNED' },
  { number: '9966188853', provider: 'Airtel', assignedTo: 'With Praneeth', status: 'ASSIGNED' },
  { number: '9966188863', provider: 'Airtel', assignedTo: 'Shiva - Sales Hyd', status: 'ASSIGNED' },
  { number: '9010555952', provider: 'Airtel', assignedTo: 'Anush', status: 'ASSIGNED' },
  { number: '9912006777', provider: 'Airtel', assignedTo: 'Saketh Sir', status: 'ASSIGNED' },
  { number: '8977900330', provider: 'Airtel', assignedTo: 'Manohar - Program Manager Hyd', status: 'ASSIGNED' },
  { number: '8977900443', provider: 'Airtel', assignedTo: 'Vasantha - Program Manager Vij', status: 'ASSIGNED' },
  { number: '8977900886', provider: 'Airtel', assignedTo: 'Rithisha - PC', status: 'ASSIGNED' },
  { number: '7416368866', provider: 'Airtel', assignedTo: 'Sri Latha - Soft Skills', status: 'ASSIGNED' },
  { number: '8977575710', provider: 'Airtel', assignedTo: 'Ujwala - HR Executive', status: 'ASSIGNED' },
  { number: '8977544143', provider: 'Airtel', assignedTo: 'Anusree - PM', status: 'ASSIGNED' },
  { number: '8977575704', provider: 'Airtel', assignedTo: 'Basha - Soft Skills', status: 'ASSIGNED' },
  { number: '8977544548', provider: 'Airtel', assignedTo: 'Sharief', status: 'ASSIGNED' },
  { number: '6301341478', provider: 'Airtel', assignedTo: 'Vijayawada Office', status: 'ASSIGNED' },
  { number: '8341488448', provider: 'Airtel', assignedTo: 'Krishna Menon Sir - Corporate Relations', status: 'ASSIGNED' },
  { number: '9966188873', provider: 'Airtel', assignedTo: 'Puneet', status: 'ASSIGNED' },
  { number: '9493851133', provider: 'Airtel', assignedTo: 'Sravani - Vij Sales', status: 'ASSIGNED' },
  { number: '7995569898', provider: 'Airtel', assignedTo: 'Anusha - Frontdesk Hyd', status: 'ASSIGNED' },
  { number: '7995579898', provider: 'Airtel', assignedTo: 'Jahnavi - Senior CR', status: 'ASSIGNED' },
  { number: '7842018181', provider: 'Airtel', assignedTo: 'Sushmitha - Vij Frontdesk', status: 'ASSIGNED' },
  { number: '7842016688', provider: 'Airtel', assignedTo: 'Corporate Relations', status: 'ASSIGNED' },
  { number: '9642988788', provider: 'Airtel', assignedTo: 'Sai Venkat Pavan - Sales Hyd', status: 'ASSIGNED' },
  { number: '9966188851', provider: 'Airtel', assignedTo: 'Sowmya - Vizag', status: 'ASSIGNED' },
  { number: '9966188816', provider: 'Airtel', assignedTo: 'Sowjanya', status: 'ASSIGNED' },
  { number: '9966188860', provider: 'Airtel', assignedTo: 'BDE Narendra - Vijayawada', status: 'ASSIGNED' },
  { number: '7842371133', provider: 'Airtel', assignedTo: 'Mourya', status: 'ASSIGNED' },
  { number: '7842371515', provider: 'Airtel', assignedTo: 'Hyd Banner - Inbound Team', status: 'ASSIGNED' },
  { number: '7842565577', provider: 'Airtel', assignedTo: 'Vizag Front Office', status: 'ASSIGNED' },
  { number: '7842565588', provider: 'Airtel', assignedTo: 'Deepika - TAS', status: 'ASSIGNED' },
  { number: '7842574646', provider: 'Airtel', assignedTo: 'Deepali', status: 'ASSIGNED' },
  { number: '8977544715', provider: 'Airtel', assignedTo: 'Vijayawada Front Desk - Sudheer Sandra', status: 'ASSIGNED' },
  { number: '8977544703', provider: 'Airtel', assignedTo: 'Tele Caller Vijayawada', status: 'ASSIGNED' },
  { number: '8977711263', provider: 'Airtel', assignedTo: 'Sreya - PC', status: 'ASSIGNED' },
  { number: '8977711271', provider: 'Airtel', assignedTo: 'Shashank', status: 'ASSIGNED' },
  { number: '8977711272', provider: 'Airtel', assignedTo: 'Jahnavi Golamaru - PC', status: 'ASSIGNED' },
  { number: '8977711273', provider: 'Airtel', assignedTo: 'Vinitha - Hyd', status: 'ASSIGNED' },
  { number: '8977711274', provider: 'Airtel', assignedTo: 'Hyd Office', status: 'ASSIGNED' },
  { number: '8977711275', provider: 'Airtel', assignedTo: 'Raja Sri', status: 'ASSIGNED' },
  { number: '8977711276', provider: 'Airtel', assignedTo: 'Usha - CR', status: 'ASSIGNED' },
  { number: '8977711278', provider: 'Airtel', assignedTo: 'Vyshnavi', status: 'ASSIGNED' },
  { number: '8977711296', provider: 'Airtel', assignedTo: 'Kavitha - Placement Team Hyd', status: 'ASSIGNED' },
  { number: '8977711297', provider: 'Airtel', assignedTo: 'Madhu - Hyd Admin', status: 'ASSIGNED' },
  { number: '8977745451', provider: 'Airtel', assignedTo: 'Hostel', status: 'ASSIGNED' },
  { number: '8977745452', provider: 'Airtel', assignedTo: 'Hostel', status: 'ASSIGNED' },
  { number: '8977745457', provider: 'Airtel', assignedTo: 'M Srinivas - Telecalling BZA Main Branch', status: 'ASSIGNED' },
  { number: '8977745458', provider: 'Airtel', assignedTo: 'Deepika - Program Coordinator', status: 'ASSIGNED' },
  { number: '7731066888', provider: 'Airtel', assignedTo: 'Marketing', status: 'ASSIGNED' },
  { number: '9966188806', provider: 'Airtel', assignedTo: 'Phanindra - Sales', status: 'ASSIGNED' },
  { number: '9966188854', provider: 'Airtel', assignedTo: 'Naveen - Sales Vijayawada', status: 'ASSIGNED' },
  { number: '7842178181', provider: 'Airtel', assignedTo: 'Abhilash - CR', status: 'ASSIGNED' },
  { number: '8977729799', provider: 'Airtel', assignedTo: 'Vizag PM', status: 'ASSIGNED' },
  { number: '8977731135', provider: 'Airtel', assignedTo: 'Padma Sri - Hyd WFH', status: 'ASSIGNED' },
  { number: '8977731987', provider: 'Airtel', assignedTo: 'Mohammad Tofeequ - TAS', status: 'ASSIGNED' },
  { number: '8977733828', provider: 'Airtel', assignedTo: 'Anusha - Telecaller Hyd', status: 'ASSIGNED' },
  { number: '8977733931', provider: 'Airtel', assignedTo: 'Deva Anil', status: 'ASSIGNED' },
  { number: '8977734019', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '8977771886', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '8977772464', provider: 'Airtel', assignedTo: 'Vinay - Sales Vizag', status: 'ASSIGNED' },
  { number: '7731066999', provider: 'Airtel', assignedTo: 'Marketing', status: 'ASSIGNED' },
  { number: '7730911666', provider: 'Airtel', assignedTo: 'Parents Meet', status: 'ASSIGNED' },
  { number: '7730911777', provider: 'Airtel', assignedTo: 'Parents Meet', status: 'ASSIGNED' },
  { number: '9966188826', provider: 'Airtel', assignedTo: 'Darhas - BDE Vijayawada', status: 'ASSIGNED' },
  { number: '8977542037', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '8977542045', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '8977542053', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '8977542061', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '8977542075', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '8977542338', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '8977542364', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '8977542384', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '8977542390', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '8977542518', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '8977542590', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '8977542591', provider: 'Airtel', assignedTo: null, status: 'AVAILABLE' },
  { number: '9642988688', provider: 'Idea', assignedTo: 'Pushpa - Front Desk Vij', status: 'ASSIGNED' },
  { number: '9912005777', provider: 'Idea', assignedTo: 'Jaya Sree', status: 'ASSIGNED' },
  { number: '9052555952', provider: 'Idea', assignedTo: 'Sai Ram Sir - Proof', status: 'ASSIGNED' },
  { number: '9966188852', provider: 'Idea', assignedTo: 'Aisensy (With Maruthi)', status: 'ASSIGNED' },
  { number: '9951555957', provider: 'Idea', assignedTo: 'Sai Ram Sir - Proof', status: 'ASSIGNED' },
  { number: '9966188839', provider: 'Idea', planDetails: 'Corporate plan', assignedTo: 'Sravani PM Vijayawada', status: 'ASSIGNED' },
  { number: '9966992587', provider: 'Idea', planDetails: 'Corporate plan', assignedTo: 'Vizag Front Office', status: 'ASSIGNED' },
  { number: '9966992597', provider: 'Idea', planDetails: 'Corporate plan', assignedTo: 'Vizag Front Office', status: 'ASSIGNED' },
];

async function main() {
  console.log(`🌱 Seeding ${allNumbers.length} mobile numbers...`);
  // Clear existing
  await prisma.mobileNumber.deleteMany({});
  // Reset sequence
  await prisma.$executeRawUnsafe(`ALTER SEQUENCE "MobileNumber_id_seq" RESTART WITH 900000000000000001`);
  
  let i = 0;
  for (const n of allNumbers) {
    await prisma.mobileNumber.create({
      data: {
        number: n.number,
        provider: n.provider || null,
        planDetails: n.planDetails || null,
        status: n.status,
        assignedTo: n.assignedTo || null,
        assignedAt: n.assignedTo ? new Date() : null,
      }
    });
    i++;
  }
  console.log(`✅ ${i} mobile numbers seeded`);
}

main().catch(e => { console.error(e.message); process.exit(1); }).finally(() => prisma.$disconnect());
