'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LaporanDetailPage({ params }) {
  const { id } = use(params);
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('');
  const [weight, setWeight] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [lightboxImg, setLightboxImg] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }

        const res = await fetch(`/api/laporan/${id}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setLaporan(data);
          setStatus(data.status);
          setWeight(data.weight.toString());
        } else {
          setError('Laporan tidak ditemukan');
        }
      } catch (err) {
        setError('Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    try {
      const res = await fetch(`/api/laporan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          weight: parseFloat(weight),
          status
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Laporan berhasil diupdate!');
        setLaporan(data);
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setMessage(data.message || 'Gagal mengupdate');
      }
    } catch (err) {
      setMessage('Terjadi kesalahan');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <h2>♻️ Bank Sampah</h2>
            <span>Admin Panel</span>
          </div>
          <ul className="sidebar-menu">
            <li><Link href="/admin/dashboard">📊 Dashboard</Link></li>
            <li><Link href="/admin/users">👥 User</Link></li>
            <li><Link href="/admin/jenis-sampah">🗑️ Jenis Sampah</Link></li>
            <li><Link href="/admin/wilayah">📍 Wilayah</Link></li>
            <li><Link href="/admin/laporan" className="active">📋 Laporan</Link></li>
            <li><Link href="/admin/transaksi">💰 Transaksi</Link></li>
          </ul>
        </aside>
        <main className="main-content">
          <nav className="navbar">
            <h1 className="navbar-title">Detail Laporan</h1>
            <div className="navbar-user">
              <span>👋 Admin</span>
              <button className="logout-btn">Logout</button>
            </div>
          </nav>
          <div className="card">
            <div className="skeleton" style={{ height: '400px' }}></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !laporan) {
    return (
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <h2>♻️ Bank Sampah</h2>
            <span>Admin Panel</span>
          </div>
          <ul className="sidebar-menu">
            <li><Link href="/admin/dashboard">📊 Dashboard</Link></li>
            <li><Link href="/admin/users">👥 User</Link></li>
            <li><Link href="/admin/jenis-sampah">🗑️ Jenis Sampah</Link></li>
            <li><Link href="/admin/wilayah">📍 Wilayah</Link></li>
            <li><Link href="/admin/laporan" className="active">📋 Laporan</Link></li>
            <li><Link href="/admin/transaksi">💰 Transaksi</Link></li>
          </ul>
        </aside>
        <main className="main-content">
          <nav className="navbar">
            <h1 className="navbar-title">Detail Laporan</h1>
            <div className="navbar-user">
              <span>👋 {user?.name || 'Admin'}</span>
              <button 
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  router.push('/login');
                }}
                className="logout-btn"
              >
                Logout
              </button>
            </div>
          </nav>
          <div className="card">
            <p style={{ color: 'var(--danger)' }}>{error || 'Laporan tidak ditemukan'}</p>
            <Link href="/admin/laporan" className="btn btn-secondary" style={{ marginTop: '16px' }}>
              Kembali
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>♻️ Bank Sampah</h2>
          <span>Admin Panel</span>
        </div>
        <ul className="sidebar-menu">
          <li><Link href="/admin/dashboard">📊 Dashboard</Link></li>
          <li><Link href="/admin/users">👥 User</Link></li>
          <li><Link href="/admin/jenis-sampah">🗑️ Jenis Sampah</Link></li>
          <li><Link href="/admin/wilayah">📍 Wilayah</Link></li>
          <li><Link href="/admin/laporan" className="active">📋 Laporan</Link></li>
          <li><Link href="/admin/transaksi">💰 Transaksi</Link></li>
        </ul>
      </aside>
      <main className="main-content">
        <nav className="navbar">
          <h1 className="navbar-title">Detail Laporan</h1>
          <div className="navbar-user">
            <span>👋 {user?.name || 'Admin'}</span>
            <button 
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/login');
              }}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </nav>
        
        {message && (
          <div className={`alert ${message.includes('berhasil') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📋 Informasi Laporan</h2>
            <Link href="/admin/laporan" className="btn btn-secondary">
              Kembali
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', padding: '20px', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <div className="detail-label" style={{ marginBottom: '4px' }}>User</div>
              <div className="detail-value" style={{ marginBottom: '12px' }}>{laporan.user.name}</div>
              <div className="detail-label" style={{ marginBottom: '4px' }}>Email</div>
              <div className="detail-value" style={{ marginBottom: '12px' }}>{laporan.user.email}</div>
              <div className="detail-label" style={{ marginBottom: '4px' }}>Nomor HP</div>
              <div className="detail-value">{laporan.user.phone}</div>
            </div>
            <div>
              <div className="detail-label" style={{ marginBottom: '4px' }}>Jenis Sampah</div>
              <div className="detail-value" style={{ marginBottom: '12px' }}>{laporan.jenisSampah.name}</div>
              <div className="detail-label" style={{ marginBottom: '4px' }}>Harga/Kg</div>
              <div className="detail-value" style={{ marginBottom: '12px' }}>Rp {laporan.jenisSampah.price.toLocaleString('id-ID')}</div>
              <div className="detail-label" style={{ marginBottom: '4px' }}>Wilayah</div>
              <div className="detail-value">{laporan.wilayah.name}</div>
            </div>
          </div>

          {laporan.foto && (
            <div style={{ marginBottom: '24px' }}>
              <div className="detail-label" style={{ marginBottom: '8px' }}>Foto Bukti</div>
              <Image 
                src={laporan.foto.imageUrl} 
                alt="Foto sampah" 
                width={200}
                height={200}
                className="img-thumb"
                style={{ width: '200px', height: '200px' }}
                onClick={() => setLightboxImg(laporan.foto.imageUrl)}
              />
            </div>
          )}

          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label>Berat (Kg) *</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  min="0.1"
                  step="0.1"
                />
                <small style={{ color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
                  Total harga akan dihitung otomatis
                </small>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
              <div className="detail-label" style={{ marginBottom: '4px' }}>Total Harga</div>
              <div className="detail-value" style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>
                Rp {((parseFloat(weight || 0) || 0) * laporan.jenisSampah.price).toLocaleString('id-ID')}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={updating}>
                {updating ? 'Menyimpan...' : 'Update Laporan'}
              </button>
            </div>
          </form>
        </div>

        {lightboxImg && (
          <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={() => setLightboxImg(null)}>
                ✕
              </button>
              <Image src={lightboxImg} alt="Foto Sampah" width={800} height={600} style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '85vh' }} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
