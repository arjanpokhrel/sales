import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getPhotoManifest } from '../data/photos';
import Lightbox from '../components/Lightbox';

// All bundled real photographs with credits. Every image here is stored
// locally (offline) — see Attribution for licenses.
export default function GalleryPage() {
  const { lang } = useLanguage();
  const [photos, setPhotos] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    getPhotoManifest().then((m) => setPhotos(m.photos || [])).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">{lang === 'ne' ? 'फोटो ग्यालरी' : 'Photo gallery'}</h1>
        <p className="text-sm text-slate-400 mt-1">
          {lang === 'ne'
            ? `${photos.length} वास्तविक फोटोहरू — सबै अफलाइन उपलब्ध, श्रेयसहित।`
            : `${photos.length} real photos — all available offline, with credits.`}
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {photos.map((p) => (
          <button key={p.id} onClick={() => setActive(p)} className="text-left rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-sky-700 transition active:scale-[0.99]">
            <img src={p.file} alt={p.title} className="w-full h-44 sm:h-52 object-cover" loading="lazy" />
            <span className="block px-3 py-2 text-[10px] text-slate-500 truncate">
              📷 {p.author} · {p.license}
            </span>
          </button>
        ))}
      </div>
      {active && (
        <Lightbox
          src={active.file}
          alt={active.title}
          credit={`${active.author} · ${active.license} · Wikimedia Commons`}
          onClose={() => setActive(null)}
        />
      )}
      <Link to="/attribution" className="inline-block text-xs font-bold text-sky-400">
        {lang === 'ne' ? 'सबै स्रोत र लाइसेन्सहरू →' : 'All sources & licenses →'}
      </Link>
    </div>
  );
}
