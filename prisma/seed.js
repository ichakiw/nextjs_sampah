const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@banksampah.com' },
    update: {},
    create: {
      name: 'Admin Bank Sampah',
      email: 'admin@banksampah.com',
      password: hashedPassword,
      phone: '081234567890',
      role: 'ADMIN'
    }
  });

  console.log('Admin created:', admin);

  const existingJenisCount = await prisma.jenisSampah.count();
  if (existingJenisCount === 0) {
    await prisma.jenisSampah.createMany({
      data: [
        { name: 'Botol Plastik', price: 2000 },
        { name: 'Kertas', price: 1500 },
        { name: 'Kardus', price: 1800 },
        { name: 'Logam', price: 5000 },
        { name: 'Elektronik', price: 3000 },
        { name: 'Kaca', price: 1000 },
      ],
      skipDuplicates: true
    });
    console.log('Sample jenis sampah seeded');
  }

  const existingWilayahCount = await prisma.wilayah.count();
  if (existingWilayahCount === 0) {
    const wilayahData = [
      { name: 'Gambir', kotaAdministrasi: 'Jakarta Pusat' },
      { name: 'Tanah Abang', kotaAdministrasi: 'Jakarta Pusat' },
      { name: 'Menteng', kotaAdministrasi: 'Jakarta Pusat' },
      { name: 'Senen', kotaAdministrasi: 'Jakarta Pusat' },
      { name: 'Cempaka Putih', kotaAdministrasi: 'Jakarta Pusat' },
      { name: 'Johar Baru', kotaAdministrasi: 'Jakarta Pusat' },
      { name: 'Kemayoran', kotaAdministrasi: 'Jakarta Pusat' },
      { name: 'Sawah Besar', kotaAdministrasi: 'Jakarta Pusat' },
      { name: 'Cengkareng', kotaAdministrasi: 'Jakarta Barat' },
      { name: 'Grogol Petamburan', kotaAdministrasi: 'Jakarta Barat' },
      { name: 'Kalideres', kotaAdministrasi: 'Jakarta Barat' },
      { name: 'Kebon Jeruk', kotaAdministrasi: 'Jakarta Barat' },
      { name: 'Kembangan', kotaAdministrasi: 'Jakarta Barat' },
      { name: 'Palmerah', kotaAdministrasi: 'Jakarta Barat' },
      { name: 'Tambora', kotaAdministrasi: 'Jakarta Barat' },
      { name: 'Taman Sari', kotaAdministrasi: 'Jakarta Barat' },
      { name: 'Cilandak', kotaAdministrasi: 'Jakarta Selatan' },
      { name: 'Jagakarsa', kotaAdministrasi: 'Jakarta Selatan' },
      { name: 'Kebayoran Baru', kotaAdministrasi: 'Jakarta Selatan' },
      { name: 'Kebayoran Lama', kotaAdministrasi: 'Jakarta Selatan' },
      { name: 'Mampang Prapatan', kotaAdministrasi: 'Jakarta Selatan' },
      { name: 'Pancoran', kotaAdministrasi: 'Jakarta Selatan' },
      { name: 'Pasar Minggu', kotaAdministrasi: 'Jakarta Selatan' },
      { name: 'Pesanggrahan', kotaAdministrasi: 'Jakarta Selatan' },
      { name: 'Setiabudi', kotaAdministrasi: 'Jakarta Selatan' },
      { name: 'Tebet', kotaAdministrasi: 'Jakarta Selatan' },
      { name: 'Cakung', kotaAdministrasi: 'Jakarta Timur' },
      { name: 'Cipayung', kotaAdministrasi: 'Jakarta Timur' },
      { name: 'Ciracas', kotaAdministrasi: 'Jakarta Timur' },
      { name: 'Duren Sawit', kotaAdministrasi: 'Jakarta Timur' },
      { name: 'Jatinegara', kotaAdministrasi: 'Jakarta Timur' },
      { name: 'Kramat Jati', kotaAdministrasi: 'Jakarta Timur' },
      { name: 'Makasar', kotaAdministrasi: 'Jakarta Timur' },
      { name: 'Matraman', kotaAdministrasi: 'Jakarta Timur' },
      { name: 'Pasar Rebo', kotaAdministrasi: 'Jakarta Timur' },
      { name: 'Pulo Gadung', kotaAdministrasi: 'Jakarta Timur' },
      { name: 'Cilincing', kotaAdministrasi: 'Jakarta Utara' },
      { name: 'Kelapa Gading', kotaAdministrasi: 'Jakarta Utara' },
      { name: 'Koja', kotaAdministrasi: 'Jakarta Utara' },
      { name: 'Pademangan', kotaAdministrasi: 'Jakarta Utara' },
      { name: 'Penjaringan', kotaAdministrasi: 'Jakarta Utara' },
      { name: 'Tanjung Priok', kotaAdministrasi: 'Jakarta Utara' },
      
    ];

    await prisma.wilayah.createMany({
      data: wilayahData,
      skipDuplicates: true
    });
    console.log('Wilayah data seeded');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
