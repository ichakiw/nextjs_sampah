'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function CreateLaporanPage() {
  const [formData, setFormData] = useState({
    jenisSampahId: '',
    wilayahId: '',
    weight: '',
    foto: null
  });
  const [jenisSampah, setJenisSampah] = useState([]);
  const [wilayah, setWilayah] = useState([]);
  const [selectedJenis, setSelectedJenis] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/auth/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }

        const jenisRes = await fetch('/api/jenis-sampah');
        if (jenisRes.ok) {
          const data = await jenisRes.json();
          setJenisSampah(data);
        }

        const wilayahRes = await fetch('/api/wilayah');
        if (wilayahRes.ok) {
          const data = await wilayahRes.json();
          setWilayah(data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  const handleJenisChange = (e) => {
    const id = e.target.value;
    setFormData({ ...formData, jenisSampahId: id });
    const jenis = jenisSampah.find(j => j.id === id);
    setSelectedJenis(jenis);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, foto: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.foto);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      if (!uploadRes.ok) {
        throw new Error('Gagal upload foto');
      }

      const uploadData = await uploadRes.json();
      setUploading(false);

      const res = await fetch('/api/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenisSampahId: formData.jenisSampahId,
          wilayahId: formData.wilayahId,
          weight: parseFloat(formData.weight),
          fotoUrl: uploadData.url
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Laporan berhasil dibuat!');
        setTimeout(() => router.push('/user/laporan'), 1500);
      } else {
        setError(data.message || 'Gagal membuat laporan');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const totalPrice = selectedJenis && formData.weight 
    ? parseFloat(formData.weight) * selectedJenis.price 
    : 0;

  const groupedWilayah = wilayah.reduce((acc, item) => {
    const key = item.kotaAdministrasi || 'Lainnya';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>♻️ Bank Sampah</h2>
          <span>User Panel</span>
        </div>
        <ul className="sidebar-menu">
          <li><Link href="/user/dashboard">📊 Dashboard</Link></li>
          <li><Link href="/user/laporan" className="active">📋 Laporan Saya</Link></li>
          <li><Link href="/user/riwayat">📜 Riwayat</Link></li>
        </ul>
      </aside>
      <main className="main-content">
        <nav className="navbar">
          <h1 className="navbar-title">Buat Laporan Baru</h1>
          <div className="navbar-user">
            <span>👋 {user?.name || 'User'}</span>
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

            {fetching ? (
              <div className="skeleton" style={{ height: '400px' }}></div>
            ) : (
              <>
                <div className="form-group">
                  <label>Jenis Sampah *</label>
                  <select
                    value={formData.jenisSampahId}
                    onChange={handleJenisChange}
                    required
                  >
                    <option value="">Pilih Jenis Sampah</option>
                    {jenisSampah.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - Rp {item.price.toLocaleString('id-ID')}/kg
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Wilayah *</label>
                  <select
                    value={formData.wilayahId}
                    onChange={(e) => setFormData({ ...formData, wilayahId: e.target.value })}
                    required
                  >
                    <option value="">Pilih Wilayah</option>
                    {Object.entries(groupedWilayah).map(([kota, items]) => (
                      <optgroup key={kota} label={kota}>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Berat (Kg) *</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                required
                min="0.1"
                step="0.1"
                placeholder="Contoh: 2.5"
              />
            </div>

            {selectedJenis && formData.weight && (
              <div style={{ 
                padding: '16px', 
                background: 'var(--primary-light)', 
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
                border: '1px solid #bbf7d0'
              }}>
                <p style={{ fontWeight: 600, color: '#15803d' }}>
                  Total Harga: Rp {totalPrice.toLocaleString('id-ID')}
                </p>
                <small style={{ color: 'var(--muted)' }}>
                  {formData.weight} kg × Rp {selectedJenis.price.toLocaleString('id-ID')}/kg
                </small>
              </div>
            )}

            <div className="form-group">
              <label>Foto Bukti *</label>
              <input
                type="file"
                onChange={handleFileChange}
                required
                accept="image/*"
              />
              {preview && (
                <div style={{ marginTop: '12px' }}>
                  <Image
                    src={preview}
                    alt="Preview"
                    width={120}
                    height={120}
                    className="img-thumb"
                    style={{ width: '120px', height: '120px' }}
                  />
                </div>
              )}
              <small style={{ color: 'var(--muted)', display: 'block', marginTop: '6px' }}>
                Upload foto sampah sebagai bukti
              </small>
            </div>

            <div className="form-actions">
              <Link href="/user/laporan" className="btn btn-secondary">
                Kembali
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || uploading || fetching}
              >
                {uploading ? 'Upload foto...' : loading ? 'Menyimpan...' : 'Kirim Laporan'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
