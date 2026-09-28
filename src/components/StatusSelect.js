'use client';

export default function StatusSelect({ laporanId, currentStatus }) {
  const handleChange = async (e) => {
    const newStatus = e.target.value;
    const res = await fetch(`/api/laporan/${laporanId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      alert('Gagal mengubah status');
      e.target.value = currentStatus;
    } else {
      window.location.reload();
    }
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      className="form-group"
      style={{ padding: '6px 32px 6px 10px', fontSize: '13px', width: 'auto', minWidth: '120px' }}
    >
      <option value="PENDING">PENDING</option>
      <option value="APPROVED">APPROVED</option>
      <option value="REJECTED">REJECTED</option>
    </select>
  );
}
