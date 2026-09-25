import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { downloadPackBundle } from '../offline/db';
import { Navigation, Download, CheckCircle2, AlertTriangle, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

export default function TravelModePage() {
  const { lang, t } = useLanguage();
  const { downloadedPacks, refreshDownloadedPacks } = useNetwork();

  const [fromCity, setFromCity] = useState('Biratnagar');
  const [toCity, setToCity] = useState('Pokhara');
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const cityOptions = ['Biratnagar', 'Dharan', 'Itahari', 'Kathmandu', 'Pokhara'];

  // Map destination city to pack id
  const packMapping = {
    Biratnagar: 'biratnagar-koshi',
    Dharan: 'dharan-koshi',
    Itahari: 'itahari-koshi',
    Kathmandu: 'kathmandu-valley',
    Pokhara: 'pokhara-gandaki'
  };

  const targetPackId = packMapping[toCity];
  const isAlreadyDownloaded = downloadedPacks.some(p => p.id === targetPackId);

  const handleDownloadTravelPack = async () => {
    setDownloading(true);
    setDownloadSuccess(false);
    try {
      await downloadPackBundle(targetPackId);
      await refreshDownloadedPacks();
      setDownloadSuccess(true);
    } catch (err) {
      console.error('Failed to download travel bundle:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Navigation className="w-7 h-7 text-sky-400" />
          <span>{t('travel.title')}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {t('travel.subtitle')}
        </p>
      </div>

      {/* Origin / Destination Pickers */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t('travel.origin')}
            </label>
            <select
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-semibold text-white outline-none focus:border-sky-500"
            >
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  📍 {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t('travel.destination')}
            </label>
            <select
              value={toCity}
              onChange={(e) => {
                setToCity(e.target.value);
                setDownloadSuccess(false);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-semibold text-white outline-none focus:border-sky-500"
            >
              {cityOptions.map((c) => (
                <option key={c} value={c} disabled={c === fromCity}>
                  🏁 {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Highway Alert notice */}
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/80 text-xs text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Highway Advisory (Prithvi / BP Highway):</strong> High risk of monsoon rockfalls and road closures. Nepal Traffic Police Hotline is <strong>103</strong>.
          </div>
        </div>
      </div>

      {/* Recommended Travel Bundle Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-950/30 via-slate-900 to-slate-900 border border-sky-800/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              {t('travel.recommendation')}
            </span>
            <h2 className="text-xl font-black text-white mt-1">
              {toCity} Complete Travel Package
            </h2>
          </div>
          <span className="px-3 py-1 rounded-xl bg-slate-800 text-xs font-mono font-bold text-slate-300">
            ~48 MB
          </span>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>✓ {toCity} Offline Map & GeoJSON Boundaries</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>✓ Regional Trauma Hospitals & 24/7 Pharmacies</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>✓ District Police Units & Highway Patrol Numbers</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>✓ Earthquake, Landslide & First Aid Emergency Guides</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>✓ Intercity Bus Terminals & Transit Routes</span>
          </div>
        </div>

        <div className="pt-2">
          {isAlreadyDownloaded || downloadSuccess ? (
            <div className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{toCity} Travel Pack Downloaded & Ready for Offline Use ✓</span>
            </div>
          ) : (
            <button
              onClick={handleDownloadTravelPack}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-red-950 transition active:scale-95"
            >
              <Download className="w-5 h-5" />
              <span>
                {downloading ? 'Bundling and downloading...' : t('travel.downloadTravelPack')}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
