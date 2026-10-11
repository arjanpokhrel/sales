import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import NepaLogo from '../components/NepaLogo';

// First-launch language selection. Shown once (localStorage flag);
// changing language later is always possible in Settings/Header.
export default function WelcomePage() {
  const { setLang } = useLanguage();
  const navigate = useNavigate();

  const choose = (l) => {
    setLang(l);
    try { localStorage.setItem('nepready_welcomed', '1'); } catch { /* private mode */ }
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center">
        <div className="flex justify-center mb-4"><NepaLogo size="lg" /></div>
        <h1 className="text-2xl font-black text-white">NepaReady</h1>
        <p className="text-sm text-slate-400 mt-1 mb-1">Offline Nepal, Always Ready</p>
        <p className="text-sm text-slate-400 mb-6">अफलाइन नेपाल, सधैँ तयार</p>
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Choose language / भाषा छान्नुहोस्
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => choose('en')}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-sky-900 border border-slate-700 hover:border-sky-600 transition active:scale-95"
          >
            <div className="text-2xl mb-1">🇬🇧</div>
            <div className="font-bold text-white">English</div>
            <div className="text-[11px] text-slate-400">Continue in English</div>
          </button>
          <button
            onClick={() => choose('ne')}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-sky-900 border border-slate-700 hover:border-sky-600 transition active:scale-95"
          >
            <div className="text-2xl mb-1">🇳🇵</div>
            <div className="font-bold text-white">नेपाली</div>
            <div className="text-[11px] text-slate-400">नेपालीमा अगाडि बढ्नुहोस्</div>
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-5">
          No account needed · Works offline · इन्टरनेट बिना चल्छ
        </p>
      </div>
    </div>
  );
}
