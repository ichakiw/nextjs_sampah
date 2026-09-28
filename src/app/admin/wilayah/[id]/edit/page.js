'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditWilayahPage({ params }) {
  const { id } = use(params);
  const [formData, setFormData] = useState({ name: '', kotaAdministrasi: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, wilayahRes] = await Promise.all([
          fetch('/api/auth/me', { credentials: 'include' }),
          fetch(`/api/wilayah/${params.id}`, { credentials: 'include' })
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }

        if (wilayahRes.ok) {
          const data = await wilayahRes.json();
          setFormData({
            name: data.name,
            kotaAdministrasi: data.kotaAdministrasi
          });
        } else {
          setError('Data wilayah tidak ditemukan');
        }
      } catch (err) {
        setError('Gagal memuat data');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`/api/wilayah/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Wilayah berhasil diperbarui!');
        setTimeout(() => router.push('/admin/wilayah'), 1500);
      } else {
        setError(data.message || 'Gagal memperbarui data');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <h2>♻️ Bank Sampah</h2>
            <span>Admin Panel</span>
          </div>
          <ul className="sidebar-menu">
            <li><Link href="/admin/dashboard" className="">📊 Dashboard</Link></li>
            <li><Link href="/admin/users" className="">👥 User</Link></li>
            <li><Link href="/admin/jenis-sampah" className="">🗑️ Jenis Sampah</Link></li>
            <li><Link href="/admin/wilayah" className="active">📍 Wilayah</Link></li>
            <li><Link href="/admin/laporan" className="">📋 Laporan</Link></li>
            <li><Link href="/admin/transaksi" className="">💰 Transaksi</Link></li>
          </ul>
        </aside>
        <main className="main-content">
          <div className="card">
            <div className="skeleton" style={{ height: '400px' }}></div>
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
          <li><Link href="/admin/wilayah" className="active">📍 Wilayah</Link></li>
          <li><Link href="/admin/laporan">📋 Laporan</Link></li>
          <li><Link href="/admin/transaksi">💰 Transaksi</Link></li>
        </ul>
      </aside>
      <main className="main-content">
        <nav className="navbar">
          <h1 className="navbar-title">Edit Wilayah</h1>
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
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form-group">
              <label>Nama Wilayah *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Contoh: Jakarta Selatan"
              />
            </div>

            <div className="form-group">
              <label>Kota Administrasi *</label>
              <select
                value={formData.kotaAdministrasi}
                onChange={(e) => setFormData({ ...formData, kotaAdministrasi: e.target.value })}
                required
              >
                <option value="">Pilih Kota Administrasi</option>
                <option value="Jakarta Pusat">Jakarta Pusat</option>
                <option value="Jakarta Barat">Jakarta Barat</option>
                <option value="Jakarta Selatan">Jakarta Selatan</option>
                <option value="Jakarta Timur">Jakarta Timur</option>
                <option value="Jakarta Utara">Jakarta Utara</option>
                <option value="Kepulauan Seribu">Kepulauan Seribu</option>
              </select>
            </div>

            <div className="form-actions">
              <Link href="/admin/wilayah" className="btn btn-secondary">
                Kembali
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
