'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ClickableImage({ src, alt, width, height, className, style, objectFit = 'cover' }) {
  const [lightbox, setLightbox] = useState(false);

  if (!src) {
    return (
      <div className="img-placeholder" style={{ width: width || 50, height: height || 50 }}>
        📷
      </div>
    );
  }

  return (
    <>
      <Image
        src={src}
        alt={alt || 'Foto'}
        width={width || 50}
        height={height || 50}
        className={className}
        style={{ ...style, cursor: 'pointer' }}
        onClick={() => setLightbox(true)}
      />
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(false)}>
              ✕
            </button>
            <Image
              src={src}
              alt={alt || 'Foto'}
              width={1000}
              height={800}
              style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '85vh', borderRadius: 'var(--radius)' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
