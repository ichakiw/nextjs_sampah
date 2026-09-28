'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ role }) {
  const pathname = usePathname();

  const adminMenus = [
    { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { href: '/admin/users', icon: '👥', label: 'User' },
    { href: '/admin/jenis-sampah', icon: '🗑️', label: 'Jenis Sampah' },
    { href: '/admin/wilayah', icon: '📍', label: 'Wilayah' },
    { href: '/admin/laporan', icon: '📋', label: 'Laporan' },
    { href: '/admin/transaksi', icon: '💰', label: 'Transaksi' },
  ];

  const userMenus = [
    { href: '/user/dashboard', icon: '📊', label: 'Dashboard' },
    { href: '/user/laporan', icon: '📋', label: 'Laporan Saya' },
    { href: '/user/riwayat', icon: '📜', label: 'Riwayat' },
  ];

  const menus = role === 'ADMIN' ? adminMenus : userMenus;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>♻️ Bank Sampah</h2>
        <span>{role === 'ADMIN' ? 'Admin Panel' : 'User Panel'}</span>
      </div>
      <ul className="sidebar-menu">
        {menus.map((menu) => (
          <li key={menu.href}>
            <Link
              href={menu.href}
              className={pathname === menu.href ? 'active' : ''}
            >
              <span className="icon">{menu.icon}</span>
              {menu.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
