import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function QuickActionCard({ title, description, icon: Icon, to, color = 'blue' }) {
  const colorStyles = {
    blue: 'border-sky-200 dark:border-sky-500/20 bg-sky-50/70 dark:bg-sky-950/20 hover:border-sky-400 dark:hover:border-sky-500/40 text-sky-600 dark:text-sky-400',
    red: 'border-red-200 dark:border-red-500/30 bg-red-50/70 dark:bg-red-950/20 hover:border-red-400 dark:hover:border-red-500/50 text-red-600 dark:text-red-400',
    emerald: 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/20 hover:border-emerald-400 dark:hover:border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
    amber: 'border-amber-200 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-950/20 hover:border-amber-400 dark:hover:border-amber-500/40 text-amber-600 dark:text-amber-400'
  };

  const iconBgStyles = {
    blue: 'bg-sky-100 dark:bg-gradient-to-br dark:from-sky-500/25 dark:to-sky-900/40 text-sky-600 dark:text-sky-300 ring-1 ring-sky-300 dark:ring-sky-400/20',
    red: 'bg-red-100 dark:bg-gradient-to-br dark:from-red-500/25 dark:to-red-900/40 text-red-600 dark:text-red-300 ring-1 ring-red-300 dark:ring-red-400/20',
    emerald: 'bg-emerald-100 dark:bg-gradient-to-br dark:from-emerald-500/25 dark:to-emerald-900/40 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-400/20',
    amber: 'bg-amber-100 dark:bg-gradient-to-br dark:from-amber-500/25 dark:to-amber-900/40 text-amber-600 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-400/20'
  };

  const topGlow = {
    blue: 'from-sky-500/50',
    red: 'from-red-500/50',
    emerald: 'from-emerald-500/50',
    amber: 'from-amber-500/50'
  };

  return (
    <Link
      to={to}
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/50 active:scale-[0.99] ${colorStyles[color] || colorStyles.blue}`}
    >
      <span className={`pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r ${topGlow[color] || topGlow.blue} to-transparent`} />
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-2xl ${iconBgStyles[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white transition-transform group-hover:translate-x-1" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
