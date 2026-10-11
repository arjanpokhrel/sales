import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../offline/db';
import { DESTINATIONS, DESTINATION_CATEGORIES } from '../data/destinations';

export default function DestinationsPage() {
  const { lang } = useLanguage();
  const [items, setItems] = useState(DESTINATIONS);
  const [cat, setCat] = useState('all');

  useEffect(() => {
    db.table('destinations').toArray()
      .then((rows) => { if (rows.length > 0) setItems(rows); })
      .catch(() => {});
  }, []);

  const filtered = cat === 'all' ? items : items.filter((d) => d.category === cat);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">{lang === 'ne' ? 'घुम्ने ठाउँहरू' : 'Destinations'}</h1>
        <p className="text-sm text-slate-400 mt-1">
          {lang === 'ne' ? 'वास्तविक फोटोसहितका प्रमाणित गन्तव्यहरू (अफलाइन)।' : 'Verified destinations with real photos (offline).'}
        </p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DESTINATION_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition ${
              cat === c.id ? 'bg-sky-700 border-sky-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
            {lang === 'ne' ? c.ne : c.en}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => (
          <Link key={d.id} to={`/destinations/${d.id}`}
            className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-sky-700 transition active:scale-[0.99]">
            {d.photo ? (
              <img src={`/photos/${d.photo}.jpg`} alt={d.name_en} className="w-full h-44 object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-44 bg-slate-800 flex flex-col items-center justify-center gap-1 text-slate-500">
                <Camera className="w-6 h-6" />
                <span className="text-[11px]">{lang === 'ne' ? 'फोटो उपलब्ध छैन' : 'Photo unavailable'}</span>
              </div>
            )}
            <div className="p-4">
              <div className="font-bold text-white">{lang === 'ne' ? d.name_ne : d.name_en}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{d.district} · {d.category}{d.elevation_m ? ` · ${d.elevation_m}m` : ''}</div>
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-10">{lang === 'ne' ? 'यस वर्गमा केही छैन।' : 'Nothing in this category yet.'}</p>
      )}
    </div>
  );
}
