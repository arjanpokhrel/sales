import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { db } from '../offline/db';
import {
  ArrowLeft,
  ShieldCheck,
  PhoneCall,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function GuideDetailPage() {
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const { isOnline } = useNetwork();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  const isNepali = lang === 'ne';

  useEffect(() => {
    async function loadGuide() {
      setLoading(true);
      try {
        if (isOnline) {
          const res = await fetch(`/api/guides/${slug}`);
          if (res.ok) {
            const data = await res.json();
            if (data.guide) {
              setGuide(data.guide);
              setLoading(false);
              return;
            }
          }
        }

        // Offline mode: load from IndexedDB
        const local = await db.guides.where('slug').equals(slug).first();
        if (local) {
          setGuide(local);
        }
      } catch (err) {
        console.warn('Failed to load guide:', err);
        const local = await db.guides.where('slug').equals(slug).first();
        setGuide(local);
      } finally {
        setLoading(false);
      }
    }

    loadGuide();
  }, [slug, isOnline]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p>Loading emergency protocol...</p>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Guide Not Found</h2>
        <p className="text-sm text-slate-400">
          This emergency guide hasn't been downloaded or does not exist.
        </p>
        <Link
          to="/guides"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Guides</span>
        </Link>
      </div>
    );
  }

  const title = isNepali ? guide.title_ne : guide.title_en;
  const immediateActions = isNepali ? guide.immediate_actions_ne : guide.immediate_actions_en;
  const afterActions = isNepali ? guide.after_actions_ne : guide.after_actions_en;
  const doNotActions = isNepali ? guide.do_not_actions_ne : guide.do_not_actions_en;
  const whenToSeekHelp = isNepali ? guide.when_to_seek_help_ne : guide.when_to_seek_help_en;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Navigation Back */}
      <Link
        to="/guides"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Emergency Library</span>
      </Link>

      {/* Guide Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-red-600/30 text-red-400 border border-red-500/40">
            {guide.category_id}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-800/80">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('guides.availableOffline')}</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Source: <strong>{guide.authoritative_source}</strong></span>
          <span>Version: {guide.version}</span>
          <span>Updated: {guide.updated_at?.split('T')[0] || '2026-09-25'}</span>
        </div>
      </div>

      {/* Section 1: IF IT STARTS NOW (Action Steps 01, 02, 03) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <h2 className="text-sm font-black uppercase tracking-widest text-red-400">
            {t('guides.ifStartsNow')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {immediateActions.map((action, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-gradient-to-b from-red-950/40 to-slate-900 border border-red-900/60 shadow-md flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl font-black text-red-500 font-mono">
                  {String(action.step || idx + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-black text-white mt-1 mb-2">
                  {action.title}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {action.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: AFTER THE EVENT */}
      <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{t('guides.afterShaking')}</span>
        </h2>

        <div className="space-y-2.5">
          {afterActions.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: DO NOT */}
      <section className="p-6 rounded-2xl bg-red-950/20 border border-red-900/60 shadow-md space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{t('guides.doNot')}</span>
        </h2>

        <div className="space-y-2.5">
          {doNotActions.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm text-slate-200">
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: When to seek immediate medical help */}
      {whenToSeekHelp && (
        <section className="p-5 rounded-2xl bg-amber-950/20 border border-amber-900/60 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {t('guides.whenToSeekHelp')}
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed">
            {whenToSeekHelp}
          </p>
        </section>
      )}

      {/* Section 5: Direct Emergency Contacts */}
      <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-emerald-400" />
          <span>{t('guides.emergencyContacts')}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(guide.emergency_contacts || ['100', '101', '102']).map((num) => (
            <a
              key={num}
              href={`tel:${num}`}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-white font-black text-base transition active:scale-95 shadow"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400 group-hover:text-white" />
              <span>{num}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
