import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import Image from 'next/image';

async function getUser(id) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      laporan: {
        include: {
          jenisSampah: true,
          wilayah: true,
          foto: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

export default async function UserDetailPage({ params }) {
  const { id } = await params;
  const token = (await cookies()).get('token')?.value;
  if (!token || !id) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') redirect('/login');

  const user = await getUser(id);

  if (!user) {
    return notFound();
  }

  return (
    <div className="app-container">
      <Sidebar role="ADMIN" />
      <main className="main-content">
        <Navbar title={`Detail User: ${user.name}`} user={{ name: decoded.email, role: decoded.role }} />
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">👤 Informasi User</h2>
            <Link href="/admin/users" className="btn btn-secondary">
              Kembali
            </Link>
          </div>
          
          <div className="detail-grid" style={{ marginBottom: '24px' }}>
            <div>
              <div className="detail-item">
                <div className="detail-label">Nama</div>
                <div className="detail-value">{user.name}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Email</div>
                <div className="detail-value">{user.email}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Nomor HP</div>
                <div className="detail-value">{user.phone}</div>
              </div>
            </div>
            <div>
              <div className="detail-item">
                <div className="detail-label">Role</div>
                <div className="detail-value">
                  <span className={`badge ${user.role === 'ADMIN' ? 'badge-approved' : 'badge-pending'}`}>{user.role}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Total Laporan</div>
                <div className="detail-value">{user.laporan.length}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Bergabung</div>
                <div className="detail-value">{new Date(user.createdAt).toLocaleDateString('id-ID')}</div>
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: '16px' }}>📋 Daftar Laporan User</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Jenis Sampah</th>
                  <th>Wilayah</th>
                  <th>Berat (Kg)</th>
                  <th>Total Harga</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {user.laporan.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="empty-state" style={{ padding: '30px' }}>
                        <div className="empty-state-desc">User belum memiliki laporan</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  user.laporan.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.jenisSampah.name}</td>
                      <td>{item.wilayah.name}</td>
                      <td>{item.weight}</td>
                      <td><strong>Rp {item.totalPrice.toLocaleString('id-ID')}</strong></td>
                      <td>
                        <span className={`badge badge-${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString('id-ID')}</td>
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
