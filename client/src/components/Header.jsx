import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import NepaLogo from './NepaLogo';
import StatusIndicator from './StatusIndicator';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AlertTriangle, Languages, Shield, Radio, ShieldAlert, Search, Settings, Sun, Moon } from 'lucide-react';

export default function Header() {
  const { lang, setLang, t } = useLanguage();
  const { simulateOffline, toggleSimulateOffline } = useNetwork();
  const { user, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { to: '/map', label: t('nav.map') },
    { to: '/directions', label: lang === 'ne' ? 'बाटो' : 'Directions' },
    { to: '/provinces', label: t('nav.provinces') },
    { to: '/destinations', label: t('nav.explore') },
    { to: '/emergency', label: t('nav.emergency'), isEmergency: true },
    { to: '/help', label: t('nav.help') },
    { to: '/guides', label: t('nav.guides') },
    { to: '/packs', label: t('nav.packs') },
    { to: '/bookmarks', label: t('nav.saved') },
    { to: '/home', label: t('nav.home') },
    { to: '/profile', label: t('nav.profile') },
  ];

  if (isAdmin) {
    navLinks.push({ to: '/admin', label: t('nav.admin') });
  }

  return (
    // Desktop-only header: on phones every control lives in the bottom bar.
    <header className="hidden lg:block sticky top-0 z-40 bg-[#0B192C]/95 backdrop-blur-md border-b border-slate-800 transition-colors">
      {/* Top Banner for Demo Mode / Simulated Offline */}
      {simulateOffline && (
        <div className="bg-amber-600/90 text-amber-950 font-bold text-xs py-1 px-4 text-center flex items-center justify-center gap-2">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>DEMO SIMULATION: Cellular/WiFi offline mode active. Local data packs remain fully functional.</span>
          <button
            onClick={toggleSimulateOffline}
            className="ml-2 underline text-xs font-semibold hover:text-black"
          >
            Restore Online
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center">
            <NepaLogo size="md" />
          </Link>

          {/* Desktop Nav (scrolls instead of wrapping on narrow laptops) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 min-w-0 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                    link.isEmergency
                      ? 'bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600/30'
                      : active
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Controls & Actions — compact so everything fits a 360px phone */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Status Indicator (Compact, hidden on small phones — Home shows it) */}
            <div className="hidden min-[420px]:block">
              <StatusIndicator compact />
            </div>

            {/* Global Search */}
            <Link
              to="/search"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Search / खोज्नुहोस्"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Settings */}
            <Link
              to="/settings"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Settings / सेटिङ"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title={isDark ? (lang === 'ne' ? 'उज्यालो मोड (Light Mode)' : 'Switch to Light Mode') : (lang === 'ne' ? 'अध्यारो मोड (Dark Mode)' : 'Switch to Dark Mode')}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ne' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Switch Language / भाषा परिवर्तन"
            >
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'en' ? 'नेपाली' : 'EN'}</span>
            </button>

            {/* Demo Offline Toggle */}
            <button
              onClick={toggleSimulateOffline}
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                simulateOffline
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Test offline behavior without disconnecting your internet"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{simulateOffline ? 'Restore' : 'Simulate Offline'}</span>
            </button>

            {/* Prominent SOS Button */}
            <Link
              to="/sos"
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md shadow-red-900/30 transition transform active:scale-95 animate-sos-pulse"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>SOS</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
