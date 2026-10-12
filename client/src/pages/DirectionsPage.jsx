import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, Navigation, MapPin, TriangleAlert, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db, haversineKm } from '../offline/db';

// Route planner. Honest model: straight-line legs computed on-device from
// bundled coordinates. There is NO offline routing graph in this build, so
// this is an approximate plan — never turn-by-turn. Online, hop to OSM.
function bearing(lat1, lng1, lat2, lng2) {
  const y = Math.sin((lng2 - lng1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180)
    - Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lng2 - lng1) * Math.PI / 180);
  const b = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  return { deg: Math.round(b), compass: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(b / 45) % 8] };
}

export default function DirectionsPage() {
  const { lang } = useLanguage();
  const [q, setQ] = useState('');
  const [cands, setCands] = useState([]);
  const [picking, setPicking] = useState(null); // 'from' | 'to'
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  useEffect(() => {
    if (!q.trim()) { setCands([]); return; }
    const h = setTimeout(async () => {
      const query = q.toLowerCase().trim();
      const out = [];
      try {
        const dests = await db.table('destinations').toArray();
        for (const d of dests) {
          if ((d.name_en || '').toLowerCase().includes(query) || (d.name_ne || '').includes(q.trim())) {
            out.push({ key: `d:${d.id}`, title_en: d.name_en, title_ne: d.name_ne, lat: d.lat, lng: d.lng, kind: lang === 'ne' ? 'गन्तव्य' : 'place' });
          }
        }
        const locs = await db.table('locations').toArray();
        for (const l of locs.slice(0, 500)) {
          if (((l.name_en || '').toLowerCase().includes(query)) || ((l.name_ne || '').includes(q.trim()))) {
            out.push({ key: `l:${l.id}`, title_en: l.name_en, title_ne: l.name_ne, lat: Number(l.latitude), lng: Number(l.longitude), kind: l.category_id });
          }
        }
      } catch { /* ignore */ }
      setCands(out.slice(0, 12));
    }, 220);
    return () => clearTimeout(h);
  }, [q, lang]);

  const plan = useMemo(() => {
    if (!from || !to || from.lat == null || to.lat == null) return null;
    const km = haversineKm(from.lat, from.lng, to.lat, to.lng);
    return { km, ...bearing(from.lat, from.lng, to.lat, to.lng) };
  }, [from, to]);

  const choose = (c) => {
    if (picking === 'from') setFrom(c); else setTo(c);
    setQ(''); setCands([]); setPicking(null);
  };

  const Slot = ({ which, value }) => (
    <button
      onClick={() => { setPicking(which); setQ(''); setCands([]); }}
      className={`w-full flex items-center gap-2.5 p-3.5 rounded-2xl border text-left transition ${
        picking === which ? 'bg-sky-950/60 border-sky-600' : 'bg-slate-900 border-slate-700'
      }`}
    >
      <MapPin className={`w-5 h-5 flex-shrink-0 ${which === 'from' ? 'text-emerald-400' : 'text-red-400'}`} />
      <span className="flex-1 min-w-0">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {which === 'from' ? (lang === 'ne' ? 'कहाँबाट' : 'From') : (lang === 'ne' ? 'कहाँ जाने' : 'To')}
        </span>
        <span className="block text-sm font-bold text-white truncate">
          {value ? (lang === 'ne' ? (value.title_ne || value.title_en) : (value.title_en || value.title_ne))
            : (lang === 'ne' ? 'ठाउँ छान्नुहोस्' : 'Choose a place')}
        </span>
      </span>
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <h1 className="text-2xl font-black text-white">
        {lang === 'ne' ? 'बाटो योजना' : 'Directions'}
      </h1>

      <div className="space-y-2">
        <Slot which="from" value={from} />
        <div className="flex justify-center -my-1">
          <button
            onClick={() => { setFrom(to); setTo(from); }}
            className="p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300"
            aria-label="Swap"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
        <Slot which="to" value={to} />
      </div>

      {picking && (
        <div className="p-3 rounded-2xl bg-slate-900 border border-sky-800">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={lang === 'ne' ? 'पोखरा, अस्पताल…' : 'Pokhara, hospital…'}
            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white outline-none focus:border-sky-500"
          />
          <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
            {cands.map((c) => (
              <button key={c.key} onClick={() => choose(c)}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 transition">
                <span className="block text-sm font-semibold text-white">
                  {lang === 'ne' ? (c.title_ne || c.title_en) : (c.title_en || c.title_ne)}
                </span>
                <span className="text-[11px] text-slate-500">{c.kind}</span>
              </button>
            ))}
            {q.trim() && cands.length === 0 && (
              <p className="text-xs text-slate-500 p-2">
                {lang === 'ne' ? 'बन्डल डाटामा भेटिएन।' : 'Not in the bundled data.'}
              </p>
            )}
          </div>
        </div>
      )}

      {plan && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-white">≈ {plan.km.toFixed(plan.km < 10 ? 1 : 0)} km</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {lang === 'ne' ? 'सिधा दूरी (अनुमानित)' : 'Straight-line distance (approximate)'} · {plan.deg}° {plan.compass}
              </div>
            </div>
            <Navigation className="w-8 h-8 text-sky-400" style={{ transform: `rotate(${plan.deg}deg)` }} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 rounded-xl bg-slate-800/70">
              <div className="text-sm font-black text-white">~{(plan.km / 4).toFixed(1)}h</div>
              <div className="text-[11px] text-slate-400">{lang === 'ne' ? 'पैदल अनुमान' : 'Walking est.'}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/70">
              <div className="text-sm font-black text-white">~{(plan.km / 28).toFixed(1)}h</div>
              <div className="text-[11px] text-slate-400">{lang === 'ne' ? 'गाडी अनुमान' : 'Driving est.'}</div>
            </div>
          </div>
          <a
            href={`https://www.openstreetmap.org/directions?from=${from.lat}%2C${from.lng}&to=${to.lat}%2C${to.lng}`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {lang === 'ne' ? 'अनलाइन टर्न-बाइ-टर्न (OSM)' : 'Online turn-by-turn (OSM)'}
          </a>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex gap-2">
        <TriangleAlert className="w-5 h-5 text-amber-300 flex-shrink-0" />
        <p className="text-[11px] text-amber-200/90 leading-relaxed">
          {lang === 'ne'
            ? 'यो योजना सिधा-रेखा दूरी हो — सडक दूरी होइन। अफलाइन टर्न-बाइ-टर्न यस संस्करणमा छैन।'
            : 'This plan is straight-line distance, not road distance. Offline turn-by-turn is not in this version.'}
        </p>
      </div>

      <Link to="/map" className="block text-center text-xs font-bold text-sky-400">
        {lang === 'ne' ? '← नक्सामा हेर्नुहोस्' : '← View on map'}
      </Link>
    </div>
  );
}
