'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ClickableImage from '@/components/ClickableImage';

export default function TransaksiDetailPage({ params }) {
  const { id } = use(params);
  const [transaksi, setTransaksi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
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

        const res = await fetch(`/api/transaksi/${id}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setTransaksi(data);
        } else {
          setError('Transaksi tidak ditemukan');
        }
      } catch (err) {
        setError('Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
            <li><Link href="/admin/laporan">📋 Laporan</Link></li>
            <li><Link href="/admin/transaksi" className="active">💰 Transaksi</Link></li>
          </ul>
        </aside>
        <main className="main-content">
          <nav className="navbar">
            <h1 className="navbar-title">Detail Transaksi</h1>
            <div className="navbar-user">
              <span>👋 Admin</span>
              <button className="logout-btn">Logout</button>
            </div>
          </nav>
          <div className="card">
            <div className="skeleton" style={{ height: '500px' }}></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !transaksi) {
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
            <li><Link href="/admin/laporan">📋 Laporan</Link></li>
            <li><Link href="/admin/transaksi" className="active">💰 Transaksi</Link></li>
          </ul>
        </aside>
        <main className="main-content">
          <nav className="navbar">
            <h1 className="navbar-title">Detail Transaksi</h1>
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
            <p style={{ color: 'var(--danger)', fontSize: '16px' }}>{error || 'Transaksi tidak ditemukan'}</p>
            <Link href="/admin/transaksi" className="btn btn-secondary" style={{ marginTop: '16px' }}>
              Kembali ke Daftar Transaksi
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
          <li><Link href="/admin/laporan">📋 Laporan</Link></li>
          <li><Link href="/admin/transaksi" className="active">💰 Transaksi</Link></li>
        </ul>
      </aside>
      <main className="main-content">
        <nav className="navbar">
          <h1 className="navbar-title">Detail Transaksi</h1>
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
        
        <div className="transaksi-card">
          <div className="transaksi-card-header">
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#14532d' }}>
                ✅ Transaksi Berhasil
              </h2>
              <p style={{ fontSize: '14px', color: '#166534', marginTop: '4px', fontWeight: 500 }}>
                {new Date(transaksi.updatedAt).toLocaleString('id-ID')}
              </p>
            </div>
            <Link href="/admin/transaksi" className="btn btn-secondary">
              Kembali
            </Link>
          </div>

          {transaksi.foto && (
            <div style={{ width: '100%', height: '300px', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <ClickableImage
                src={transaksi.foto.imageUrl}
                alt="Foto Sampah"
                width={800}
                height={300}
                style={{ width: '100%', height: '300px', objectFit: 'cover' }}
              />
            </div>
          )}

          <div className="transaksi-card-body">
            <div>
              <div className="detail-label">Nama User</div>
              <div className="detail-value" style={{ marginBottom: '16px' }}>{transaksi.user.name}</div>
              <div className="detail-label">Email</div>
              <div className="detail-value" style={{ marginBottom: '16px' }}>{transaksi.user.email}</div>
              <div className="detail-label">Nomor HP</div>
              <div className="detail-value">{transaksi.user.phone}</div>
            </div>
            <div>
              <div className="detail-label">Jenis Sampah</div>
              <div className="detail-value" style={{ marginBottom: '16px' }}>{transaksi.jenisSampah.name}</div>
              <div className="detail-label">Harga per Kg</div>
              <div className="detail-value" style={{ marginBottom: '16px' }}>
                Rp {transaksi.jenisSampah.price.toLocaleString('id-ID')}
              </div>
              <div className="detail-label">Wilayah</div>
              <div className="detail-value">{transaksi.wilayah.name}</div>
            </div>
          </div>

          <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', borderTop: '1px solid var(--border)', background: '#f8fafc' }}>
            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>
              <div className="detail-label" style={{ marginBottom: '4px' }}>Berat</div>
              <div className="detail-value" style={{ fontSize: '20px' }}>{transaksi.weight} Kg</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>
              <div className="detail-label" style={{ marginBottom: '4px' }}>Total Harga</div>
              <div className="detail-value" style={{ fontSize: '20px', color: 'var(--primary)', fontWeight: 700 }}>
                Rp {Number(transaksi.totalPrice).toLocaleString('id-ID')}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'white', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>
              <div className="detail-label" style={{ marginBottom: '4px' }}>Status</div>
              <div className="detail-value">
                <span className="badge badge-approved">APPROVED</span>
              </div>
            </div>
          </div>

          <div className="transaksi-card-footer">
            <div className="detail-label" style={{ marginBottom: '12px' }}>Informasi Lengkap</div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Tanggal Laporan</div>
                <div className="detail-value">{new Date(transaksi.tanggalLaporan).toLocaleString('id-ID')}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Terakhir Diperbarui</div>
                <div className="detail-value">{new Date(transaksi.updatedAt).toLocaleString('id-ID')}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">ID Laporan</div>
                <div className="detail-value" style={{ fontFamily: 'monospace', fontSize: '13px' }}>{transaksi.id}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">ID User</div>
                <div className="detail-value" style={{ fontFamily: 'monospace', fontSize: '13px' }}>{transaksi.userId}</div>
              </div>
            </div>
          </div>
        </div>

        {lightboxImg && (
          <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={() => setLightboxImg(null)}>
                ✕
              </button>
              <Image src={lightboxImg} alt="Foto Sampah" width={1000} height={800} style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: 'var(--radius)' }} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
