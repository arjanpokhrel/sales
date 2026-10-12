import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpDown, Navigation, MapPin, TriangleAlert, ExternalLink, Locate, Car, Footprints, Bike } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db, haversineKm } from '../offline/db';

function bearing(lat1, lng1, lat2, lng2) {
  const y = Math.sin((lng2 - lng1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180)
    - Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lng2 - lng1) * Math.PI / 180);
  const b = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  return { deg: Math.round(b), compass: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(b / 45) % 8] };
}

export default function DirectionsPage() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [cands, setCands] = useState([]);
  const [picking, setPicking] = useState(null); // 'from' | 'to'
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!q.trim()) { setCands([]); return; }
    const h = setTimeout(async () => {
      const query = q.toLowerCase().trim();
      const out = [];
      try {
        const dests = await db.table('destinations').toArray();
        for (const d of dests) {
          if ((d.name_en || '').toLowerCase().includes(query) || (d.name_ne || '').includes(q.trim())) {
            out.push({ key: `d:${d.id}`, title_en: d.name_en, title_ne: d.name_ne, lat: d.lat, lng: d.lng, kind: lang === 'ne' ? 'गन्तव्य' : 'Destination' });
          }
        }
        const locs = await db.table('locations').toArray();
        for (const l of locs.slice(0, 500)) {
          if (((l.name_en || '').toLowerCase().includes(query)) || ((l.name_ne || '').includes(q.trim()))) {
            out.push({ key: `l:${l.id}`, title_en: l.name_en, title_ne: l.name_ne, lat: Number(l.latitude), lng: Number(l.longitude), kind: l.category_id });
          }
        }
      } catch { /* ignore */ }
      setCands(out.slice(0, 15));
    }, 200);
    return () => clearTimeout(h);
  }, [q, lang]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setFrom({
          key: 'current-gps',
          title_en: 'My Current Location (GPS)',
          title_ne: 'मेरो हालको स्थान (GPS)',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          kind: 'GPS'
        });
        setPicking(null);
      },
      (err) => {
        setLocating(false);
        alert(lang === 'ne' ? 'स्थान अनुमति पाइएन।' : 'Location access was denied or timed out.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

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
      className={`w-full flex items-center gap-2.5 p-3.5 rounded-2xl border text-left transition shadow-sm ${
        picking === which
          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 dark:border-sky-500 ring-2 ring-sky-500/20'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <MapPin className={`w-5 h-5 flex-shrink-0 ${which === 'from' ? 'text-emerald-500' : 'text-red-500'}`} />
      <span className="flex-1 min-w-0">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {which === 'from' ? (lang === 'ne' ? 'कहाँबाट' : 'From') : (lang === 'ne' ? 'कहाँ जाने' : 'To')}
        </span>
        <span className="block text-sm font-bold text-slate-800 dark:text-white truncate">
          {value ? (lang === 'ne' ? (value.title_ne || value.title_en) : (value.title_en || value.title_ne))
            : (lang === 'ne' ? 'ठाउँ छान्नुहोस्' : 'Choose a place')}
        </span>
      </span>
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          {lang === 'ne' ? 'बाटो योजना र दूरी' : 'Directions & Travel Estimates'}
        </h1>
        <button
          onClick={useCurrentLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 hover:bg-sky-200 transition"
        >
          <Locate className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
          <span>{lang === 'ne' ? 'मेरो स्थान' : 'My GPS'}</span>
        </button>
      </div>

      <div className="space-y-2">
        <Slot which="from" value={from} />
        <div className="flex justify-center -my-1">
          <button
            onClick={() => { setFrom(to); setTo(from); }}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            aria-label="Swap"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
        <Slot which="to" value={to} />
      </div>

      {picking && (
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-sky-400 dark:border-sky-800 shadow-lg">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={lang === 'ne' ? 'पोखरा, मन्त्रालय, अस्पताल…' : 'Search destination, hospital, ministry…'}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white outline-none focus:border-sky-500"
          />
          <div className="mt-2 space-y-1 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {cands.map((c) => (
              <button key={c.key} onClick={() => choose(c)}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <span className="block text-sm font-semibold text-slate-800 dark:text-white">
                  {lang === 'ne' ? (c.title_ne || c.title_en) : (c.title_en || c.title_ne)}
                </span>
                <span className="text-[11px] text-slate-400 capitalize">{c.kind}</span>
              </button>
            ))}
            {q.trim() && cands.length === 0 && (
              <p className="text-xs text-slate-500 p-2">
                {lang === 'ne' ? 'बन्डल डाटामा भेटिएन।' : 'Not found in the offline directory.'}
              </p>
            )}
          </div>
        </div>
      )}

      {plan && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">≈ {plan.km.toFixed(plan.km < 10 ? 1 : 0)} km</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'ne' ? 'सिधा दूरी (अनुमानित)' : 'Estimated straight distance'} · {plan.deg}° {plan.compass}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800">
              <Navigation className="w-7 h-7 text-sky-500" style={{ transform: `rotate(${plan.deg}deg)` }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
              <Car className="w-4 h-4 mx-auto text-blue-500 mb-1" />
              <div className="text-sm font-black text-slate-800 dark:text-white">~{(plan.km / 28).toFixed(1)}h</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">{lang === 'ne' ? 'गाडी' : 'Driving'}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
              <Bike className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
              <div className="text-sm font-black text-slate-800 dark:text-white">~{(plan.km / 14).toFixed(1)}h</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">{lang === 'ne' ? 'साइकल' : 'Cycling'}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
              <Footprints className="w-4 h-4 mx-auto text-amber-500 mb-1" />
              <div className="text-sm font-black text-slate-800 dark:text-white">~{(plan.km / 4.2).toFixed(1)}h</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">{lang === 'ne' ? 'पैदल' : 'Walking'}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                const title = to.title_en || to.title_ne || 'Destination';
                navigate(`/map?lat=${to.lat}&lng=${to.lng}&zoom=15&dest=${encodeURIComponent(title)}`);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition"
            >
              {lang === 'ne' ? 'नक्सामा बाटो हेर्नुहोस्' : 'Explore Route on Map'}
            </button>
            <a
              href={`https://www.openstreetmap.org/directions?from=${from.lat}%2C${from.lng}&to=${to.lat}%2C${to.lng}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {lang === 'ne' ? 'अनलाइन टर्न-बाइ-टर्न (OSM)' : 'Online turn-by-turn (OSM)'}
            </a>
          </div>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex gap-2">
        <TriangleAlert className="w-5 h-5 text-amber-600 dark:text-amber-300 flex-shrink-0" />
        <p className="text-[11px] text-amber-800 dark:text-amber-200/90 leading-relaxed">
          {lang === 'ne'
            ? 'यो योजना सिधा-रेखा दूरी हो — सडक दूरी होइन। अफलाइन टर्न-बाइ-टर्न यस संस्करणमा छैन।'
            : 'This plan computes straight-line distance across Nepal coordinates. Offline routing graphs require online routing services for turn-by-turn navigation.'}
        </p>
      </div>

      <Link to="/map" className="block text-center text-xs font-bold text-sky-600 dark:text-sky-400">
        {lang === 'ne' ? '← मुख्य नक्सामा फर्कनुहोस्' : '← Return to main map'}
      </Link>
    </div>
  );
}
