import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, History, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getBookmarks, getRecents, db } from '../offline/db';

export default function BookmarksPage() {
  const { lang } = useLanguage();
  const [marks, setMarks] = useState([]);
  const [recents, setRecents] = useState([]);

  const load = async () => {
    try {
      setMarks(await getBookmarks());
      setRecents(await getRecents());
    } catch { /* private mode */ }
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    await db.table('bookmarks').delete(id).catch(() => {});
    load();
  };

  const linkFor = (b) => {
    if (b.kind === 'destination') return `/destinations/${b.refId}`;
    if (b.kind === 'location') return `/places/${b.refId}`;
    return null;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-7">
      <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
        <Bookmark className="w-7 h-7 text-emerald-400" />
        {lang === 'ne' ? 'बुकमार्क' : 'Bookmarks'}
      </h1>
      {marks.length === 0 ? (
        <div className="p-6 text-center rounded-2xl border border-dashed border-slate-700 text-sm text-slate-400">
          {lang === 'ne'
            ? 'अहिलेसम्म केही सुरक्षित छैन। गन्तव्य वा स्थानमा 🔖 थिच्नुहोस्।'
            : 'Nothing saved yet. Tap 🔖 on any destination or place.'}
        </div>
      ) : (
        <div className="space-y-2">
          {marks.map((b) => {
            const to = linkFor(b);
            const row = (
              <div className="flex-1">
                <div className="font-semibold text-white text-sm">{lang === 'ne' ? (b.title_ne || b.title_en) : (b.title_en || b.title_ne)}</div>
                <div className="text-[11px] text-slate-500">{b.kind}</div>
              </div>
            );
            return (
              <div key={b.id} className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
                {to ? <Link to={to} className="flex-1">{row}</Link> : row}
                <button onClick={() => remove(b.id)} className="p-2 text-slate-500 hover:text-red-400" title="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <History className="w-5 h-5 text-sky-400" />
        {lang === 'ne' ? 'हालै हेरिएका' : 'Recently viewed'}
      </h2>
      {recents.length === 0 ? (
        <p className="text-sm text-slate-500">{lang === 'ne' ? 'खाली छ।' : 'Empty.'}</p>
      ) : (
        <div className="space-y-2">
          {recents.slice(0, 15).map((r) => {
            const to = r.kind === 'destination' ? `/destinations/${r.refId}` : r.kind === 'location' ? `/places/${r.refId}` : null;
            const label = lang === 'ne' ? (r.title_ne || r.title_en) : (r.title_en || r.title_ne);
            return to ? (
              <Link key={r.id} to={to} className="block p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-sm text-slate-200">{label}</Link>
            ) : (
              <div key={r.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-sm text-slate-200">{label}</div>
            );
          })}
        </div>
      )}
      <p className="text-[11px] text-slate-500">
        {lang === 'ne' ? 'बुकमार्क र इतिहास यो डिभाइसमा मात्र रहन्छ — कतै पठाइँदैन।' : 'Bookmarks & history stay on this device only — never uploaded.'}
      </p>
    </div>
  );
}
