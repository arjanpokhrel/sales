import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronRight, AlertOctagon, Flame, Waves, Mountain, Zap, HeartPulse, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function GuideCard({ guide }) {
  const { lang, t } = useLanguage();
  const isNepali = lang === 'ne';

  const title = isNepali ? guide.title_ne : guide.title_en;

  const getGuideIcon = (categoryId) => {
    switch (categoryId) {
      case 'earthquake':
        return <Activity className="w-6 h-6 text-amber-400" />;
      case 'fire':
        return <Flame className="w-6 h-6 text-red-500" />;
      case 'flood':
        return <Waves className="w-6 h-6 text-sky-400" />;
      case 'landslide':
        return <Mountain className="w-6 h-6 text-stone-400" />;
      case 'snake_bite':
        return <AlertOctagon className="w-6 h-6 text-emerald-400" />;
      case 'electrical':
        return <Zap className="w-6 h-6 text-yellow-400" />;
      case 'first_aid':
      default:
        return <HeartPulse className="w-6 h-6 text-rose-400" />;
    }
  };

  return (
    <Link
      to={`/guides/${guide.slug}`}
      className="group flex flex-col justify-between p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 rounded-xl bg-slate-800/80 group-hover:bg-slate-800 transition">
            {getGuideIcon(guide.category_id)}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('guides.availableOffline')}</span>
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-sky-300 transition-colors mb-2">
          {title}
        </h3>

        <div className="space-y-1 mb-4">
          {(isNepali ? guide.immediate_actions_ne : guide.immediate_actions_en).slice(0, 2).map((act, i) => (
            <div key={i} className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
              <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="truncate">{act.title}: {act.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px] truncate">{guide.authoritative_source}</span>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
