import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, Languages, HardDrive, Info, ShieldCheck, CircleHelp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../offline/db';
import { DATA_VERSION, VERIFIED_ON } from '../data/essential';

export default function SettingsPage() {
  const { lang, setLang } = useLanguage();
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setCounts({
          destinations: await db.table('destinations').count(),
          provinces: await db.table('provinces').count(),
          bookmarks: await db.table('bookmarks').count(),
          packs: await db.offline_packs.count(),
        });
      } catch { /* ignore */ }
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
        <SettingsIcon className="w-7 h-7 text-slate-300" />
        {lang === 'ne' ? 'सेटिङ' : 'Settings'}
      </h1>

      <section className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="font-bold text-white text-sm mb-3 flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-sky-400" /> {lang === 'ne' ? 'भाषा' : 'Language'}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[{ id: 'en', label: 'English' }, { id: 'ne', label: 'नेपाली' }].map((l) => (
            <button key={l.id} onClick={() => setLang(l.id)}
              className={`py-2.5 rounded-xl text-sm font-bold border transition ${
                lang === l.id ? 'bg-sky-800 border-sky-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}>
              {l.label}
            </button>
          ))}
        </div>
      </section>

      <section className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <h2 className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
          <HardDrive className="w-4 h-4 text-sky-400" /> {lang === 'ne' ? 'डाटा र भण्डारण' : 'Data & storage'}
        </h2>
        {[
          { to: '/packs', label: lang === 'ne' ? 'अफलाइन प्याकहरू' : 'Offline packs' },
          { to: '/download-all', label: lang === 'ne' ? 'सम्पूर्ण नेपाल डाउनलोड' : 'Download all Nepal data' },
          { to: '/transport', label: lang === 'ne' ? 'यातायात' : 'Transport' },
          { to: '/travel', label: lang === 'ne' ? 'यात्रा मोड' : 'Travel mode' },
          { to: '/profile', label: lang === 'ne' ? 'प्रोफाइल' : 'Profile' },
          { to: '/storage', label: lang === 'ne' ? 'भण्डारण व्यवस्थापन' : 'Storage management' },
        ].map((l) => (
          <Link key={l.to} to={l.to} className="block p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-sm font-semibold text-slate-100">
            {l.label}
          </Link>
        ))}
        {counts && (
          <p className="text-[11px] text-slate-500 pt-1">
            {counts.provinces} provinces · {counts.destinations} destinations · {counts.bookmarks} bookmarks · {counts.packs} packs
            {' · '}v{DATA_VERSION}
          </p>
        )}
      </section>

      <section className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <h2 className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" /> {lang === 'ne' ? 'जानकारी' : 'About'}
        </h2>
        {[
          { to: '/about', label: lang === 'ne' ? 'NepaReady बारे' : 'About NepaReady' },
          { to: '/attribution', label: lang === 'ne' ? 'स्रोत र श्रेय' : 'Data sources & credits' },
          { to: '/help-offline', label: lang === 'ne' ? 'अफलाइन सहायता' : 'Offline help', icon: CircleHelp },
        ].map((l) => (
          <Link key={l.to} to={l.to} className="block p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-sm font-semibold text-slate-100">
            {l.label}
          </Link>
        ))}
        <p className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          {lang === 'ne' ? `आपतकालीन नम्बर प्रमाणित: ${VERIFIED_ON}` : `Emergency numbers verified: ${VERIFIED_ON}`}
        </p>
      </section>
    </div>
  );
}
