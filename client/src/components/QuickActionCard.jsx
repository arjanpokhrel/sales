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
    blue: 'bg-sky-500/10 text-sky-400',
    red: 'bg-red-500/10 text-red-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400'
  };

  return (
    <Link
      to={to}
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 ${colorStyles[color] || colorStyles.blue}`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-xl ${iconBgStyles[color]}`}>
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
