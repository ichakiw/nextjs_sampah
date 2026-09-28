import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import DeleteButton from '@/components/DeleteButton';

async function getJenisSampah() {
  return await prisma.jenisSampah.findMany({
    orderBy: { name: 'asc' }
  });
}

export default async function JenisSampahPage() {
  const token = (await cookies()).get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') redirect('/login');

  const jenisSampah = await getJenisSampah();

  const user = {
    name: decoded.email,
    role: decoded.role
  };

  return (
    <div className="app-container">
      <Sidebar role="ADMIN" />
      <main className="main-content">
        <Navbar title="Jenis Sampah" user={user} />
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🗑️ Data Jenis Sampah</h2>
            <Link href="/admin/jenis-sampah/create" className="btn btn-primary">
              + Tambah Jenis Sampah
            </Link>
          </div>
          
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Jenis Sampah</th>
                  <th>Harga / Kg</th>
                  <th>Dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {jenisSampah.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-state" style={{ padding: '40px' }}>
                        <div className="empty-state-icon">🗑️</div>
                        <div className="empty-state-title">Belum ada data jenis sampah</div>
                        <div className="empty-state-desc">Tambahkan jenis sampah pertama Anda.</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  jenisSampah.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td><strong>{item.name}</strong></td>
                      <td><strong>Rp {item.price.toLocaleString('id-ID')}</strong></td>
                      <td>{new Date(item.createdAt).toLocaleDateString('id-ID')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link href={`/admin/jenis-sampah/${item.id}`} className="btn btn-secondary btn-sm">
                            👁️
                          </Link>
                          <Link href={`/admin/jenis-sampah/${item.id}/edit`} className="btn btn-warning btn-sm">
                            ✏️
                          </Link>
                          <DeleteButton id={item.id} apiPath={`/api/jenis-sampah/${item.id}`} />
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
