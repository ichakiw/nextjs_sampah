import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import Link from 'next/link';
import ClickableImage from '@/components/ClickableImage';

async function getUserRiwayat(userId, filterStatus) {
  const where = {
    userId,
    status: {
      in: ['APPROVED', 'REJECTED']
    }
  };

  if (filterStatus && filterStatus !== 'semua') {
    where.status = filterStatus.toUpperCase();
  }

  return await prisma.laporanSampah.findMany({
    where,
    include: {
      jenisSampah: true,
      wilayah: true,
      foto: true,
    },
    orderBy: { updatedAt: 'desc' },
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

export default async function UserRiwayatPage({ searchParams }) {
  const token = (await cookies()).get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = verifyToken(token);

  if (!decoded || decoded.role !== 'USER') {
    redirect('/login');
  }

  const userInfo = await getUserInfo(decoded.email);
  const filter = searchParams?.filter || 'semua';
  const riwayat = await getUserRiwayat(decoded.id, filter);

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
        <Navbar title="Riwayat" user={user} />

        <div className="card" style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #bbf7d0',
          padding: '28px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#14532d', marginBottom: '4px', letterSpacing: '-0.5px' }}>
                Riwayat
              </h1>
              <p style={{ color: '#166534', fontSize: '14px', fontWeight: 500 }}>
                Laporan yang sudah Approved atau Rejected
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href="/user/riwayat?filter=semua" className={`btn ${filter === 'semua' ? 'btn-primary' : 'btn-secondary'}`}>
                Semua
              </Link>
              <Link href="/user/riwayat?filter=approved" className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-secondary'}`}>
                Approved
              </Link>
              <Link href="/user/riwayat?filter=rejected" className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}>
                Rejected
              </Link>
            </div>
          </div>
        </div>

        {riwayat.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">📜</div>
              <div className="empty-state-title">Belum ada riwayat</div>
              <div className="empty-state-desc">
                Laporan yang sudah Approved atau Rejected akan muncul di sini.
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {riwayat.map((item) => (
              <div key={item.id} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                transition: 'var(--transition)',
                boxShadow: 'var(--shadow-sm)'
              }} className="card-hover">
                <div style={{
                  height: '180px',
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
                      height={180}
                      style={{ width: '100%', height: '180px', objectFit: 'cover' }}
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
                      <span>📍 Wilayah</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{item.wilayah.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>⚖️ Berat</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{item.weight} Kg</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>💰 Total Harga</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                        Rp {Number(item.totalPrice).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>📅 Tanggal</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                        {new Date(item.updatedAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                  {item.status === 'APPROVED' && (
                    <Link href={`/user/riwayat/${item.id}`} className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }}>
                      Detail Transaksi →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
