import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';

async function getWilayah(id) {
  return await prisma.wilayah.findUnique({
    where: { id }
  });
}

export default async function WilayahDetailPage({ params }) {
  const { id } = await params;
  const token = (await cookies()).get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') redirect('/login');

  const wilayah = await getWilayah(id);

  const user = {
    name: decoded.email,
    role: decoded.role
  };

  if (!wilayah) {
    return (
      <div className="app-container">
        <Sidebar role="ADMIN" />
        <main className="main-content">
          <Navbar title="Detail Wilayah" user={user} />
          <div className="card">
            <p style={{ color: 'var(--danger)' }}>Data tidak ditemukan</p>
            <Link href="/admin/wilayah" className="btn btn-secondary" style={{ marginTop: '16px' }}>
              Kembali ke Daftar Wilayah
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar role="ADMIN" />
      <main className="main-content">
        <Navbar title="Detail Wilayah" user={user} />
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📍 Detail Wilayah</h2>
            <Link href="/admin/wilayah" className="btn btn-secondary">
              Kembali
            </Link>
          </div>
          
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Nama Wilayah</div>
              <div className="detail-value">{wilayah.name}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Kota Administrasi</div>
              <div className="detail-value">{wilayah.kotaAdministrasi}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Dibuat</div>
              <div className="detail-value">{new Date(wilayah.createdAt).toLocaleDateString('id-ID')}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Diperbarui</div>
              <div className="detail-value">{new Date(wilayah.updatedAt).toLocaleDateString('id-ID')}</div>
            </div>
          </div>

          <div className="form-actions">
            <Link href={`/admin/wilayah/${wilayah.id}/edit`} className="btn btn-warning">
              ✏️ Edit
            </Link>
            <Link href="/admin/wilayah" className="btn btn-secondary">
              Kembali
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
