import React, { useEffect } from 'react';
import { X } from 'lucide-react';

// Fullscreen HD photo viewer. Tap anywhere or press Escape to close.
export default function Lightbox({ src, alt, credit, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-800/90 text-white"
        onClick={onClose} aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={src} alt={alt || ''}
        className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      {credit && (
        <p className="text-[11px] text-slate-400 mt-3">📷 {credit}</p>
      )}
    </div>
  );
}
