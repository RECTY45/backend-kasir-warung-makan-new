import { PrismaClient } from '@prisma/client';

export async function seedCategories(prisma: PrismaClient) {
  const categories = [
    'Makanan Utama',
    'Lauk Tambahan',
    'Minuman Segar',
    'Minuman Hangat',
    'Pencuci Mulut',
    'Paket Hemat'
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { id: 0 }, // Dummy where for upsert using findUnique pattern if not supported well on strings
      update: {},
      create: { name }
    }).catch(async () => {
        // Fallback if upsert logic is tricky without unique name field (schema shows name is not unique)
        const exists = await prisma.category.findFirst({ where: { name } });
        if (!exists) {
            await prisma.category.create({ data: { name } });
        }
    });
  }
  
  console.log('✅ Categories seeded');
}
