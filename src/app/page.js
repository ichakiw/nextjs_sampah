'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      icon: '♻️',
      title: 'Rah Lingkungan',
      text: 'Membantu mengurangi pencemaran lingkungan dengan mendorong masyarakat untuk memilah dan mengelola sampah secara lebih bertanggung jawab.',
    },
    {
      icon: '💰',
      title: 'Bernilai Ekonomi',
      text: 'Sampah yang telah dipilih memiliki nilai jual sehingga dapat memberikan manfaat ekonomi sekaligus meningkatkan kesadaran masyarakat.',
    },
    {
      icon: '⚡',
      title: 'Proses Cepat',
      text: 'Laporan dikirim secara digital dan diverifikasi oleh admin sehingga proses menjadi lebih cepat, praktis, dan mudah dipantau.',
    },
    {
      icon: '🔒',
      title: 'Data Aman',
      text: 'Seluruh data pengguna dan laporan tersimpan dengan aman sehingga informasi tetap terlindungi dan mudah diakses kembali.',
    },
  ];

  const steps = [
    { title: 'Login', text: 'Masuk menggunakan akun Anda untuk mengakses fitur Bank Sampah Digital.' },
    { title: 'Tambah Laporan Sampah', text: 'Buat laporan sampah dengan mengisi jenis, wilayah, berat, dan foto bukti.' },
    { title: 'Admin Memverifikasi', text: 'Admin melakukan verifikasi dan menentukan status laporan secara cepat.' },
    { title: 'Approved / Rejected', text: 'Lihat hasil verifikasi melalui status laporan yang diperbarui secara real-time.' },
    { title: 'Riwayat & Detail Transaksi', text: 'Pantau riwayat laporan dan detail transaksi yang sudah disetujui.' },
  ];

  const faqs = [
    {
      q: 'Apa itu Bank Sampah Digital?',
      a: 'Bank Sampah Digital adalah platform untuk memudahkan masyarakat dalam melaporkan, memantau, dan mencatat penjualan sampah yang sudah dipilih secara cepat dan transparan.',
    },
    {
      q: 'Bagaimana cara membuat laporan?',
      a: 'Pilih jenis sampah, wilayah, input berat, upload foto bukti, lalu kirim. Admin akan memverifikasi laporan Anda.',
    },
    {
      q: 'Berapa lama proses verifikasi?',
      a: 'Proses verifikasi biasanya cepat dan dilakukan oleh admin. Anda dapat memantau status secara langsung di halaman laporan.',
    },
    {
      q: 'Bagaimana transaksi dilakukan?',
      a: 'Setelah laporan disetujui, data transaksi akan tercatat dan dapat dilihat di menu Transaksi beserta detail dan bukti foto.',
    },
  ];

  return (
    <div className="landing">
      <nav className={`landing-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span>♻️</span>
            <span>Bank Sampah Digital</span>
          </div>
          <ul className="landing-nav-links">
            <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home'); }}>Home</a></li>
            <li><a href="#tentang" onClick={(e) => { e.preventDefault(); scrollTo('tentang'); }}>Tentang</a></li>
            <li><a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo('faq'); }}>FAQ</a></li>
          </ul>
          <Link href="/login" className="btn btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>
            Login
          </Link>
        </div>
      </nav>

      <section id="home" className="landing-hero">
        <div>
          <h1 className="landing-hero-title">Kelola Sampah Menjadi Lebih Bernilai</h1>
          <p className="landing-hero-subtitle">
            Laporkan sampah dengan mudah, pantau proses verifikasi, dan lihat hasil transaksi secara cepat dan transparan.
          </p>
          <div className="landing-hero-actions">
            <button onClick={() => scrollTo('tentang')} className="btn btn-primary" style={{ padding: '12px 22px' }}>
              Pelajari
            </button>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '12px 22px' }}>
              Login
            </Link>
          </div>
        </div>
        <div className="landing-hero-illustration" aria-hidden="true">
          <img
            src="/image/kebersihan-lingkungan.jpg"
            alt="Ilustrasi Bank Sampah Digital"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '20px',
              objectFit: 'cover',
            }}
          />
        </div>
      </section>

      <section id="tentang" className="section">
        <div className="section-inner">
          <h2 className="section-title">Mengapa Memilih Bank Sampah?</h2>
          <p className="section-desc">
            Kami menghadirkan pengelolaan sampah yang lebih sederhana, transparan, dan bernilai untuk masyarakat maupun lingkungan.
          </p>
          <div>
            {features.map((item) => (
              <div key={item.title} className="feature-card">
                <div className="feature-icon">{item.icon}</div>
                <div>
                  <div className="feature-title">{item.title}</div>
                  <div className="feature-text">{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="section-inner">
          <h2 className="section-title">Cara Kerja</h2>
          <p className="section-desc">
            Ikuti langkah sederhana untuk mulai mengelola laporan sampah Anda dengan sistem yang mudah diakses.
          </p>
          <div className="steps">
            {steps.map((item) => (
              <div key={item.title} className="step">
                <div className="step-title">{item.title}</div>
                <div className="step-text">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section">
        <div className="section-inner">
          <h2 className="section-title">FAQ</h2>
          <p className="section-desc">
            Temukan jawaban cepat untuk pertanyaan yang sering diajukan seputar layanan Bank Sampah Digital.
          </p>
          <div className="accordion">
            {faqs.map((item, idx) => (
              <div key={item.q} className="accordion-item">
                <button
                  className="accordion-trigger"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={openFaq === idx}
                >
                  <span>{item.q}</span>
                  <span style={{ fontSize: 18, color: 'var(--muted)' }}>{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && <div className="accordion-panel">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        © {new Date().getFullYear()} Bank Sampah Digital. All rights reserved.
      </footer>
    </div>
  );
}
