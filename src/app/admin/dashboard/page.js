import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import Link from 'next/link';
import ClickableImage from '@/components/ClickableImage';

async function getStats() {
  const [
    totalUsers,
    totalJenisSampah,
    totalWilayah,
    totalLaporan,
    pendingLaporan,
    approvedLaporan,
    rejectedLaporan,
    totalTransaksi
  ] = await Promise.all([
    prisma.user.count(),
    prisma.jenisSampah.count(),
    prisma.wilayah.count(),
    prisma.laporanSampah.count(),
    prisma.laporanSampah.count({ where: { status: 'PENDING' } }),
    prisma.laporanSampah.count({ where: { status: 'APPROVED' } }),
    prisma.laporanSampah.count({ where: { status: 'REJECTED' } }),
    prisma.laporanSampah.count({ where: { status: 'APPROVED' } }),
  ]);

  return {
    totalUsers,
    totalJenisSampah,
    totalWilayah,
    totalLaporan,
    pendingLaporan,
    approvedLaporan,
    rejectedLaporan,
    totalTransaksi
  };
}

async function getLatestLaporan() {
  return await prisma.laporanSampah.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true }
      },
      jenisSampah: true,
      wilayah: true,
      foto: true,
    },
  });
}

export default async function AdminDashboard() {
  const token = (await cookies()).get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') redirect('/login');

  const stats = await getStats();
  const latestLaporan = await getLatestLaporan();

  const user = {
    name: decoded.email,
    role: decoded.role
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
      <Sidebar role="ADMIN" />
      <main className="main-content">
        <Navbar title="Dashboard Admin" user={user} />
        
        <div className="stats-grid">
          <div className="stat-card info">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total User</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalJenisSampah}</div>
            <div className="stat-label">Jenis Sampah</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalWilayah}</div>
            <div className="stat-label">Wilayah</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalLaporan}</div>
            <div className="stat-label">Total Laporan</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-value">{stats.pendingLaporan}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">{stats.approvedLaporan}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-value">{stats.rejectedLaporan}</div>
            <div className="stat-label">Rejected</div>
          </div>
          <div className="stat-card premium">
            <div className="stat-value">{stats.totalTransaksi}</div>
            <div className="stat-label">Transaksi</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">⚡ Aktivitas Terbaru</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {latestLaporan.slice(0, 5).map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border)',
                  transition: 'var(--transition)'
                }} className="card-hover">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: item.status === 'APPROVED' ? '#dcfce7' : item.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      {item.status === 'APPROVED' ? '✅' : item.status === 'REJECTED' ? '❌' : '⏳'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.user.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        {item.jenisSampah.name} • {item.wilayah.name} • {item.weight} Kg
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${statusBadge(item.status)}`}>{item.status}</span>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                      {new Date(item.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">📋 Laporan Terbaru</h2>
              <Link href="/admin/laporan" className="btn btn-secondary">
                Lihat Semua
              </Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Jenis Sampah</th>
                    <th>Wilayah</th>
                    <th>Berat</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {latestLaporan.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.user.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.user.email}</div>
                        </div>
                      </td>
                      <td>{item.jenisSampah.name}</td>
                      <td>{item.wilayah.name}</td>
                      <td>{item.weight} Kg</td>
                      <td><strong>Rp {Number(item.totalPrice).toLocaleString('id-ID')}</strong></td>
                      <td>
                        <span className={`badge ${statusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
