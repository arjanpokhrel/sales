import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { useTheme } from '../context/ThemeContext';
import {
  Compass, Bookmark, Route as RouteIcon, MapPin, MoreHorizontal,
  Search, Languages, ShieldAlert, Radio, Sun, Moon
} from 'lucide-react';

// Map-first bottom command bar: Explore (map), Saved, Directions, Nearby,
// More. Utility row (search, status, language, SOS) stays thumb-reachable.
export default function BottomNavigation() {
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const { isOnline, simulateOffline, toggleSimulateOffline } = useNetwork();
  const { isDark, toggleTheme } = useTheme();

  const items = [
    { to: '/map', label: lang === 'ne' ? 'घुम्नुहोस्' : 'Explore', icon: Compass },
    { to: '/bookmarks', label: t('nav.saved'), icon: Bookmark },
    { to: '/directions', label: lang === 'ne' ? 'बाटो' : 'Directions', icon: RouteIcon, isDirections: true },
    { to: '/help', label: lang === 'ne' ? 'नजिक' : 'Nearby', icon: MapPin },
    { to: '/settings', label: lang === 'ne' ? 'थप' : 'More', icon: MoreHorizontal },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[1200] pb-safe">
      {simulateOffline && (
        <div className="bg-amber-600/95 text-amber-950 font-bold text-[11px] py-1 px-3 text-center flex items-center justify-center gap-2">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Offline simulation</span>
          <button onClick={toggleSimulateOffline} className="underline font-semibold">
            Restore
          </button>
        </div>
      )}

      <div className="bg-[#0B192C]/98 border-t border-slate-800 backdrop-blur-lg">
        <div className="flex items-center gap-2 px-3 pt-2">
          <Link
            to="/search"
            className="flex items-center gap-1.5 flex-1 min-w-0 px-3 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 text-xs"
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {lang === 'ne' ? 'ठाउँ खोज्नुहोस्…' : 'Search Nepal…'}
            </span>
          </Link>

          <div className={`hidden min-[380px]:flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${
            isOnline
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
              : 'bg-red-950/70 border-red-800 text-red-300'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-500'}`} />
            {isOnline ? (lang === 'ne' ? 'अनलाइन' : 'Online') : (lang === 'ne' ? 'अफलाइन' : 'Offline')}
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-xl bg-slate-800/80 text-slate-200 text-xs border border-slate-700"
            title="Toggle Light / Dark mode"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-400" />}
          </button>

          <button
            onClick={() => setLang(lang === 'en' ? 'ne' : 'en')}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-800/80 text-slate-200 text-xs font-bold border border-slate-700"
          >
            <Languages className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'en' ? 'ने' : 'EN'}</span>
          </button>

          <Link
            to="/sos"
            className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-xl text-xs font-black shadow-md shadow-red-900/40 active:scale-95 animate-sos-pulse"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SOS</span>
          </Link>
        </div>

        <nav className="flex items-center justify-around h-16 px-1" aria-label="Primary">
          {items.map((item) => {
            const isActive = location.pathname === item.to
              || (item.to !== '/' && location.pathname.startsWith(item.to + '/'));
            const Icon = item.icon;

            if (item.isDirections) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center -mt-5"
                  aria-label={item.label}
                >
                  <div
                    className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 border-2 ${
                      isActive
                        ? 'bg-sky-500 border-white text-white shadow-sky-600/50'
                        : 'bg-sky-700 border-sky-400/60 text-white shadow-sky-950/60 hover:bg-sky-600'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-sky-300 mt-1">
                    {item.label}
                  </span>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                  isActive
                    ? 'text-sky-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[11px]">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
