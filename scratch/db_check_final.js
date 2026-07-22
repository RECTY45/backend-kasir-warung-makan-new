
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const raw = await prisma.$queryRawUnsafe('SELECT * FROM menus LIMIT 1');
    console.log('Raw DB Columns:', Object.keys(raw[0]));
    
    const menus = await prisma.menu.findMany({ take: 1 });
    console.log('Prisma Object Keys:', Object.keys(menus[0]));
    console.log('isAvailable value:', menus[0].isAvailable);
    console.log('price type:', typeof menus[0].price);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

check();
