import React from 'react';
import { PhoneCall, ShieldCheck, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function EmergencyDialCard({ service, compact = false }) {
  const { lang, t } = useLanguage();
  const isNepali = lang === 'ne';

  const title = isNepali ? service.title_ne : service.title_en;
  const description = isNepali ? service.description_ne : service.description_en;

  const getBorderColor = () => {
    switch (service.category) {
      case 'police':
        return 'border-blue-500/40 hover:border-blue-500 bg-blue-950/20';
      case 'fire':
        return 'border-orange-500/40 hover:border-orange-500 bg-orange-950/20';
      case 'ambulance':
        return 'border-red-500/50 hover:border-red-500 bg-red-950/25';
      case 'disaster':
        return 'border-amber-500/40 hover:border-amber-500 bg-amber-950/20';
      default:
        return 'border-slate-700 hover:border-slate-500 bg-slate-900/40';
    }
  };

  const getButtonBg = () => {
    switch (service.category) {
      case 'ambulance':
      case 'fire':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'police':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      default:
        return 'bg-slate-700 hover:bg-slate-600 text-white';
    }
  };

  if (compact) {
    return (
      <a
        href={`tel:${service.number}`}
        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all active:scale-98 shadow-sm ${getBorderColor()}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center font-extrabold text-white text-base">
            {service.number}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">{title}</h4>
            <span className="text-[11px] text-slate-400">
              {service.is_toll_free ? 'Toll-Free • निःशुल्क' : service.region_scope}
            </span>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${getButtonBg()}`}>
          <PhoneCall className="w-3.5 h-3.5" />
          <span>{t('emergency.callNow')}</span>
        </div>
      </a>
    );
  }

  return (
    <div className={`flex flex-col justify-between p-5 rounded-2xl border transition-all shadow-md ${getBorderColor()}`}>
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
              {service.category}
            </span>
            {service.is_toll_free && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Toll-Free
              </span>
            )}
          </div>
          <div className="text-2xl font-black tracking-tight text-white px-2.5 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700">
            {service.number}
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">{description}</p>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="truncate">
            {t('status.lastVerified')}: {service.verified_at}
          </span>
        </div>

        <a
          href={`tel:${service.number}`}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${getButtonBg()}`}
        >
          <PhoneCall className="w-4 h-4 animate-bounce" />
          <span>{t('emergency.callNow')} {service.number}</span>
        </a>
      </div>
    </div>
  );
}
