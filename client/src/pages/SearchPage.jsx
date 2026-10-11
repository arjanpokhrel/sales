import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, BookOpen, Bus, Mountain, Landmark } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { searchOfflineData } from '../offline/db';

// Dedicated offline search across destinations, places, guides, routes, provinces.
export default function SearchPage() {
  const { lang } = useLanguage();
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!q.trim()) { setRes(null); return; }
    setSearching(true);
    const h = setTimeout(async () => {
      try { setRes(await searchOfflineData(q)); }
      catch { setRes(null); }
      finally { setSearching(false); }
    }, 250);
    return () => clearTimeout(h);
  }, [q]);

  const total = res ? (res.destinations?.length || 0) + (res.locations?.length || 0) +
    (res.guides?.length || 0) + (res.routes?.length || 0) + (res.provinces?.length || 0) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <h1 className="text-2xl font-black text-white">{lang === 'ne' ? 'खोज्नुहोस्' : 'Search Nepal'}</h1>
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-700 focus-within:border-sky-600">
        <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder={lang === 'ne' ? 'पोखरा, पशुपतिनाथ, अस्पताल…' : 'Pokhara, Pashupatinath, hospital…'}
          className="w-full bg-transparent outline-none text-white placeholder:text-slate-500 text-sm"
        />
      </div>
      <p className="text-[11px] text-slate-500">
        {lang === 'ne'
          ? 'डाउनलोड गरिएको र बन्डल डाटामा मात्र खोज्छ — इन्टरनेट आवश्यक छैन।'
          : 'Searches bundled + downloaded data only — no internet needed.'}
      </p>

      {searching && <p className="text-sm text-slate-400">…</p>}
      {res && !searching && (
        <p className="text-xs text-slate-400">{total} {lang === 'ne' ? 'नतिजा' : 'results'}</p>
      )}
      {res && total === 0 && (
        <div className="p-6 text-center rounded-2xl border border-dashed border-slate-700 text-sm text-slate-400">
          {lang === 'ne' ? 'केही भेटिएन। हिज्जे फेरेर प्रयास गर्नुहोस्।' : 'No matches. Try another spelling (EN or NE).'}
        </div>
      )}

      {res && (res.destinations?.length > 0) && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <Mountain className="w-3.5 h-3.5" /> {lang === 'ne' ? 'गन्तव्य' : 'Destinations'}
          </h2>
          <div className="space-y-2">
            {res.destinations.map((d) => (
              <Link key={d.id} to={`/destinations/${d.id}`} className="block p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-700">
                <div className="font-semibold text-white text-sm">{lang === 'ne' ? d.name_ne : d.name_en}</div>
                <div className="text-[11px] text-slate-400">{d.district} · {d.category}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {res && (res.locations?.length > 0) && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {lang === 'ne' ? 'स्थानहरू' : 'Places'}
          </h2>
          <div className="space-y-2">
            {res.locations.slice(0, 20).map((l) => (
              <Link key={l.id} to={`/places/${l.id}`} className="block p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-700">
                <div className="font-semibold text-white text-sm">{lang === 'ne' ? (l.name_ne || l.name_en) : (l.name_en || l.name_ne)}</div>
                <div className="text-[11px] text-slate-400">{l.category_id} · {l.region}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {res && (res.provinces?.length > 0) && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <Landmark className="w-3.5 h-3.5" /> {lang === 'ne' ? 'प्रदेश' : 'Provinces'}
          </h2>
          <div className="space-y-2">
            {res.provinces.map((p) => (
              <Link key={p.id} to={`/provinces/${p.id}`} className="block p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-700 font-semibold text-white text-sm">
                {lang === 'ne' ? p.name_ne : p.name_en}
              </Link>
            ))}
          </div>
        </section>
      )}
      {res && (res.guides?.length > 0) && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> {lang === 'ne' ? 'निर्देशिका' : 'Guides'}
          </h2>
          <div className="space-y-2">
            {res.guides.map((g) => (
              <Link key={g.slug || g.id} to={`/guides/${g.slug || g.id}`} className="block p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-700 font-semibold text-white text-sm">
                {lang === 'ne' ? (g.title_ne || g.title_en) : (g.title_en || g.title_ne)}
              </Link>
            ))}
          </div>
        </section>
      )}
      {res && (res.routes?.length > 0) && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <Bus className="w-3.5 h-3.5" /> {lang === 'ne' ? 'यातायात' : 'Transport'}
          </h2>
          <div className="space-y-2">
            {res.routes.map((r) => (
              <Link key={r.id} to="/transport" className="block p-3 rounded-xl bg-slate-900 border border-slate-800 font-semibold text-white text-sm">
                {lang === 'ne' ? (r.name_ne || r.name_en) : (r.name_en || r.name_ne)}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
