import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const where = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const laporan = await prisma.laporanSampah.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        jenisSampah: true,
        wilayah: true,
        foto: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return Response.json(laporan);
  } catch (error) {
    console.error('Get laporan error:', error);
    return Response.json(
      { message: 'Gagal mengambil data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { jenisSampahId, wilayahId, weight, fotoUrl } = await request.json();

    if (!jenisSampahId || !wilayahId || !weight || !fotoUrl) {
      return Response.json(
        { message: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    if (weight <= 0) {
      return Response.json(
        { message: 'Berat harus lebih dari 0' },
        { status: 400 }
      );
    }

    // Get price from jenis sampah
    const jenisSampah = await prisma.jenisSampah.findUnique({
      where: { id: jenisSampahId }
    });

    if (!jenisSampah) {
      return Response.json(
        { message: 'Jenis sampah tidak ditemukan' },
        { status: 404 }
      );
    }

    const totalPrice = weight * jenisSampah.price;

    // Check for duplicate report (same user, jenis sampah, wilayah, and date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingReport = await prisma.laporanSampah.findFirst({
      where: {
        userId: decoded.id,
        jenisSampahId,
        wilayahId,
        tanggalLaporan: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingReport) {
      return Response.json(
        { message: 'Anda sudah membuat laporan dengan jenis sampah dan wilayah yang sama hari ini' },
        { status: 400 }
      );
    }

    const laporan = await prisma.laporanSampah.create({
      data: {
        userId: decoded.id,
        jenisSampahId,
        wilayahId,
        weight,
        totalPrice,
        status: 'PENDING',
        foto: {
          create: {
            imageUrl: fotoUrl
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        jenisSampah: true,
        wilayah: true,
        foto: true
      }
    });

    return Response.json(laporan, { status: 201 });
  } catch (error) {
    console.error('Create laporan error:', error);
    return Response.json(
      { message: 'Gagal membuat laporan' },
      { status: 500 }
    );
  }
}