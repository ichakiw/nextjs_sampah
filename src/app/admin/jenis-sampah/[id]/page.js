import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';

async function getJenisSampah(id) {
  return await prisma.jenisSampah.findUnique({
    where: { id }
  });
}

export default async function JenisSampahDetailPage({ params }) {
  const { id } = await params;
  const token = (await cookies()).get('token')?.value;
  if (!token || !id) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') redirect('/login');

  const jenis = await getJenisSampah(id);

  const user = {
    name: decoded.email,
    role: decoded.role
  };

  if (!jenis) {
    return notFound();
  }

  return (
    <div className="app-container">
      <Sidebar role="ADMIN" />
      <main className="main-content">
        <Navbar title="Detail Jenis Sampah" user={user} />
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🗑️ Detail Jenis Sampah</h2>
            <Link href="/admin/jenis-sampah" className="btn btn-secondary">
              Kembali
            </Link>
          </div>
          
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Nama Jenis Sampah</div>
              <div className="detail-value">{jenis.name}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Harga per Kilogram</div>
              <div className="detail-value">Rp {jenis.price.toLocaleString('id-ID')}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Dibuat</div>
              <div className="detail-value">{new Date(jenis.createdAt).toLocaleDateString('id-ID')}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Diperbarui</div>
              <div className="detail-value">{new Date(jenis.updatedAt).toLocaleDateString('id-ID')}</div>
            </div>
          </div>

          <div className="form-actions">
            <Link href={`/admin/jenis-sampah/${jenis.id}/edit`} className="btn btn-warning">
              ✏️ Edit
            </Link>
            <Link href="/admin/jenis-sampah" className="btn btn-secondary">
              Kembali
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
