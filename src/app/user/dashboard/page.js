import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import Link from 'next/link';
import ClickableImage from '@/components/ClickableImage';

async function getUserInfo(email) {
  return await prisma.user.findUnique({
    where: { email },
    select: { name: true, email: true, role: true, saldo: true }
  });
}

async function getLatestLaporan(userId) {
  return await prisma.laporanSampah.findMany({
    where: { userId },
    include: {
      jenisSampah: true,
      wilayah: true,
      foto: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });
}

export default async function UserDashboardPage() {
  const token = (await cookies()).get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'USER') redirect('/login');

  const userInfo = await getUserInfo(decoded.email);
  const latestLaporan = await getLatestLaporan(decoded.id);

  const user = {
    name: userInfo.name,
    role: userInfo.role
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
        <Navbar title="Dashboard" user={user} />

        <div className="card" style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #bbf7d0',
          padding: '28px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#14532d', marginBottom: '4px', letterSpacing: '-0.5px' }}>
                Hello, {userInfo.name}
              </h1>
              <p style={{ color: '#166534', fontSize: '14px', fontWeight: 500 }}>
                Manage your waste reports easily.
              </p>
              <div style={{
                marginTop: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'white',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid #bbf7d0',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <span style={{ fontSize: '14px', color: 'var(--muted)' }}>💰 Saldo Simpanan</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-dark)' }}>
                  Rp {Number(userInfo.saldo || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <Link href="/user/laporan/create" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px', boxShadow: '0 4px 14px rgba(34,197,94,0.25)' }}>
              + Create Report
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Latest Reports</h2>
            <Link href="/user/laporan" className="btn btn-secondary">
              View All
            </Link>
          </div>

          {latestLaporan.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No reports yet</div>
              <div className="empty-state-desc">
                Create your first waste report to get started.
              </div>
              <Link href="/user/laporan/create" className="btn btn-primary" style={{ marginTop: '20px' }}>
                + Create Report
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {latestLaporan.map((item) => (
                <div key={item.id} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  transition: 'var(--transition)',
                  boxShadow: 'var(--shadow-sm)'
                }} className="card-hover">
                  <div style={{
                    height: '170px',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid var(--border)',
                    position: 'relative'
                  }}>
                    {item.foto?.imageUrl ? (
                      <ClickableImage
                        src={item.foto.imageUrl}
                        alt="Foto Sampah"
                        width={400}
                        height={170}
                        style={{ width: '100%', height: '170px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ fontSize: '40px', opacity: 0.4 }}>📷</div>
                    )}
                    <span className={`badge ${statusBadge(item.status)}`} style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      {item.status}
                    </span>
                  </div>
                  <div style={{ padding: '18px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', color: 'var(--text)' }}>
                      {item.jenisSampah.name}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', fontSize: '13px', color: 'var(--muted)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>📍 Area</span>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{item.wilayah.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>⚖️ Weight</span>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{item.weight} Kg</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>💰 Total Price</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                          Rp {Number(item.totalPrice).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                    <Link href={`/user/laporan/${item.id}`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
