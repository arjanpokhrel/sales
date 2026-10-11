import React, { useEffect, useState } from 'react';
import { HardDrive, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { db, removePackBundle } from '../offline/db';

// Storage management: real browser quota + per-pack delete.
// Essential bundled data is never deletable from here.
export default function StoragePage() {
  const { lang } = useLanguage();
  const { downloadedPacks, refreshDownloadedPacks } = useNetwork();
  const [quota, setQuota] = useState(null);
  const [counts, setCounts] = useState({});

  const load = async () => {
    try {
      if (navigator.storage?.estimate) {
        const e = await navigator.storage.estimate();
        setQuota({ usageMb: (e.usage || 0) / 1048576, quotaMb: (e.quota || 0) / 1073741824 });
      }
      setCounts({
        destinations: await db.table('destinations').count().catch(() => 0),
        bookmarks: await db.table('bookmarks').count().catch(() => 0),
        recents: await db.table('recents').count().catch(() => 0),
      });
      await refreshDownloadedPacks();
    } catch { /* ignore */ }
  };
  useEffect(() => { load(); }, []);

  const packMb = downloadedPacks.reduce((a, p) => a + (Number(p.size_mb) || 0), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
        <HardDrive className="w-7 h-7 text-sky-400" />
        {lang === 'ne' ? 'भण्डारण' : 'Storage'}
      </h1>
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-slate-300">{lang === 'ne' ? 'ब्राउजर भण्डारण' : 'Browser storage'}</span>
          <span className="font-mono font-bold text-white">
            {quota ? `${quota.usageMb.toFixed(1)} MB / ${quota.quotaMb.toFixed(1)} GB` : '…'}
          </span>
        </div>
        {quota && (
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full"
              style={{ width: `${Math.min((quota.usageMb / (quota.quotaMb * 1024)) * 100, 100)}%` }} />
          </div>
        )}
        <p className="text-[11px] text-slate-500 mt-2">
          {lang === 'ne' ? `डाउनलोड प्याक: ${packMb.toFixed(1)} MB · गन्तव्य: ${counts.destinations || 0} · बुकमार्क: ${counts.bookmarks || 0}` : `Downloaded packs: ${packMb.toFixed(1)} MB · Destinations: ${counts.destinations || 0} · Bookmarks: ${counts.bookmarks || 0}`}
        </p>
      </div>
      <div className="space-y-2">
        {downloadedPacks.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{p.name_en || p.region}</div>
              <div className="text-[11px] text-slate-500">{p.size_mb} MB</div>
            </div>
            <button
              onClick={async () => { await removePackBundle(p.id); load(); }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-red-300 hover:bg-red-950"
            >
              <Trash2 className="w-3.5 h-3.5" /> {lang === 'ne' ? 'मेटाउनुहोस्' : 'Delete'}
            </button>
          </div>
        ))}
        {downloadedPacks.length === 0 && (
          <p className="text-sm text-slate-500">{lang === 'ne' ? 'कुनै वैकल्पिक प्याक छैन।' : 'No optional packs stored.'}</p>
        )}
      </div>
      <button
        onClick={async () => {
          await db.table('recents').clear().catch(() => {});
          load();
        }}
        className="text-xs font-bold text-slate-400 hover:text-slate-200"
      >
        {lang === 'ne' ? 'हालै हेरिएका खाली गर्नुहोस्' : 'Clear recently viewed'}
      </button>
      <p className="text-[11px] text-slate-500">
        {lang === 'ne'
          ? 'आधारभूत बन्डल डाटा (प्रदेश, गन्तव्य, आपतकालीन) मेटिँदैन — एपसँगै रहन्छ।'
          : 'Essential bundled data (provinces, destinations, emergency) is never deleted — it ships with the app.'}
      </p>
    </div>
  );
}
