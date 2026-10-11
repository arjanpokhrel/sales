import React from 'react';
import { Link } from 'react-router-dom';
import { WifiOff, DownloadCloud, Map as MapIcon, Bookmark } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Offline help & acceptance test checklist, stored locally.
export default function HelpOfflinePage() {
  const { lang } = useLanguage();
  const steps = lang === 'ne' ? [
    'एप खोल्नुहोस् र “सम्पूर्ण नेपाल डाउनलोड” वा चाहिने प्रदेश प्याक डाउनलोड गर्नुहोस्।',
    'एप बन्द गर्नुहोस्, airplane mode बाल्नुहोस्।',
    'एप पुनः खोल्नुहोस् — नक्सा, खोज, गन्तव्य, फोटो, आपतकालीन र बुकमार्क चल्नुपर्छ।',
    'नक्सामा नदेखिएको क्षेत्र = अझै क्यास भएको छैन (अनलाइन हेरेर राख्नुहोस्)।',
  ] : [
    'Open the app and download “All Nepal data” or the province packs you need.',
    'Close the app and enable airplane mode.',
    'Reopen — map, search, destinations, photos, emergency and bookmarks must work.',
    'A blank map area means it was never cached (browse it online first).',
  ];
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
        <WifiOff className="w-7 h-7 text-amber-300" />
        {lang === 'ne' ? 'अफलाइन सहायता' : 'Offline help'}
      </h1>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="w-7 h-7 rounded-full bg-sky-800 text-white text-sm font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
            <p className="text-sm text-slate-200">{s}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          { to: '/download-all', icon: DownloadCloud, label: lang === 'ne' ? 'सबै डाउनलोड' : 'Download all' },
          { to: '/map', icon: MapIcon, label: lang === 'ne' ? 'नक्सा' : 'Map' },
          { to: '/bookmarks', icon: Bookmark, label: lang === 'ne' ? 'बुकमार्क' : 'Bookmarks' },
        ].map((l) => (
          <Link key={l.to} to={l.to} className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-800 text-sm font-bold text-slate-100">
            <l.icon className="w-4 h-4 text-sky-400" />{l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
