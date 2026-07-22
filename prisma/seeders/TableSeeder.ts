import { PrismaClient, TableStatus } from '@prisma/client';

export async function seedTables(prisma: PrismaClient) {
  for (let i = 1; i <= 15; i++) {
    const name = `Meja ${i}`;
    await prisma.table.create({
      data: {
        name,
        qrCode: `/qr-table/${i}`,
        status: TableStatus.AKTIF
      }
    });
  }
  console.log('✅ Tables seeded (1-15)');
}
