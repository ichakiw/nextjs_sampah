import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const wilayah = await prisma.wilayah.findUnique({
      where: { id }
    });

    if (!wilayah) {
      return Response.json(
        { message: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    return Response.json(wilayah);
  } catch (error) {
    return Response.json(
      { message: 'Gagal mengambil data' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return Response.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { name, kotaAdministrasi } = await request.json();

    if (!name || !name.trim() || !kotaAdministrasi || !kotaAdministrasi.trim()) {
      return Response.json(
        { message: 'Nama wilayah dan kota administrasi wajib diisi' },
        { status: 400 }
      );
    }

    const existing = await prisma.wilayah.findFirst({
      where: {
        name: name.trim(),
        NOT: { id }
      }
    });

    if (existing) {
      return Response.json(
        { message: 'Nama wilayah sudah ada' },
        { status: 400 }
      );
    }

    const wilayah = await prisma.wilayah.update({
      where: { id },
      data: {
        name: name.trim(),
        kotaAdministrasi: kotaAdministrasi.trim()
      }
    });

    return Response.json(wilayah);
  } catch (error) {
    return Response.json(
      { message: 'Gagal mengupdate data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return Response.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const hasReports = await prisma.laporanSampah.findFirst({
      where: { wilayahId: id }
    });

    if (hasReports) {
      return Response.json(
        { message: 'Tidak dapat menghapus karena masih digunakan dalam laporan' },
        { status: 400 }
      );
    }

    await prisma.wilayah.delete({
      where: { id }
    });

    return Response.json({ message: 'Data berhasil dihapus' });
  } catch (error) {
    return Response.json(
      { message: 'Gagal menghapus data' },
      { status: 500 }
    );
  }
}
