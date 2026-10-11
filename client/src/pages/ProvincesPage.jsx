import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../offline/db';
import { PROVINCES } from '../data/provinces';

export default function ProvincesPage() {
  const { lang } = useLanguage();
  const [provinces, setProvinces] = useState(PROVINCES);

  useEffect(() => {
    db.table('provinces').toArray()
      .then((rows) => { if (rows.length > 0) setProvinces(rows); })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {lang === 'ne' ? 'प्रदेशहरू' : 'Provinces of Nepal'}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {lang === 'ne'
            ? '७ प्रदेश, ७७ जिल्ला — अफलाइन उपलब्ध आधारभूत प्रशासनिक जानकारी।'
            : '7 provinces, 77 districts — bundled administrative reference, available offline.'}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {provinces.map((p) => (
          <Link
            key={p.id}
            to={`/provinces/${p.id}`}
            className="flex items-center justify-between p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-700 transition active:scale-[0.99]"
          >
            <div>
              <div className="font-bold text-white">
                {lang === 'ne' ? p.name_ne : p.name_en}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>
                  {lang === 'ne' ? 'राजधानी' : 'Capital'}: {lang === 'ne' ? p.capital_ne : p.capital_en}
                  {' · '}{(p.districts || []).length} {lang === 'ne' ? 'जिल्ला' : 'districts'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
