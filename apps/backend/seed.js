require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── Users ────────────────────────────────────────────────────────────────
  console.log('👤 Creating users...');
  const admin  = await prisma.user.upsert({ where: { email: 'jansaida@codegnan.com' }, update: {}, create: { name: 'Jan Saida Shaik', email: 'jansaida@codegnan.com', password: 'Codegnan@2026', role: 'ADMIN' } });
  const staff1 = await prisma.user.upsert({ where: { email: 'ravi.kumar@codegnan.com' }, update: {}, create: { name: 'Ravi Kumar', email: 'ravi.kumar@codegnan.com', password: 'Staff@123', role: 'STAFF' } });
  const staff2 = await prisma.user.upsert({ where: { email: 'priya.reddy@codegnan.com' }, update: {}, create: { name: 'Priya Reddy', email: 'priya.reddy@codegnan.com', password: 'Staff@123', role: 'STAFF' } });
  const staff3 = await prisma.user.upsert({ where: { email: 'suresh.babu@codegnan.com' }, update: {}, create: { name: 'Suresh Babu', email: 'suresh.babu@codegnan.com', password: 'Staff@123', role: 'STAFF' } });
  const staff4 = await prisma.user.upsert({ where: { email: 'anitha.m@codegnan.com' }, update: {}, create: { name: 'Anitha M', email: 'anitha.m@codegnan.com', password: 'Staff@123', role: 'STAFF' } });
  console.log('  ✅ 5 users\n');

  // ─── Categories ───────────────────────────────────────────────────────────
  console.log('📁 Creating categories...');
  const catLaptop     = await prisma.category.upsert({ where: { name: 'Laptops' },     update: {}, create: { name: 'Laptops' } });
  const catDesktop    = await prisma.category.upsert({ where: { name: 'Desktops' },    update: {}, create: { name: 'Desktops' } });
  const catMonitor    = await prisma.category.upsert({ where: { name: 'Monitors' },    update: {}, create: { name: 'Monitors' } });
  const catPrinter    = await prisma.category.upsert({ where: { name: 'Printers' },    update: {}, create: { name: 'Printers' } });
  const catNet        = await prisma.category.upsert({ where: { name: 'Networking' },  update: {}, create: { name: 'Networking' } });
  const catFurniture  = await prisma.category.upsert({ where: { name: 'Furniture' },   update: {}, create: { name: 'Furniture' } });
  const catPeripheral = await prisma.category.upsert({ where: { name: 'Peripherals' }, update: {}, create: { name: 'Peripherals' } });
  const catProjector  = await prisma.category.upsert({ where: { name: 'Projectors' },  update: {}, create: { name: 'Projectors' } });
  console.log('  ✅ 8 categories\n');

  // ─── Vendors ──────────────────────────────────────────────────────────────
  console.log('🏢 Creating vendors...');
  const vDell   = await prisma.vendor.upsert({ where: { name: 'Dell Technologies' }, update: {}, create: { name: 'Dell Technologies', contact: '1800-425-4000' } });
  const vHP     = await prisma.vendor.upsert({ where: { name: 'HP India' },          update: {}, create: { name: 'HP India', contact: '1800-108-4747' } });
  const vLenovo = await prisma.vendor.upsert({ where: { name: 'Lenovo India' },      update: {}, create: { name: 'Lenovo India', contact: '1800-3000-9990' } });
  const vApple  = await prisma.vendor.upsert({ where: { name: 'Apple India' },       update: {}, create: { name: 'Apple India', contact: '1800-4250-744' } });
  const vEpson  = await prisma.vendor.upsert({ where: { name: 'Epson India' },       update: {}, create: { name: 'Epson India', contact: '1860-3000-1341' } });
  const vTPLink = await prisma.vendor.upsert({ where: { name: 'TP-Link India' },     update: {}, create: { name: 'TP-Link India', contact: '1800-8896-688' } });
  console.log('  ✅ 6 vendors\n');

  // ─── Locations ────────────────────────────────────────────────────────────
  console.log('📍 Creating locations...');
  async function getOrCreateLocation(name) {
    const existing = await prisma.location.findFirst({ where: { name } });
    if (existing) return existing;
    return prisma.location.create({ data: { name } });
  }
  const locVJA = await getOrCreateLocation('Vijayawada HQ');
  const locHYD = await getOrCreateLocation('Hyderabad Branch');
  const locGNT = await getOrCreateLocation('Guntur Centre');
  const locBLR = await getOrCreateLocation('Bangalore Office');
  const locCHE = await getOrCreateLocation('Chennai Branch');
  console.log('  ✅ 5 locations\n');

  // ─── Items ────────────────────────────────────────────────────────────────
  console.log('💻 Creating items...');
  const i1  = await prisma.item.create({ data: { name: 'Dell Inspiron 15',         description: 'Core i5 11th Gen, 8GB RAM, 512GB SSD',  categoryId: catLaptop.id,     vendorId: vDell.id } });
  const i2  = await prisma.item.create({ data: { name: 'HP ProBook 440',           description: 'Core i7, 16GB RAM, 1TB SSD',            categoryId: catLaptop.id,     vendorId: vHP.id } });
  const i3  = await prisma.item.create({ data: { name: 'Lenovo ThinkPad E14',      description: 'Ryzen 5, 8GB RAM, 512GB SSD',           categoryId: catLaptop.id,     vendorId: vLenovo.id } });
  const i4  = await prisma.item.create({ data: { name: 'Apple MacBook Air M2',     description: '8-Core CPU, 8GB RAM, 256GB SSD',        categoryId: catLaptop.id,     vendorId: vApple.id } });
  const i5  = await prisma.item.create({ data: { name: 'Dell OptiPlex 3080',       description: 'Core i5, 8GB RAM, 1TB HDD',             categoryId: catDesktop.id,    vendorId: vDell.id } });
  const i6  = await prisma.item.create({ data: { name: 'HP EliteDesk 800',         description: 'Core i7, 16GB RAM, 512GB SSD',          categoryId: catDesktop.id,    vendorId: vHP.id } });
  const i7  = await prisma.item.create({ data: { name: 'Dell 24" Monitor P2422H',  description: 'Full HD IPS, 60Hz',                     categoryId: catMonitor.id,    vendorId: vDell.id } });
  const i8  = await prisma.item.create({ data: { name: 'HP 27" Monitor V27i',      description: 'Full HD IPS, 75Hz',                     categoryId: catMonitor.id,    vendorId: vHP.id } });
  const i9  = await prisma.item.create({ data: { name: 'Epson L3210 Printer',      description: 'All-in-one ink tank printer',           categoryId: catPrinter.id,    vendorId: vEpson.id } });
  const i10 = await prisma.item.create({ data: { name: 'HP LaserJet M110w',        description: 'Mono laser printer, WiFi',              categoryId: catPrinter.id,    vendorId: vHP.id } });
  const i11 = await prisma.item.create({ data: { name: 'TP-Link TL-WR940N Router', description: '450Mbps WiFi Router',                   categoryId: catNet.id,        vendorId: vTPLink.id } });
  const i12 = await prisma.item.create({ data: { name: 'TP-Link 8-Port Switch',    description: 'Gigabit unmanaged switch',              categoryId: catNet.id,        vendorId: vTPLink.id } });
  const i13 = await prisma.item.create({ data: { name: 'Executive Office Chair',   description: 'High-back ergonomic chair',             categoryId: catFurniture.id,  vendorId: null } });
  const i14 = await prisma.item.create({ data: { name: 'Standing Desk 140cm',      description: 'Height adjustable desk',                categoryId: catFurniture.id,  vendorId: null } });
  const i15 = await prisma.item.create({ data: { name: 'Logitech MK345 Combo',     description: 'Wireless Mouse & Keyboard',             categoryId: catPeripheral.id, vendorId: null } });
  const i16 = await prisma.item.create({ data: { name: 'USB-C Hub 7-in-1',         description: 'HDMI, USB 3.0, SD Card reader',         categoryId: catPeripheral.id, vendorId: null } });
  const i17 = await prisma.item.create({ data: { name: 'Epson EB-X51 Projector',   description: 'XGA 3800 Lumens',                       categoryId: catProjector.id,  vendorId: vEpson.id } });
  console.log('  ✅ 17 items\n');

  // ─── Stocks ───────────────────────────────────────────────────────────────
  console.log('📦 Creating stocks...');
  const stockEntries = [
    { itemId: i1.id,  locationId: locVJA.id, quantity: 10 },
    { itemId: i1.id,  locationId: locHYD.id, quantity: 5 },
    { itemId: i2.id,  locationId: locVJA.id, quantity: 8 },
    { itemId: i3.id,  locationId: locVJA.id, quantity: 6 },
    { itemId: i3.id,  locationId: locGNT.id, quantity: 3 },
    { itemId: i4.id,  locationId: locVJA.id, quantity: 4 },
    { itemId: i5.id,  locationId: locVJA.id, quantity: 12 },
    { itemId: i5.id,  locationId: locBLR.id, quantity: 4 },
    { itemId: i6.id,  locationId: locHYD.id, quantity: 7 },
    { itemId: i7.id,  locationId: locVJA.id, quantity: 20 },
    { itemId: i7.id,  locationId: locHYD.id, quantity: 10 },
    { itemId: i8.id,  locationId: locGNT.id, quantity: 6 },
    { itemId: i9.id,  locationId: locVJA.id, quantity: 3 },
    { itemId: i10.id, locationId: locHYD.id, quantity: 2 },
    { itemId: i11.id, locationId: locVJA.id, quantity: 5 },
    { itemId: i11.id, locationId: locHYD.id, quantity: 3 },
    { itemId: i12.id, locationId: locVJA.id, quantity: 8 },
    { itemId: i13.id, locationId: locVJA.id, quantity: 30 },
    { itemId: i13.id, locationId: locHYD.id, quantity: 15 },
    { itemId: i14.id, locationId: locVJA.id, quantity: 20 },
    { itemId: i15.id, locationId: locVJA.id, quantity: 25 },
    { itemId: i16.id, locationId: locHYD.id, quantity: 10 },
    { itemId: i17.id, locationId: locVJA.id, quantity: 2 },
    { itemId: i17.id, locationId: locHYD.id, quantity: 1 },
  ];
  for (const s of stockEntries) {
    await prisma.stock.upsert({
      where: { itemId_locationId: { itemId: s.itemId, locationId: s.locationId } },
      update: { quantity: s.quantity },
      create: s,
    });
  }
  console.log('  ✅ 24 stock records\n');

  // ─── Transactions ─────────────────────────────────────────────────────────
  console.log('📜 Creating transactions...');
  await prisma.transaction.create({ data: { itemId: i1.id,  quantity: 10, type: 'IN',       toLocationId: locVJA.id, userId: admin.id,  vendor: 'Dell Technologies' } });
  await prisma.transaction.create({ data: { itemId: i2.id,  quantity: 8,  type: 'IN',       toLocationId: locVJA.id, userId: admin.id,  vendor: 'HP India' } });
  await prisma.transaction.create({ data: { itemId: i3.id,  quantity: 6,  type: 'IN',       toLocationId: locVJA.id, userId: admin.id,  vendor: 'Lenovo India' } });
  await prisma.transaction.create({ data: { itemId: i5.id,  quantity: 12, type: 'IN',       toLocationId: locVJA.id, userId: admin.id,  vendor: 'Dell Technologies' } });
  await prisma.transaction.create({ data: { itemId: i7.id,  quantity: 20, type: 'IN',       toLocationId: locVJA.id, userId: admin.id,  vendor: 'Dell Technologies' } });
  await prisma.transaction.create({ data: { itemId: i1.id,  quantity: 5,  type: 'TRANSFER', fromLocationId: locVJA.id, toLocationId: locHYD.id, userId: admin.id } });
  await prisma.transaction.create({ data: { itemId: i3.id,  quantity: 3,  type: 'TRANSFER', fromLocationId: locVJA.id, toLocationId: locGNT.id, userId: staff1.id } });
  await prisma.transaction.create({ data: { itemId: i9.id,  quantity: 3,  type: 'IN',       toLocationId: locVJA.id, userId: admin.id,  vendor: 'Epson India' } });
  await prisma.transaction.create({ data: { itemId: i11.id, quantity: 5,  type: 'IN',       toLocationId: locVJA.id, userId: admin.id,  vendor: 'TP-Link India' } });
  await prisma.transaction.create({ data: { itemId: i13.id, quantity: 30, type: 'IN',       toLocationId: locVJA.id, userId: admin.id } });
  console.log('  ✅ 10 transactions\n');

  // ─── Assignments ──────────────────────────────────────────────────────────
  console.log('🔗 Creating assignments...');
  await prisma.assignment.create({ data: { userId: staff1.id, itemId: i1.id,  locationId: locVJA.id, quantity: 1, status: 'ACTIVE' } });
  await prisma.assignment.create({ data: { userId: staff2.id, itemId: i2.id,  locationId: locVJA.id, quantity: 1, status: 'ACTIVE' } });
  await prisma.assignment.create({ data: { userId: staff3.id, itemId: i3.id,  locationId: locVJA.id, quantity: 1, status: 'ACTIVE' } });
  await prisma.assignment.create({ data: { userId: staff4.id, itemId: i4.id,  locationId: locVJA.id, quantity: 1, status: 'ACTIVE' } });
  await prisma.assignment.create({ data: { userId: staff1.id, itemId: i15.id, locationId: locVJA.id, quantity: 1, status: 'ACTIVE' } });
  await prisma.assignment.create({ data: { userId: staff2.id, itemId: i15.id, locationId: locVJA.id, quantity: 1, status: 'ACTIVE' } });
  await prisma.assignment.create({ data: { userId: staff3.id, itemId: i16.id, locationId: locHYD.id, quantity: 1, status: 'ACTIVE' } });
  await prisma.assignment.create({ data: { userId: staff4.id, itemId: i10.id, locationId: locVJA.id, quantity: 1, status: 'RETURNED', returnedAt: new Date() } });
  console.log('  ✅ 8 assignments\n');

  // ─── Mobile Numbers ───────────────────────────────────────────────────────
  console.log('📱 Creating mobile numbers...');
  await prisma.mobileNumber.create({ data: { number: '9000100001', provider: 'Airtel', planDetails: 'Unlimited 5G - ₹599/mo', status: 'ASSIGNED', userId: admin.id,  assignedAt: new Date() } });
  await prisma.mobileNumber.create({ data: { number: '9000100002', provider: 'Jio',    planDetails: 'Unlimited 4G - ₹449/mo', status: 'ASSIGNED', userId: staff1.id, assignedAt: new Date() } });
  await prisma.mobileNumber.create({ data: { number: '9000100003', provider: 'Jio',    planDetails: 'Unlimited 4G - ₹449/mo', status: 'ASSIGNED', userId: staff2.id, assignedAt: new Date() } });
  await prisma.mobileNumber.create({ data: { number: '9000100004', provider: 'Vi',     planDetails: 'Corporate 4G - ₹399/mo', status: 'ASSIGNED', userId: staff3.id, assignedAt: new Date() } });
  await prisma.mobileNumber.create({ data: { number: '9000100005', provider: 'Airtel', planDetails: 'Unlimited 5G - ₹599/mo', status: 'ASSIGNED', userId: staff4.id, assignedAt: new Date() } });
  await prisma.mobileNumber.create({ data: { number: '9000100006', provider: 'Jio',    planDetails: 'Unlimited 4G - ₹449/mo', status: 'AVAILABLE' } });
  await prisma.mobileNumber.create({ data: { number: '9000100007', provider: 'Airtel', planDetails: 'Basic 4G - ₹299/mo',     status: 'AVAILABLE' } });
  await prisma.mobileNumber.create({ data: { number: '9000100008', provider: 'BSNL',   planDetails: 'Corporate - ₹199/mo',    status: 'AVAILABLE' } });
  console.log('  ✅ 8 mobile numbers\n');

  // ─── Internet Bills ───────────────────────────────────────────────────────
  console.log('🌐 Creating internet bills...');
  await prisma.internetBill.create({ data: { provider: 'Airtel Fiber',  planDetails: '300 Mbps Unlimited',   monthlyCost: 2499, dueDate: new Date('2026-06-05'),  status: 'ACTIVE', locationId: locVJA.id } });
  await prisma.internetBill.create({ data: { provider: 'ACT Fibernet',  planDetails: '150 Mbps Unlimited',   monthlyCost: 1499, dueDate: new Date('2026-06-10'), status: 'ACTIVE', locationId: locHYD.id } });
  await prisma.internetBill.create({ data: { provider: 'Jio Fiber',     planDetails: '100 Mbps Unlimited',   monthlyCost: 999,  dueDate: new Date('2026-06-15'), status: 'ACTIVE', locationId: locGNT.id } });
  await prisma.internetBill.create({ data: { provider: 'BSNL Broadband',planDetails: '50 Mbps Corporate',    monthlyCost: 799,  dueDate: new Date('2026-06-01'),  status: 'ACTIVE', locationId: locBLR.id } });
  await prisma.internetBill.create({ data: { provider: 'Airtel Fiber',  planDetails: '200 Mbps Business',    monthlyCost: 1999, dueDate: new Date('2026-06-07'),  status: 'ACTIVE', locationId: locCHE.id } });
  console.log('  ✅ 5 internet bills\n');

  console.log('✅ Done! All records seeded with integer IDs.');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e.message); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
