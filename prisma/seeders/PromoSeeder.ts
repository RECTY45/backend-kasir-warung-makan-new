import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedPromos(prisma: PrismaClient) {
  // 1. Promo Banners (Hanya untuk Development/Staging)
  if (process.env.NODE_ENV !== 'production') {
    const promos = [
      { title: 'Ramadhan Hemat: Paket Berbuka Berdua', desc: 'Dapatkan 2 Nasi Rendang + 2 Teh Talua hanya Rp 65.000!', img: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0' },
      { title: 'Diskon 20% Pengguna Baru', desc: 'Gunakan voucher BARU20 untuk pesanan pertama Anda melalui aplikasi.', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5' },
      { title: 'Cashback E-Wallet 15%', desc: 'Bayar pakai QRIS dan dapatkan cashback langsung ke saldo Anda.', img: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1' }
    ];

    for (const p of promos) {
      await prisma.promo.create({
        data: {
          title: p.title,
          description: p.desc,
          image: `${p.img}?auto=format&fit=crop&q=80&w=800`,
          isActive: true
        }
      });
    }
  }

  // 2. Vouchers
  const vouchers = [
    { code: 'SELAMATMAKAN', discount: 5000 },
    { code: 'PADANGPUAS', discount: 10000 },
    { code: 'WEEKENDHEMAT', discount: 15000 },
    { code: 'BARU20', discount: 20000 }
  ];

  for (const v of vouchers) {
    await prisma.voucher.create({
      data: {
        code: v.code,
        discount: v.discount,
        expiredAt: faker.date.future()
      }
    });
  }

  console.log('✅ Promos and Vouchers seeded');
}
