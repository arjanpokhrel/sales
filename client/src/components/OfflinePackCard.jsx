import React, { useState } from 'react';
import { Download, CheckCircle2, Trash2, RefreshCw, HardDrive, MapPin, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { downloadPackBundle, removePackBundle } from '../offline/db';

export default function OfflinePackCard({ pack, isDownloaded, onStatusChanged }) {
  const { lang, t } = useLanguage();
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, loadedMb: 0, totalMb: pack.size_mb, status: '' });
  const [error, setError] = useState(null);

  const isNepali = lang === 'ne';
  const name = isNepali ? pack.name_ne : pack.name_en;
  const description = isNepali ? pack.description_ne : pack.description_en;

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      // Step-by-step progress simulation + actual API fetch
      setProgress({ percent: 10, loadedMb: (pack.size_mb * 0.1).toFixed(1), totalMb: pack.size_mb, status: 'Connecting...' });
      
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev.percent >= 85) {
            clearInterval(timer);
            return prev;
          }
          const nextPercent = prev.percent + 15;
          return {
            percent: nextPercent,
            loadedMb: ((pack.size_mb * nextPercent) / 100).toFixed(1),
            totalMb: pack.size_mb,
            status: 'Transferring offline data...'
          };
        });
      }, 250);

      await downloadPackBundle(pack.id, (p) => {
        // Real callback
      });

      clearInterval(timer);
      setProgress({ percent: 100, loadedMb: pack.size_mb, totalMb: pack.size_mb, status: 'Installed ✓' });
      setTimeout(() => {
        setDownloading(false);
        if (onStatusChanged) onStatusChanged();
      }, 500);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Download failed. Please check connection and try again.');
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Remove offline data for ${name}?`)) {
      await removePackBundle(pack.id);
      if (onStatusChanged) onStatusChanged();
    }
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      isDownloaded
        ? 'bg-emerald-950/20 border-emerald-800/80 shadow-md'
        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-sm'
    }`}>
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {pack.province}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {pack.version}
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-white flex items-center gap-1.5">
            <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{name}</span>
          </h3>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 font-mono text-sm text-slate-200">
          <HardDrive className="w-4 h-4 text-sky-400" />
          <span>{pack.size_mb} MB</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-4">{description}</p>

      {/* Included items checklist */}
      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-4 text-xs">
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>{t('packs.included')}</span>
        </div>
        <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span>✓</span> <span className="text-slate-300">Offline Map</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span>✓</span> <span className="text-slate-300">Hospitals & Trauma</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span>✓</span> <span className="text-slate-300">Police & Security</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span>✓</span> <span className="text-slate-300">Fire & Rescue</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span>✓</span> <span className="text-slate-300">Emergency Guides</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span>✓</span> <span className="text-slate-300">Public Transport</span>
          </div>
        </div>
      </div>

      {/* Progress Bar during download */}
      {downloading && (
        <div className="mb-4 bg-slate-950 p-3 rounded-xl border border-sky-800/50">
          <div className="flex justify-between text-xs font-semibold text-sky-300 mb-1.5">
            <span>{t('packs.downloading')} ({progress.percent}%)</span>
            <span>{progress.loadedMb} MB / {progress.totalMb} MB</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 text-xs text-red-400 bg-red-950/40 p-2.5 rounded-lg border border-red-800">
          {error}
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
        <div className="text-[11px] text-slate-500">
          {t('packs.lastUpdated')}: {pack.last_updated}
        </div>

        <div>
          {isDownloaded ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t('packs.downloaded')}</span>
              </span>
              <button
                onClick={handleDelete}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                title={t('packs.deletePack')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-950 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? t('packs.downloading') : t('packs.download')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
