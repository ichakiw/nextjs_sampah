'use client';

import { useRouter } from 'next/navigation';

export default function Navbar({ title, user }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <nav className="navbar">
      <h1 className="navbar-title">{title}</h1>
      <div className="navbar-user">
        <span>👋 {user?.name}</span>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}
