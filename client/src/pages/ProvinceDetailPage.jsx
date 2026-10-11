import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Camera } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../offline/db';
import { getProvince } from '../data/provinces';

export default function ProvinceDetailPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [province, setProvince] = useState(() => getProvince(id));
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    db.table('provinces').get(id).then((r) => { if (r) setProvince(r); }).catch(() => {});
    db.table('destinations').where('province').equals(id).toArray()
      .then(setDestinations).catch(() => {});
  }, [id]);

  if (!province) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400">{lang === 'ne' ? 'प्रदेश भेटिएन।' : 'Province not found.'}</p>
        <Link to="/provinces" className="text-sky-400 text-sm font-bold">← {lang === 'ne' ? 'प्रदेशहरू' : 'Provinces'}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link to="/provinces" className="inline-flex items-center gap-1 text-xs font-bold text-sky-400">
        <ArrowLeft className="w-3.5 h-3.5" /> {lang === 'ne' ? 'प्रदेशहरू' : 'Provinces'}
      </Link>
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {lang === 'ne' ? province.name_ne : province.name_en}
        </h1>
        <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-red-400" />
          {lang === 'ne' ? 'राजधानी' : 'Capital'}: {lang === 'ne' ? province.capital_ne : province.capital_en}
        </p>
        <p className="text-[11px] text-slate-500 mt-2">
          {lang === 'ne'
            ? 'नोट: नगरपालिका/वडा तथ्याङ्क अहिले समावेश छैन — उपलब्ध भएपछि थपिनेछ।'
            : 'Note: municipality/ward data is not bundled yet — district level only.'}
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-3">
          {lang === 'ne' ? `जिल्लाहरू (${province.districts.length})` : `Districts (${province.districts.length})`}
        </h2>
        <div className="flex flex-wrap gap-2">
          {(province.districts || []).map((d) => (
            <span key={d} className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200">
              {d}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-3">
          {lang === 'ne' ? 'यस प्रदेशका गन्तव्यहरू' : 'Destinations in this province'}
        </h2>
        {destinations.length === 0 ? (
          <p className="text-sm text-slate-500">{lang === 'ne' ? 'अहिलेलाई सूची छैन।' : 'No bundled destinations yet.'}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {destinations.map((d) => (
              <Link key={d.id} to={`/destinations/${d.id}`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-700 transition">
                {d.photo ? (
                  <img src={`/photos/${d.photo}.jpg`} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-5 h-5 text-slate-500" />
                  </div>
                )}
                <div className="font-semibold text-white text-sm">{lang === 'ne' ? d.name_ne : d.name_en}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
