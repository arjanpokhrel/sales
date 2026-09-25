import React from 'react';
import { useNetwork } from '../context/NetworkContext';
import { useLanguage } from '../context/LanguageContext';
import { Wifi, WifiOff, MapPin, CheckCircle2 } from 'lucide-react';

export default function StatusIndicator({ compact = false, showGps = true, className = '' }) {
  const { connectionStatus, gpsStatus, activePack, simulateOffline } = useNetwork();
  const { t } = useLanguage();

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'online':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 shadow-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Wifi className="w-3.5 h-3.5" />
            <span>{t('status.online')}</span>
          </div>
        );
      case 'offline-ready':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/90 text-emerald-200 border border-emerald-600 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('status.offlineReady')}</span>
            {activePack && (
              <span className="text-[11px] text-emerald-300/80 font-normal">
                ({activePack.region})
              </span>
            )}
          </div>
        );
      case 'offline':
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-950/80 text-red-300 border border-red-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <WifiOff className="w-3.5 h-3.5 text-red-400" />
            <span>{t('status.offline')}</span>
          </div>
        );
    }
  };

  const getGpsBadge = () => {
    if (!showGps) return null;
    const isAvailable = gpsStatus === 'available';
    return (
      <div
        title={t('status.gpsNotice')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          isAvailable
            ? 'bg-sky-950/60 text-sky-300 border-sky-800/80'
            : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}
      >
        <MapPin className={`w-3.5 h-3.5 ${isAvailable ? 'text-sky-400' : 'text-slate-500'}`} />
        <span>{isAvailable ? t('status.locationAvailable') : t('status.locationUnavailable')}</span>
      </div>
    );
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {getStatusBadge()}
      {getGpsBadge()}
      {simulateOffline && (
        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
          Simulated Offline
        </span>
      )}
    </div>
  );
}
