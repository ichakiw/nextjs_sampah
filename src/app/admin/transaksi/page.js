import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import Link from 'next/link';
import ClickableImage from '@/components/ClickableImage';

async function getTransaksi(searchParams) {
  const where = { status: 'APPROVED' };
  const q = searchParams?.q;

  if (q) {
    where.user = {
      name: { contains: q, mode: 'insensitive' }
    };
  }

  return await prisma.laporanSampah.findMany({
    where,
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
    },
    orderBy: { updatedAt: 'desc' }
  });
}

export default async function TransaksiAdminPage({ searchParams }) {
  const token = (await cookies()).get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') redirect('/login');

  const transaksi = await getTransaksi(searchParams);

  const user = {
    name: decoded.email,
    role: decoded.role
  };

  const total = transaksi.reduce((sum, t) => sum + Number(t.totalPrice), 0);

  return (
    <div className="app-container">
      <Sidebar role="ADMIN" />
      <main className="main-content">
        <Navbar title="Transaksi" user={user} />

        <div className="stats-grid">
          <div className="stat-card success">
            <div className="stat-value">{transaksi.length}</div>
            <div className="stat-label">Total Transaksi</div>
          </div>
          <div className="stat-card info">
            <div className="stat-value">Rp {total.toLocaleString("id-ID")}</div>
            <div className="stat-label">Total Nilai</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">💰 Daftar Transaksi</h2>
            <form method="get" style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                name="q"
                placeholder="Cari nama user..."
                defaultValue={searchParams?.q || ''}
                style={{
                  padding: '10px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '14px',
                  width: '220px'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>
                🔍
              </button>
            </form>
          </div>
          
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Foto</th>
                  <th>User</th>
                  <th>Jenis Sampah</th>
                  <th>Wilayah</th>
                  <th>Berat (Kg)</th>
                  <th>Total Harga</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transaksi.length === 0 ? (
                  <tr>
                    <td colSpan="9">
                      <div className="empty-state">
                        <div className="empty-state-icon">💰</div>
                        <div className="empty-state-title">Belum ada transaksi</div>
                        <div className="empty-state-desc">
                          Transaksi akan muncul otomatis setelah laporan di-APPROVED.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transaksi.map((item, index) => (
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
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.user.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.user.email}</div>
                        </div>
                      </td>
                      <td><strong>{item.jenisSampah.name}</strong></td>
                      <td>{item.wilayah.name}</td>
                      <td><strong>{item.weight} Kg</strong></td>
                      <td>
                        <strong style={{ color: 'var(--primary-dark)' }}>
                          Rp {Number(item.totalPrice).toLocaleString('id-ID')}
                        </strong>
                      </td>
                      <td>{new Date(item.updatedAt).toLocaleDateString('id-ID')}</td>
                      <td>
                        <Link href={`/admin/transaksi/${item.id}`} className="btn btn-secondary btn-sm">
                          👁️ Detail
                        </Link>
                      </td>
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
