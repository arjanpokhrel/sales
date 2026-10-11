import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, UtensilsCrossed, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../offline/db';

// Hotels & restaurants. Honest state: no verified commercial directory is
// bundled yet, so we do NOT invent listings. Shows saved stays + guidance.
export default function StaysPage() {
  const { lang } = useLanguage();
  const [stays, setStays] = useState([]);

  useEffect(() => {
    db.table('bookmarks').where('kind').equals('stay').toArray()
      .then(setStays).catch(() => {});
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <BedDouble className="w-7 h-7 text-sky-400" />
          {lang === 'ne' ? 'होटल र खाना' : 'Hotels & food'}
        </h1>
      </div>
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex gap-2">
        <Info className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/90 leading-relaxed">
          {lang === 'ne'
            ? 'प्रमाणित होटल/रेस्टुरेन्ट निर्देशिका अहिले समावेश छैन — हामी नक्कली नाम, फोन वा मूल्य लेख्दैनौं। आफ्नै चिनेका ठाउँहरू बुकमार्क गर्नुहोस्; प्रमाणित सूची आएपछि यहाँ देखिनेछ।'
            : 'No verified hotel/restaurant directory is bundled yet — we will not invent names, phones or prices. Bookmark places you know; verified listings will appear here when added.'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <BedDouble className="w-6 h-6 text-sky-400 mx-auto mb-1" />
          <div className="font-bold text-white text-sm">{lang === 'ne' ? 'मेरा बासस्थान' : 'My stays'}</div>
          <div className="text-xs text-slate-400 mt-0.5">{stays.length} {lang === 'ne' ? 'सुरक्षित' : 'saved'}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <UtensilsCrossed className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          <div className="font-bold text-white text-sm">{lang === 'ne' ? 'खाना' : 'Food'}</div>
          <div className="text-xs text-slate-400 mt-0.5">{lang === 'ne' ? 'छिट्टै आउँदैछ' : 'Coming with verified data'}</div>
        </div>
      </div>
      {stays.length > 0 && (
        <div className="space-y-2">
          {stays.map((s) => (
            <div key={s.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-semibold text-white text-sm">
              {lang === 'ne' ? (s.title_ne || s.title_en) : (s.title_en || s.title_ne)}
            </div>
          ))}
        </div>
      )}
      <Link to="/destinations" className="inline-block text-xs font-bold text-sky-400">
        {lang === 'ne' ? 'गन्तव्यहरू हेर्नुहोस् →' : 'Browse destinations →'}
      </Link>
    </div>
  );
}
