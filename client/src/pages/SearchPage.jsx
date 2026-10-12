import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, BookOpen, Bus, Mountain, Landmark, Building2, HeartPulse, ShieldAlert, GraduationCap, Bed, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { searchOfflineData } from '../offline/db';
import VoiceSearchButton from '../components/VoiceSearchButton';

export default function SearchPage() {
  const { lang } = useLanguage();
  const [q, setQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [res, setRes] = useState(null);
  const [searching, setSearching] = useState(false);

  const categories = [
    { id: 'all', label_en: 'All', label_ne: 'सबै' },
    { id: 'government', label_en: 'Govt Offices', label_ne: 'सरकारी कार्यालय' },
    { id: 'hospital', label_en: 'Hospitals', label_ne: 'अस्पताल' },
    { id: 'police', label_en: 'Police', label_ne: 'प्रहरी' },
    { id: 'school', label_en: 'Education', label_ne: 'शिक्षा' },
    { id: 'hotel', label_en: 'Hotels', label_ne: 'होटल' },
    { id: 'transport', label_en: 'Transit', label_ne: 'यातायात' },
  ];

  useEffect(() => {
    if (!q.trim()) { setRes(null); return; }
    setSearching(true);
    const h = setTimeout(async () => {
      try { setRes(await searchOfflineData(q)); }
      catch { setRes(null); }
      finally { setSearching(false); }
    }, 200);
    return () => clearTimeout(h);
  }, [q]);

  const filteredLocations = (res?.locations || []).filter(l => {
    if (selectedCategory === 'all') return true;
    return l.category_id === selectedCategory;
  });

  const total = res ? (res.destinations?.length || 0) + filteredLocations.length +
    (res.guides?.length || 0) + (res.routes?.length || 0) + (res.provinces?.length || 0) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {lang === 'ne' ? 'नेपाल स्मार्ट खोज' : 'Search Nepal'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {lang === 'ne'
            ? 'सबै ७ प्रदेशका अस्पताल, सरकारी कार्यालय, स्कुल, होटल र गन्तव्यहरू — इन्टरनेट बिना पनि खोज्नुहोस्।'
            : 'Find hospitals, government services, transit hubs, and destinations across Nepal — even offline.'}
        </p>
      </div>

      <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
        <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder={lang === 'ne' ? 'पोखरा, मन्त्रालय, वीर अस्पताल, धरान…' : 'Singha Durbar, Bir Hospital, Pokhara, schools…'}
          className="w-full bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400 text-sm"
          autoFocus
        />
        <VoiceSearchButton onTranscript={(txt) => setQ(txt)} />
        {q && (
          <button onClick={() => setQ('')} className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1">
            ✕
          </button>
        )}
      </div>

      {/* Quick category filter tags */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {lang === 'ne' ? cat.label_ne : cat.label_en}
          </button>
        ))}
      </div>

      {searching && (
        <div className="text-center py-6 text-sm text-slate-400">
          <span className="inline-block animate-pulse">{lang === 'ne' ? 'खोज्दैछ…' : 'Searching directory…'}</span>
        </div>
      )}

      {res && !searching && (
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {total} {lang === 'ne' ? 'नतिजा फेला पर्यो' : 'matches found'}
        </p>
      )}

      {res && total === 0 && !searching && (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 space-y-2">
          <p className="font-semibold">{lang === 'ne' ? 'कुनै नतिजा भेटिएन।' : 'No matches found.'}</p>
          <p className="text-xs text-slate-400">
            {lang === 'ne'
              ? 'कृपया अर्को शब्द वा अंग्रेजी/नेपाली हिज्जे प्रयोग गर्नुहोस्।'
              : 'Try different keywords or check spelling in English or Nepali.'}
          </p>
        </div>
      )}

      {/* Locations (Government offices, hospitals, schools, etc.) */}
      {filteredLocations.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-sky-500" />
            <span>{lang === 'ne' ? 'सेवा र स्थानहरू' : 'Services & Places'} ({filteredLocations.length})</span>
          </h2>
          <div className="space-y-2">
            {filteredLocations.slice(0, 30).map((l) => (
              <div
                key={l.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/60 transition shadow-sm flex items-center justify-between gap-3"
              >
                <Link to={`/places/${l.id}`} className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 dark:text-white text-sm truncate">
                    {lang === 'ne' ? (l.name_ne || l.name_en) : (l.name_en || l.name_ne)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="capitalize font-semibold text-sky-600 dark:text-sky-400">{l.category_id}</span>
                    <span>·</span>
                    <span>{l.region || l.district}</span>
                    {l.phone && (
                      <>
                        <span>·</span>
                        <span className="font-mono">{l.phone}</span>
                      </>
                    )}
                  </div>
                </Link>
                {l.latitude && l.longitude && (
                  <Link
                    to={`/map?lat=${l.latitude}&lng=${l.longitude}&zoom=15`}
                    className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-300 hover:bg-sky-100 transition flex items-center gap-1 text-xs font-bold flex-shrink-0"
                    title={lang === 'ne' ? 'नक्सामा हेर्नुहोस्' : 'View on map'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{lang === 'ne' ? 'नक्सा' : 'Map'}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Destinations */}
      {res && (res.destinations?.length > 0) && (
        <section className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Mountain className="w-4 h-4 text-emerald-500" />
            <span>{lang === 'ne' ? 'प्रमुख गन्तव्यहरू' : 'Destinations'}</span>
          </h2>
          <div className="space-y-2">
            {res.destinations.map((d) => (
              <div
                key={d.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 transition shadow-sm flex items-center justify-between gap-3"
              >
                <Link to={`/destinations/${d.id}`} className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 dark:text-white text-sm">
                    {lang === 'ne' ? d.name_ne : d.name_en}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {d.district} · {d.category} · {d.elevation_m}m
                  </div>
                </Link>
                <Link
                  to={`/map?lat=${d.lat}&lng=${d.lng}&zoom=13`}
                  className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 transition flex items-center gap-1 text-xs font-bold flex-shrink-0"
                  title={lang === 'ne' ? 'नक्सामा हेर्नुहोस्' : 'View on map'}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{lang === 'ne' ? 'नक्सा' : 'Map'}</span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Provinces */}
      {res && (res.provinces?.length > 0) && (
        <section className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-purple-500" />
            <span>{lang === 'ne' ? 'प्रदेश' : 'Provinces'}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {res.provinces.map((p) => (
              <Link
                key={p.id}
                to={`/provinces/${p.id}`}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 font-bold text-slate-800 dark:text-white text-sm shadow-sm transition"
              >
                {lang === 'ne' ? p.name_ne : p.name_en}
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">{p.capital_en} · {p.district_count} Districts</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Emergency & Preparedness Guides */}
      {res && (res.guides?.length > 0) && (
        <section className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>{lang === 'ne' ? 'निर्देशिका' : 'Guides'}</span>
          </h2>
          <div className="space-y-2">
            {res.guides.map((g) => (
              <Link
                key={g.slug || g.id}
                to={`/guides/${g.slug || g.id}`}
                className="block p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 font-bold text-slate-800 dark:text-white text-sm shadow-sm transition"
              >
                {lang === 'ne' ? (g.title_ne || g.title_en) : (g.title_en || g.title_ne)}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Transport Routes */}
      {res && (res.routes?.length > 0) && (
        <section className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Bus className="w-4 h-4 text-blue-500" />
            <span>{lang === 'ne' ? 'सार्वजनिक यातायात' : 'Public Transport'}</span>
          </h2>
          <div className="space-y-2">
            {res.routes.map((r) => (
              <Link
                key={r.id}
                to="/transport"
                className="block p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-white text-sm shadow-sm transition"
              >
                {lang === 'ne' ? (r.name_ne || r.name_en) : (r.name_en || r.name_ne)}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
