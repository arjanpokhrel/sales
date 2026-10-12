import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { VERIFIED_ON, DATA_VERSION } from '../data/essential';
import NepaLogo from '../components/NepaLogo';

export default function AboutPage() {
  const { lang } = useLanguage();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <div className="flex justify-center"><NepaLogo size="lg" /></div>
      <h1 className="text-2xl font-black text-white text-center">Nepal Navigator — {lang === 'ne' ? 'अफलाइन नेपाल, सधैँ तयार' : 'Offline Nepal, Always Ready'}</h1>
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-300 leading-relaxed space-y-3">
        <p>
          {lang === 'ne'
            ? 'Nepal Navigator इन्टरनेट नभएको बेला पनि काम गर्ने नेपाल सूचना तथा नेभिगेसन प्लेटफर्म हो: नक्सा, गन्तव्य, आपतकालीन नम्बर, गाइड र अफलाइन प्याकहरू।'
            : 'Nepal Navigator is a Nepal information and navigation platform that stays useful without internet: maps, destinations, emergency numbers, guides and offline packs.'}
        </p>
        <p>
          {lang === 'ne'
            ? 'कुनै खाता आवश्यक छैन, कुनै ट्र्याकिङ छैन। बुकमार्क र सेटिङ यो डिभाइसमा मात्र रहन्छ।'
            : 'No account required, no tracking. Bookmarks and settings stay on this device only.'}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          {lang === 'ne'
            ? `डाटा संस्करण ${DATA_VERSION} · आपतकालीन नम्बर प्रमाणित ${VERIFIED_ON}`
            : `Data version ${DATA_VERSION} · Emergency numbers verified ${VERIFIED_ON}`}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link to="/attribution" className="p-3 rounded-xl bg-slate-800/60 text-center text-sm font-semibold text-slate-100">
          {lang === 'ne' ? 'स्रोत र श्रेय' : 'Sources & credits'}
        </Link>
        <Link to="/help-offline" className="p-3 rounded-xl bg-slate-800/60 text-center text-sm font-semibold text-slate-100">
          {lang === 'ne' ? 'अफलाइन सहायता' : 'Offline help'}
        </Link>
      </div>
    </div>
  );
}
