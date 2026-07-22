import { PrismaClient } from '@prisma/client';

export async function seedMenus(prisma: PrismaClient) {
  const categories = await prisma.category.findMany();
  
  const menuData = [
    // Makanan Utama
    { name: 'Rendang Daging Sapi', cat: 'Makanan Utama', price: 25000, popular: true, desc: 'Daging sapi pilihan yang dimasak perlahan dengan rempah khas Minang dan santan asli hingga kering berwarna kecokelatan gurih.', img: 'https://picsum.photos/seed/rendang/400/300' },
    { name: 'Gulai Tunjang (Kikil)', cat: 'Makanan Utama', price: 24000, popular: false, desc: 'Kikil sapi empuk kenyal disajikan dalam siraman kuah gulai kental gurih berempah khas Minang.', img: 'https://picsum.photos/seed/tunjang/400/300' },
    { name: 'Gulai Kepala Ikan Kakap', cat: 'Makanan Utama', price: 65000, popular: true, desc: 'Kepala ikan kakap segar pilihan porsi besar, dimasak lambat dengan kuah gulai kuning berempah melimpah dan gurih.', img: 'https://picsum.photos/seed/kepala-ikan/400/300' },
    { name: 'Sate Padang Lidah Sapi', cat: 'Makanan Utama', price: 28000, popular: true, desc: 'Sate lidah sapi bakar empuk disiram dengan kuah sate kuning kental gurih pedas khas Pariaman bertabur bawang goreng.', img: 'https://picsum.photos/seed/sate-padang/400/300' },
    { name: 'Soto Padang Daging Garing', cat: 'Makanan Utama', price: 22000, popular: false, desc: 'Soto berkuah kaldu sapi bening gurih dengan potongan daging sapi goreng garing renyah, soun, perkedel kentang, dan kerupuk merah.', img: 'https://picsum.photos/seed/soto-padang/400/300' },
    { name: 'Dendeng Batokok Cabe Ijo', cat: 'Makanan Utama', price: 25000, popular: true, desc: 'Dendeng daging sapi tipis yang dipukul (ditokok) hingga lembut, disajikan dengan siraman cabe hijau segar berminyak kelapa asli.', img: 'https://picsum.photos/seed/dendeng-ijo/400/300' },
    { name: 'Dendeng Balado Kering', cat: 'Makanan Utama', price: 25000, popular: true, desc: 'Dendeng daging sapi goreng garing renyah dipadukan dengan bumbu balado cabe merah pedas manis gurih.', img: 'https://picsum.photos/seed/dendeng-balado/400/300' },

    // Lauk Tambahan
    { name: 'Ayam Pop Spesial', cat: 'Lauk Tambahan', price: 20000, popular: true, desc: 'Ayam kampung rebus bumbu bawang putih kelapa gurih lalu digoreng sekejap, disajikan dengan sambal merah cair gurih asam manis.', img: 'https://picsum.photos/seed/ayam-pop/400/300' },
    { name: 'Ayam Goreng Bumbu Lengkuas', cat: 'Lauk Tambahan', price: 18000, popular: false, desc: 'Ayam goreng gurih bertabur kremesan parutan lengkuas wangi yang digoreng garing renyah.', img: 'https://picsum.photos/seed/ayam-goreng/400/300' },
    { name: 'Telur Dadar Barendo', cat: 'Lauk Tambahan', price: 12000, popular: true, desc: 'Telur dadar khas Minang berminyak kelapa dengan renda renyah kering di pinggir, tebal, empuk dan gurih di bagian dalam.', img: 'https://picsum.photos/seed/telur-dadar/400/300' },
    { name: 'Jengkol Balado', cat: 'Lauk Tambahan', price: 12000, popular: false, desc: 'Jengkol pilihan yang direbus empuk bebas bau lalu ditumis dengan sambal balado merah pedas gurih khas Padang.', img: 'https://picsum.photos/seed/jengkol/400/300' },
    { name: 'Paru Goreng Kering', cat: 'Lauk Tambahan', price: 18000, popular: true, desc: 'Paru sapi iris tipis renyah kering gurih asin.', img: 'https://picsum.photos/seed/paru/400/300' },
    { name: 'Gulai Tambusu (Usus Isi)', cat: 'Lauk Tambahan', price: 23000, popular: false, desc: 'Usus sapi pilihan diisi adonan telur bebek kocok gurih dan tahu sutra halus, dimasak dalam kuah gulai kental.', img: 'https://picsum.photos/seed/tambusu/400/300' },
    { name: 'Sambal Lado Mudo (Sambal Ijo)', cat: 'Lauk Tambahan', price: 5000, popular: false, desc: 'Sambal cabe hijau khas Minang yang ditumis layu dengan tomat hijau dan minyak kelapa asli.', img: null },
    { name: 'Gulai Daun Singkong', cat: 'Lauk Tambahan', price: 5000, popular: false, desc: 'Daun singkong muda rebus dimasak kuah santan gulai encer gurih.', img: null },

    // Minuman Segar
    { name: 'Es Jeruk Peras', cat: 'Minuman Segar', price: 12000, popular: false, desc: 'Jeruk peras segar manis dengan tambahan es batu kristal pelepas dahaga.', img: 'https://picsum.photos/seed/es-jeruk/400/300' },
    { name: 'Jus Alpukat Cokelat', cat: 'Minuman Segar', price: 18000, popular: true, desc: 'Alpukat mentega segar diblender kental dipadukan kucuran susu kental manis cokelat premium.', img: 'https://picsum.photos/seed/jus-alpukat/400/300' },
    { name: 'Es Tebak', cat: 'Minuman Segar', price: 15000, popular: false, desc: 'Es campur legendaris khas Minang berisi tebak (tepung beras), cincau hitam, tape singkong merah, disiram sirup merah dan susu kental manis.', img: 'https://picsum.photos/seed/es-tebak/400/300' },
    { name: 'Es Teh Manis', cat: 'Minuman Segar', price: 5000, popular: false, desc: 'Teh seduh wangi melati dingin dengan gula murni manis pas.', img: null },

    // Minuman Hangat
    { name: 'Teh Talua (Teh Telur)', cat: 'Minuman Hangat', price: 15000, popular: true, desc: 'Teh telur legendaris dari kuning telur bebek yang dikocok manual hingga berbusa tebal, diseduh teh pekat panas dan susu kental manis serta jeruk nipis.', img: 'https://picsum.photos/seed/teh-talua/400/300' },
    { name: 'Kopi Susu Talua', cat: 'Minuman Hangat', price: 18000, popular: true, desc: 'Kopi robusta pekat panas dipadukan kocokan kuning telur bebek gurih berenergi tinggi.', img: 'https://picsum.photos/seed/kopi-talua/400/300' },
    { name: 'Kopi Sidikalang Hangat', cat: 'Minuman Hangat', price: 10000, popular: false, desc: 'Kopi hitam robusta murni dari Sidikalang dengan rasa mantap dan aroma wangi herbal kuat.', img: 'https://picsum.photos/seed/kopi-sidikalang/400/300' },

    // Pencuci Mulut
    { name: 'Bubur Kampiun', cat: 'Pencuci Mulut', price: 15000, popular: true, desc: 'Bubur manis komplit khas Padang perpaduan bubur sumsum lembut, kolak pisang, ketan sarikayo manis legit, dan bubur kacang hijau.', img: 'https://picsum.photos/seed/bubur-kampiun/400/300' },
    { name: 'Ketan Sarikayo', cat: 'Pencuci Mulut', price: 10000, popular: false, desc: 'Ketan putih gurih disajikan dengan srikaya tradisional manis legit harum pandan.', img: null },

    // Paket Hemat
    { name: 'Paket Nasi Rendang Lengkap', cat: 'Paket Hemat', price: 32000, popular: true, desc: 'Nasi hangat, rendang daging sapi empuk, gulai nangka, daun singkong rebus gurih, sambal ijo mudo, dan siraman kuah campur.', img: 'https://picsum.photos/seed/paket-rendang/400/300' },
    { name: 'Paket Nasi Ayam Pop Lengkap', cat: 'Paket Hemat', price: 27000, popular: true, desc: 'Nasi hangat, ayam pop gurih lembut, sayur nangka muda, sambal pop khas, kuah gulai, daun singkong, dan sambal ijo.', img: 'https://picsum.photos/seed/paket-ayam/400/300' },
    { name: 'Paket Nasi Dendeng Lengkap', cat: 'Paket Hemat', price: 32000, popular: false, desc: 'Nasi hangat, dendeng balado/batokok pedas gurih, sayuran rebus lengkap, sambal ijo mudo, dan siraman kuah gulai kental.', img: 'https://picsum.photos/seed/paket-dendeng/400/300' },
  ];

  for (const item of menuData) {
    const category = categories.find(c => c.name === item.cat);
    if (category) {
      await prisma.menu.create({
        data: {
          name: item.name,
          description: item.desc,
          price: item.price,
          isPopular: item.popular,
          isAvailable: true,
          image: item.img ?? null,
          category: { connect: { id: category.id } }
        }
      });
    }
  }

  console.log('✅ Menus seeded (authentic Padang dishes)');
}
