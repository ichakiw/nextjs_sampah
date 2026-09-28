import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const jenisSampah = await prisma.jenisSampah.findMany({
      orderBy: { name: 'asc' }
    });
    return Response.json(jenisSampah);
  } catch (error) {
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
    if (!decoded || decoded.role !== 'ADMIN') {
      return Response.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { name, price } = await request.json();

    if (!name || !price) {
      return Response.json(
        { message: 'Nama dan harga wajib diisi' },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return Response.json(
        { message: 'Harga harus lebih dari 0' },
        { status: 400 }
      );
    }

    const existing = await prisma.jenisSampah.findUnique({
      where: { name }
    });

    if (existing) {
      return Response.json(
        { message: 'Nama jenis sampah sudah ada' },
        { status: 400 }
      );
    }

    const jenisSampah = await prisma.jenisSampah.create({
      data: { name, price }
    });

    return Response.json(jenisSampah, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: 'Gagal menambahkan data' },
      { status: 500 }
    );
  }
}