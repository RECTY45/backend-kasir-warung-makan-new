
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const menus = await prisma.menu.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      price: true,
      isAvailable: true,
      isPopular: true
    }
  });
  console.log(JSON.stringify(menus, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
  process.exit(0);
}

check();
