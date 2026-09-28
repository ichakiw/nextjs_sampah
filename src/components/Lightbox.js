'use client';

import Image from 'next/image';
import { useEffect } from 'react';

export default function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>
          ✕
        </button>
        <Image
          src={src}
          alt={alt || 'Foto'}
          width={800}
          height={600}
          style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '85vh', borderRadius: 'var(--radius)' }}
        />
      </div>
    </div>
  );
}
