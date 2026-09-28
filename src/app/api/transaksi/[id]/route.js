import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (decoded.role !== 'ADMIN') {
      return Response.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const transaksi = await prisma.laporanSampah.findFirst({
      where: { id, status: 'APPROVED' },
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

    if (!transaksi) {
      return Response.json(
        { message: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    return Response.json(transaksi);
  } catch (error) {
    console.error('Get transaksi detail error:', error);
    return Response.json(
      { message: 'Gagal mengambil data transaksi' },
      { status: 500 }
    );
  }
}
