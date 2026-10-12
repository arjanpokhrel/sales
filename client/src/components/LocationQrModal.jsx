import React, { useState } from 'react';
import { X, QrCode, Copy, Check, ExternalLink, MapPin, Share2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCopy } from './useCopy';

export default function LocationQrModal({ isOpen, onClose, title, lat, lng, address }) {
  const { lang } = useLanguage();
  const { copied, copy } = useCopy();

  if (!isOpen) return null;

  const geoUrl = `geo:${Number(lat).toFixed(5)},${Number(lng).toFixed(5)}?q=${encodeURIComponent(title || 'Location')}`;
  const webUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(geoUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
            {title}
          </h3>
          {address && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="truncate">{address}</span>
            </p>
          )}
        </div>

        {/* QR Display */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          <img
            src={qrImageUrl}
            alt="Location QR Code"
            className="w-48 h-48 rounded-xl object-contain bg-white p-2 border border-slate-200 shadow-sm"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling.style.display = 'block';
            }}
          />
          <div style={{ display: 'none' }} className="py-8 text-center space-y-2">
            <MapPin className="w-8 h-8 text-sky-500 mx-auto" />
            <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
            </div>
            <p className="text-[10px] text-slate-400">Scan via camera lens or copy below</p>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 block">
            {lang === 'ne' ? 'क्यामेराले स्क्यान गरी सिधै म्याप खोल्नुहोस्' : 'Scan with any camera to open coordinates'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => copy(`${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition active:scale-95 border border-slate-200 dark:border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? (lang === 'ne' ? 'कपी भयो!' : 'Coordinates Copied!') : `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`}</span>
          </button>

          <a
            href={geoUrl}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-sm transition active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>{lang === 'ne' ? 'फोनको म्यापमा शेयर / खोल्नुहोस्' : 'Open in Phone Map App'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

