import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import GuideCard from '../components/GuideCard';
import { db } from '../offline/db';
import { Search, BookOpen, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function GuidesPage() {
  const { lang, t } = useLanguage();
  const { isOnline } = useNetwork();
  const [guides, setGuides] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function loadGuides() {
      try {
        if (isOnline) {
          const res = await fetch('/api/guides');
          const data = await res.json();
          if (data.guides) {
            setGuides(data.guides);
            return;
          }
        }
        const local = await db.guides.toArray();
        setGuides(local);
      } catch (err) {
        const local = await db.guides.toArray();
        setGuides(local);
      }
    }
    loadGuides();
  }, [isOnline]);

  const filtered = guides.filter(g => {
    const q = query.toLowerCase();
    return (
      !q ||
      g.title_en.toLowerCase().includes(q) ||
      g.title_ne.includes(q) ||
      g.slug.includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('guides.availableOffline')}</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          {t('guides.title')}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {t('guides.subtitle')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guides: earthquake, snake bite, flood, fire..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-400 outline-none focus:border-sky-500"
        />
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>

      {/* Medical Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Medical & Emergency Advisory:</strong> The instructions provided in this application follow official disaster response manuals from the Nepal Red Cross Society, NDRRMA, and WHO protocols. These guides are for emergency stabilization and do not substitute for professional medical care.
        </div>
      </div>
    </div>
  );
}
