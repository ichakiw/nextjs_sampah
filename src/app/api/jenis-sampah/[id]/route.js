import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const jenisSampah = await prisma.jenisSampah.findUnique({
      where: { id }
    });

    if (!jenisSampah) {
      return Response.json(
        { message: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    return Response.json(jenisSampah);
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

    const existing = await prisma.jenisSampah.findFirst({
      where: {
        name,
        NOT: { id }
      }
    });

    if (existing) {
      return Response.json(
        { message: 'Nama jenis sampah sudah ada' },
        { status: 400 }
      );
    }

    const jenisSampah = await prisma.jenisSampah.update({
      where: { id },
      data: { name, price }
    });

    return Response.json(jenisSampah);
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
      where: { jenisSampahId: id }
    });

    if (hasReports) {
      return Response.json(
        { message: 'Tidak dapat menghapus karena masih digunakan dalam laporan' },
        { status: 400 }
      );
    }

    await prisma.jenisSampah.delete({
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
