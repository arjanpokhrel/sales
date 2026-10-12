import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import OfflinePackCard from '../components/OfflinePackCard';
import { db } from '../offline/db';
import { HardDrive, ShieldCheck, DownloadCloud, Database, Sparkles, RefreshCw } from 'lucide-react';

export default function OfflinePacksPage() {
  const { lang, t } = useLanguage();
  const { isOnline, downloadedPacks, refreshDownloadedPacks } = useNetwork();

  const [availablePacks, setAvailablePacks] = useState([]);
  const [storageEstimate, setStorageEstimate] = useState({ usageMb: 0, quotaMb: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isOnline) {
        const res = await fetch('/api/offline-packs');
        const data = await res.json();
        if (data.packs) {
          setAvailablePacks(data.packs);
        }
      } else {
        // Fallback to offline stored packs metadata
        const localPacks = await db.offline_packs.toArray();
        if (localPacks.length > 0) {
          setAvailablePacks(localPacks);
        }
      }

      // Check browser storage quota estimate
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        setStorageEstimate({
          usageMb: ((estimate.usage || 0) / (1024 * 1024)).toFixed(1),
          quotaMb: ((estimate.quota || 0) / (1024 * 1024 * 1024)).toFixed(1)
        });
      }

      await refreshDownloadedPacks();
    } catch (err) {
      console.warn('Failed to fetch offline packs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isOnline]);

  const downloadedIds = new Set(downloadedPacks.map(p => p.id));

  // Total downloaded size in MB
  const totalDownloadedMb = downloadedPacks.reduce((acc, p) => acc + (Number(p.size_mb) || 0), 0);

  // Group packs by province
  const groupedPacks = availablePacks.reduce((acc, pack) => {
    const prov = pack.province || 'General';
    if (!acc[prov]) acc[prov] = [];
    acc[prov].push(pack);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold uppercase mb-2">
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>Offline Pre-Loading System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('packs.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              {t('packs.subtitle')}
            </p>
          </div>

          {/* Storage Meter */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex-shrink-0 min-w-[220px]">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <HardDrive className="w-3.5 h-3.5 text-sky-500" />
                <span>{t('packs.storageUsed')}</span>
              </span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">{totalDownloadedMb.toFixed(1)} MB</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalDownloadedMb / 250) * 100, 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 flex justify-between">
              <span>{downloadedPacks.length} packs installed</span>
              <span>IndexedDB Storage</span>
            </div>
          </div>
        </div>

        {/* Informative Note */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>
            Downloaded packs store geographic bounds, verified hospitals, police units, public transport, and emergency guides permanently in your browser.
          </span>
        </div>
      </div>

      {/* Available Packs grouped by Province */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {t('packs.availablePacks')}
          </h2>
          <button
            onClick={loadData}
            className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline p-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {Object.entries(groupedPacks).map(([province, packs]) => (
          <div key={province} className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
              🇳🇵 {province}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packs.map((pack) => (
                <OfflinePackCard
                  key={pack.id}
                  pack={pack}
                  isDownloaded={downloadedIds.has(pack.id)}
                  onStatusChanged={loadData}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
