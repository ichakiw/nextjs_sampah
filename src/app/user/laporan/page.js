import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import ClickableImage from '@/components/ClickableImage';

async function getUserLaporan(userId) {
  return await prisma.laporanSampah.findMany({
    where: { userId },
    include: {
      jenisSampah: true,
      wilayah: true,
      foto: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getUserInfo(email) {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      name: true,
      email: true,
      role: true,
    },
  });
}

export default async function UserLaporanPage() {
  const token = (await cookies()).get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = verifyToken(token);

  if (!decoded || decoded.role !== 'USER') {
    redirect('/login');
  }

  const userInfo = await getUserInfo(decoded.email);
  const laporan = await getUserLaporan(decoded.id);

  const user = {
    name: userInfo.name,
    role: userInfo.role,
  };

  const statusBadge = (status) => {
    const map = {
      PENDING: 'badge-pending',
      APPROVED: 'badge-approved',
      REJECTED: 'badge-rejected',
    };
    return map[status] || 'badge-pending';
  };

  return (
    <div className="app-container">
      <Sidebar role="USER" />
      <main className="main-content">
        <Navbar title="Laporan Saya" user={user} />

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📋 Laporan Saya</h2>
            <Link href="/user/laporan/create" className="btn btn-primary">
              + Buat Laporan
            </Link>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Foto</th>
                  <th>Jenis Sampah</th>
                  <th>Wilayah</th>
                  <th>Berat (Kg)</th>
                  <th>Total Harga</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>

              <tbody>
                {laporan.length === 0 ? (
                  <tr>
                    <td colSpan="8">
                      <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <div className="empty-state-title">Belum ada laporan</div>
                        <div className="empty-state-desc">
                          Anda belum memiliki laporan sampah. Buat laporan pertama Anda sekarang.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  laporan.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>
                        {item.foto?.imageUrl ? (
                          <ClickableImage
                            src={item.foto.imageUrl}
                            alt="Foto Sampah"
                            width={50}
                            height={50}
                            className="img-thumb"
                          />
                        ) : (
                          <div className="img-placeholder">📷</div>
                        )}
                      </td>
                      <td><strong>{item.jenisSampah.name}</strong></td>
                      <td>{item.wilayah.name}</td>
                      <td><strong>{item.weight} Kg</strong></td>
                      <td>
                        <strong style={{ color: 'var(--primary-dark)' }}>
                          Rp {Number(item.totalPrice).toLocaleString('id-ID')}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge ${statusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{new Date(item.tanggalLaporan).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
