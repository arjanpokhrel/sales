import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getPhotoManifest } from '../data/photos';

// Every photo + dataset source, visible in-app (store-policy requirement).
export default function AttributionPage() {
  const { lang } = useLanguage();
  const [photos, setPhotos] = useState([]);
  useEffect(() => {
    getPhotoManifest().then((m) => setPhotos(m.photos || [])).catch(() => {});
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <h1 className="text-2xl sm:text-3xl font-black text-white">{lang === 'ne' ? 'स्रोत र श्रेय' : 'Data sources & credits'}</h1>
      <section className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-300 space-y-2">
        <h2 className="font-bold text-white">🗺️ {lang === 'ne' ? 'नक्सा र प्रशासनिक' : 'Maps & admin'}</h2>
        <p className="text-xs leading-relaxed">
          © OpenStreetMap contributors (ODbL) · Tiles served live by the OSM tile servers under the
          tile usage policy (cached on-device after viewing; no bulk downloads). Province/district
          lists follow the Constitution of Nepal 2015. Boundary pins are approximate guides.
        </p>
      </section>
      <section className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="font-bold text-white text-sm mb-2">📷 {lang === 'ne' ? `फोटोहरू (${photos.length})` : `Photos (${photos.length})`} — Wikimedia Commons</h2>
        <div className="space-y-2">
          {photos.map((p) => (
            <div key={p.id} className="text-xs text-slate-300">
              <span className="font-semibold text-white">{p.id}</span>
              {' · '}{p.author} · {p.license}
              {' · '}<a href={p.source} target="_blank" rel="noreferrer" className="text-sky-400 underline">source</a>
            </div>
          ))}
        </div>
      </section>
      <section className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-300">
        <h2 className="font-bold text-white">🚨 {lang === 'ne' ? 'आपतकालीन नम्बर' : 'Emergency numbers'}</h2>
        <p className="text-xs mt-1">Nepal Police / NEOC public listings · {lang === 'ne' ? 'प्रमाणित' : 'verified'} 2026-10-11 · dialer via <code>tel:</code>, no auto-calling.</p>
      </section>
    </div>
  );
}
