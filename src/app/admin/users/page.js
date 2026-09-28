import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import DeleteButton from '@/components/DeleteButton';

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { laporan: true }
      }
    }
  });
}

export default async function UsersPage() {
  const token = (await cookies()).get('token')?.value;
  if (!token) redirect('/login');

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') redirect('/login');

  const users = await getUsers();

  const user = {
    name: decoded.email,
    role: decoded.role
  };

  return (
    <div className="app-container">
      <Sidebar role="ADMIN" />
      <main className="main-content">
        <Navbar title="Data User" user={user} />
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">👥 Data User</h2>
          </div>
          
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Nomor HP</th>
                  <th>Role</th>
                  <th>Jumlah Laporan</th>
                  <th>Bergabung</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="8">
                      <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <div className="empty-state-title">Belum ada user terdaftar</div>
                        <div className="empty-state-desc">User baru akan muncul di sini setelah mendaftar.</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td><strong>{item.name}</strong></td>
                      <td>{item.email}</td>
                      <td>{item.phone}</td>
                      <td>
                        <span className={`badge ${item.role === 'ADMIN' ? 'badge-approved' : 'badge-pending'}`}>
                          {item.role}
                        </span>
                      </td>
                      <td><strong>{item._count.laporan}</strong></td>
                      <td>{new Date(item.createdAt).toLocaleDateString('id-ID')}</td>
                      <td>
                        <Link href={`/admin/users/${item.id}`} className="btn btn-secondary btn-sm">
                          👁️
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
