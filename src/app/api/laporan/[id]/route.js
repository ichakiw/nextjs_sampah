import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const laporan = await prisma.laporanSampah.findUnique({
      where: { id },
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

    if (!laporan) {
      return Response.json(
        { message: 'Laporan tidak ditemukan' },
        { status: 404 }
      );
    }

    return Response.json(laporan);
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
    if (!decoded) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { userId, weight, status } = await request.json();

    const laporan = await prisma.laporanSampah.findUnique({
      where: { id },
      include: { jenisSampah: true, user: true }
    });

    if (!laporan) {
      return Response.json(
        { message: 'Laporan tidak ditemukan' },
        { status: 404 }
      );
    }

    if (decoded.role !== 'ADMIN') {
      return Response.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const updateData = {};
    if (userId && userId.trim() !== '') {
      updateData.userId = userId;
    }
    if (weight !== undefined && weight !== '' && Number(weight) > 0) {
      const numWeight = Number(weight);
      updateData.weight = numWeight;
      updateData.totalPrice = numWeight * Number(laporan.jenisSampah.price);
    }
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      updateData.status = status;
    }

    const updated = await prisma.laporanSampah.update({
      where: { id },
      data: updateData,
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

    if (status === 'APPROVED' && laporan.status !== 'APPROVED') {
      await prisma.user.update({
        where: { id: updated.userId },
        data: {
          saldo: {
            increment: Number(updated.totalPrice)
          }
        }
      });
    }

    return Response.json(updated);
  } catch (error) {
    console.error('Update laporan error:', error);
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

    await prisma.laporanSampah.delete({
      where: { id }
    });

    return Response.json({ message: 'Laporan berhasil dihapus' });
  } catch (error) {
    return Response.json(
      { message: 'Gagal menghapus data' },
      { status: 500 }
    );
  }
}