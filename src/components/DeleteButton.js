'use client';

export default function DeleteButton({ id, apiPath }) {
  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      fetch(apiPath, { method: 'DELETE', credentials: 'include' })
        .then(() => window.location.reload());
    }
  };

  return (
    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
      🗑️
    </button>
  );
}
