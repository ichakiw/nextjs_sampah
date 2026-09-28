import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import Link from 'next/link';
import ClickableImage from '@/components/ClickableImage';

async function getLaporan(id, userId) {
  return await prisma.laporanSampah.findFirst({
    where: { id, userId },
    include: {
      jenisSampah: true,
      wilayah: true,
      foto: true,
    },
  });
}

async function getUserInfo(email) {
  return await prisma.user.findUnique({
    where: { email },
    select: { name: true, email: true, role: true, phone: true },
  });
}

export default async function UserLaporanDetailPage({ params }) {
  const { id } = await params;
  const token = (await cookies()).get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'USER') redirect('/login');

  const userInfo = await getUserInfo(decoded.email);
  const laporan = await getLaporan(id, decoded.id);

  const user = { name: userInfo.name, role: userInfo.role };

  if (!laporan) {
    return (
      <div className="app-container">
        <Sidebar role="USER" />
        <main className="main-content">
          <Navbar title="Detail Laporan" user={user} />
          <div className="card">
            <p style={{ color: 'var(--danger)', fontSize: '16px' }}>Laporan tidak ditemukan</p>
            <Link href="/user/laporan" className="btn btn-secondary" style={{ marginTop: '16px' }}>
              Kembali ke Laporan Saya
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const statusBadge = {
    PENDING: 'badge-pending',
    APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected',
  }[laporan.status] || 'badge-pending';

  return (
    <div className="app-container">
      <Sidebar role="USER" />
      <main className="main-content">
        <Navbar title="Detail Laporan" user={user} />

        <div className="card" style={{ padding: '28px', maxWidth: '900px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>Detail Laporan</h2>
            <Link href="/user/laporan" className="btn btn-secondary">
              ← Back
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            alignItems: 'start'
          }}>
            <div style={{
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '220px',
              maxWidth: '380px'
            }}>
              {laporan.foto?.imageUrl ? (
                <ClickableImage
                  src={laporan.foto.imageUrl}
                  alt="Foto Sampah"
                  width={380}
                  height={320}
                  style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '0' }}
                />
              ) : (
                <div style={{ fontSize: '64px', opacity: 0.3 }}>📷</div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div className="detail-label">Waste Type</div>
                  <div className="detail-value">{laporan.jenisSampah.name}</div>
                </div>
                <div>
                  <div className="detail-label">Area</div>
                  <div className="detail-value">{laporan.wilayah.name}</div>
                </div>
                <div>
                  <div className="detail-label">Weight</div>
                  <div className="detail-value">{laporan.weight} Kg</div>
                </div>
                <div>
                  <div className="detail-label">Price per Kg</div>
                  <div className="detail-value">Rp {laporan.jenisSampah.price.toLocaleString('id-ID')}</div>
                </div>
                <div>
                  <div className="detail-label">Total Price</div>
                  <div className="detail-value" style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>
                    Rp {Number(laporan.totalPrice).toLocaleString('id-ID')}
                  </div>
                </div>
                <div>
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    <span className={`badge ${statusBadge}`}>{laporan.status}</span>
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="detail-label">Report Date</div>
                  <div className="detail-value">
                    {new Date(laporan.tanggalLaporan).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: '8px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)'
              }}>
                <div className="detail-label" style={{ marginBottom: '8px' }}>User Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Name</div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{userInfo.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Email</div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{userInfo.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Phone</div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{userInfo.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
