'use client';

export default function UserSelect({ laporanId, currentUserId, users }) {
  const handleChange = async (e) => {
    const newUserId = e.target.value;
    const res = await fetch(`/api/laporan/${laporanId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId: newUserId }),
    });
    if (!res.ok) {
      alert('Gagal mengubah user');
      e.target.value = currentUserId;
    } else {
      window.location.reload();
    }
  };

  return (
    <select
      value={currentUserId}
      onChange={handleChange}
      className="form-group"
      style={{ padding: '6px 32px 6px 10px', fontSize: '13px', width: 'auto', minWidth: '180px' }}
    >
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name} ({user.email})
        </option>
      ))}
    </select>
  );
}
