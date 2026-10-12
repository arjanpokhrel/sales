import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function QuickActionCard({ title, description, icon: Icon, to, color = 'blue' }) {
  const colorStyles = {
    blue: 'border-sky-500/20 bg-sky-950/20 hover:border-sky-500/40 text-sky-400 group-hover:text-sky-300',
    red: 'border-red-500/30 bg-red-950/20 hover:border-red-500/50 text-red-400 group-hover:text-red-300',
    emerald: 'border-emerald-500/20 bg-emerald-950/20 hover:border-emerald-500/40 text-emerald-400 group-hover:text-emerald-300',
    amber: 'border-amber-500/20 bg-amber-950/20 hover:border-amber-500/40 text-amber-400 group-hover:text-amber-300'
  };

  const iconBgStyles = {
    blue: 'bg-gradient-to-br from-sky-500/25 to-sky-900/40 text-sky-300 ring-1 ring-sky-400/20',
    red: 'bg-gradient-to-br from-red-500/25 to-red-900/40 text-red-300 ring-1 ring-red-400/20',
    emerald: 'bg-gradient-to-br from-emerald-500/25 to-emerald-900/40 text-emerald-300 ring-1 ring-emerald-400/20',
    amber: 'bg-gradient-to-br from-amber-500/25 to-amber-900/40 text-amber-300 ring-1 ring-amber-400/20'
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
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 active:scale-[0.99] ${colorStyles[color] || colorStyles.blue}`}
    >
      <span className={`pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r ${topGlow[color] || topGlow.blue} to-transparent`} />
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-2xl ${iconBgStyles[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
