import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import DeleteButton from '@/components/DeleteButton';
import StatusSelect from '@/components/StatusSelect';
import ClickableImage from '@/components/ClickableImage';

async function getLaporan(searchParams) {
  const where = {};
  const status = searchParams?.status;
  const q = searchParams?.q;

  if (status && status !== 'semua') {
    where.status = status.toUpperCase();
  }

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
    orderBy: { createdAt: 'desc' }
  });
}

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}

export default async function LaporanAdminPage({ searchParams }) {
  const token = (await cookies()).get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') redirect('/login');

  const laporan = await getLaporan(searchParams);
  const users = await getUsers();

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
        <Navbar title="Manajemen Laporan" user={user} />
        
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>📋 Semua Laporan</h2>
            <form method="get" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                name="q"
                placeholder="Cari nama user..."
                defaultValue={searchParams?.q || ''}
                style={{
                  padding: '9px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '13px',
                  width: '200px'
                }}
              />
              <select
                name="status"
                defaultValue={searchParams?.status || 'semua'}
                style={{
                  padding: '9px 32px 9px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '13px',
                  background: 'white'
                }}
              >
                <option value="semua">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button type="submit" className="btn btn-primary" style={{ padding: '9px 14px' }}>
                🔍
              </button>
            </form>
          </div>
          
          <div className="table-responsive" style={{ border: 'none', boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Foto</th>
                  <th>User</th>
                  <th>Jenis Sampah</th>
                  <th>Wilayah</th>
                  <th>Berat</th>
                  <th>Total Harga</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {laporan.length === 0 ? (
                  <tr>
                    <td colSpan="10">
                      <div className="empty-state" style={{ padding: '40px' }}>
                        <div className="empty-state-icon">📋</div>
                        <div className="empty-state-title">Belum ada laporan</div>
                        <div className="empty-state-desc">Laporan dari user akan muncul di sini.</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  laporan.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--muted)', fontSize: '13px' }}>{idx + 1}</td>
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
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.user.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.user.email}</div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.jenisSampah.name}</td>
                      <td>{item.wilayah.name}</td>
                      <td>
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          background: '#f8fafc',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border)',
                          fontSize: '13px',
                          fontWeight: 600
                        }}>
                          {item.weight} Kg
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                        Rp {item.totalPrice.toLocaleString('id-ID')}
                      </td>
                      <td>
                        <StatusSelect laporanId={item.id} currentStatus={item.status} />
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--muted)' }}>
                        {new Date(item.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link href={`/admin/laporan/${item.id}`} className="btn btn-secondary btn-sm btn-icon">
                            👁️
                          </Link>
                          <DeleteButton id={item.id} apiPath={`/api/laporan/${item.id}`} />
                        </div>
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
