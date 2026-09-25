import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Hospital, ShieldAlert, BookOpen, Bus, PhoneCall, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { searchOfflineData } from '../offline/db';

export default function GlobalSearchBar({ placeholder, className = '' }) {
  const { lang, t } = useLanguage();
  const { isOnline } = useNetwork();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ locations: [], guides: [], routes: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ locations: [], guides: [], routes: [] });
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        if (isOnline) {
          // If online, search both server and local IndexedDB
          try {
            const res = await fetch(`/api/locations?search=${encodeURIComponent(query)}`);
            const locData = await res.json();

            const guideRes = await fetch('/api/guides');
            const guideData = await guideRes.json();
            const q = query.toLowerCase();
            const matchedGuides = (guideData.guides || []).filter(g =>
              g.title_en.toLowerCase().includes(q) ||
              g.title_ne.includes(q) ||
              g.slug.includes(q)
            );

            const routeRes = await fetch('/api/transport/routes');
            const routeData = await routeRes.json();
            const matchedRoutes = (routeData.routes || []).filter(r =>
              r.name_en.toLowerCase().includes(q) ||
              r.name_ne.includes(q) ||
              r.route_number.toLowerCase().includes(q)
            );

            setResults({
              locations: locData.locations || [],
              guides: matchedGuides,
              routes: matchedRoutes
            });
            setIsOpen(true);
            return;
          } catch (e) {
            // Fallback to offline search on network glitch
          }
        }

        // Offline mode: Query IndexedDB directly
        const offlineResults = await searchOfflineData(query);
        setResults(offlineResults);
        setIsOpen(true);
      } catch (err) {
        console.warn('Search query error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOnline]);

  const hasResults =
    results.locations.length > 0 ||
    results.guides.length > 0 ||
    results.routes.length > 0;

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={placeholder || t('map.searchPlaceholder')}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm text-white placeholder-slate-400 outline-none transition"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results Box */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-96 overflow-y-auto rounded-2xl bg-slate-900/98 border border-slate-700 shadow-2xl backdrop-blur-md p-2 divide-y divide-slate-800">
          {!hasResults && !loading && (
            <div className="p-4 text-center text-xs text-slate-400">
              No matching information found in your downloaded data or server.
            </div>
          )}

          {/* Locations */}
          {results.locations.length > 0 && (
            <div className="py-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5 flex items-center gap-1.5">
                <Hospital className="w-3.5 h-3.5 text-red-400" />
                <span>Locations & Emergency Services</span>
              </div>
              {results.locations.slice(0, 5).map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    navigate('/map');
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 cursor-pointer transition text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">
                      {lang === 'ne' ? loc.name_ne : loc.name_en}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {loc.region} • {loc.category_id}
                    </div>
                  </div>
                  {(loc.phone || loc.emergency_phone) && (
                    <a
                      href={`tel:${loc.emergency_phone || loc.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="ml-2 p-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Guides */}
          {results.guides.length > 0 && (
            <div className="py-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span>Emergency Action Guides</span>
              </div>
              {results.guides.map((g) => (
                <div
                  key={g.id}
                  onClick={() => {
                    navigate(`/guides/${g.slug}`);
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 cursor-pointer transition text-left"
                >
                  <div className="text-xs font-bold text-white">
                    {lang === 'ne' ? g.title_ne : g.title_en}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {/* Routes */}
          {results.routes.length > 0 && (
            <div className="py-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5 flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5 text-amber-400" />
                <span>Public Transit Routes</span>
              </div>
              {results.routes.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    navigate('/transport');
                    setIsOpen(false);
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-800 cursor-pointer transition text-left"
                >
                  <div className="text-xs font-bold text-white">
                    {r.route_number}: {lang === 'ne' ? r.name_ne : r.name_en}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {r.region} • {r.operating_hours}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
