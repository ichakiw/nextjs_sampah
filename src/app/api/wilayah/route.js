import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const wilayah = await prisma.wilayah.findMany({
      orderBy: { name: 'asc' }
    });
    return Response.json(wilayah);
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

    const { name, kotaAdministrasi } = await request.json();

    if (!name || !name.trim() || !kotaAdministrasi || !kotaAdministrasi.trim()) {
      return Response.json(
        { message: 'Nama wilayah dan kota administrasi wajib diisi' },
        { status: 400 }
      );
    }

    const existing = await prisma.wilayah.findUnique({
      where: { name: name.trim() }
    });

    if (existing) {
      return Response.json(
        { message: 'Nama wilayah sudah ada' },
        { status: 400 }
      );
    }

    const wilayah = await prisma.wilayah.create({
      data: {
        name: name.trim(),
        kotaAdministrasi: kotaAdministrasi.trim()
      }
    });

    return Response.json(wilayah, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: 'Gagal menambahkan data' },
      { status: 500 }
    );
  }
}