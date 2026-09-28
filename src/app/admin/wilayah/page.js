import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import DeleteButton from '@/components/DeleteButton';

async function getWilayah() {
  return await prisma.wilayah.findMany({
    orderBy: { name: 'asc' }
  });
}

export default async function WilayahPage() {
  const token = (await cookies()).get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') redirect('/login');

  const wilayah = await getWilayah();

  const user = {
    name: decoded.email,
    role: decoded.role
  };

  return (
    <div className="app-container">
      <Sidebar role="ADMIN" />
      <main className="main-content">
        <Navbar title="Wilayah" user={user} />
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📍 Data Wilayah</h2>
            <Link href="/admin/wilayah/create" className="btn btn-primary">
              + Tambah Wilayah
            </Link>
          </div>
          
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kota Administrasi</th>
                  <th>Nama Wilayah</th>
                  <th>Dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {wilayah.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-state" style={{ padding: '40px' }}>
                        <div className="empty-state-icon">📍</div>
                        <div className="empty-state-title">Belum ada data wilayah</div>
                        <div className="empty-state-desc">Tambahkan wilayah pertama Anda.</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  wilayah.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td><strong>{item.kotaAdministrasi}</strong></td>
                      <td>{item.name}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString('id-ID')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link href={`/admin/wilayah/${item.id}`} className="btn btn-secondary btn-sm">
                            👁️
                          </Link>
                          <Link href={`/admin/wilayah/${item.id}/edit`} className="btn btn-warning btn-sm">
                            ✏️
                          </Link>
                          <DeleteButton id={item.id} apiPath={`/api/wilayah/${item.id}`} />
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
