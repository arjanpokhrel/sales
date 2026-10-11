import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Navigation, Bookmark, BookmarkCheck, Copy, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db, pushRecent, toggleBookmark, haversineKm } from '../offline/db';
import { getLivePlace } from '../data/liveDirectory';
import { useCopy } from '../components/useCopy';

// Detail for directory places (hospitals, police, pharmacies…).
// Distances are straight-line approximations; routing needs internet.
export default function PlaceDetailPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [place, setPlace] = useState(null);
  const [saved, setSaved] = useState(false);
  const [dist, setDist] = useState(null);
  const [nearby, setNearby] = useState([]);
  const { copied, copy } = useCopy();

  useEffect(() => {
    (async () => {
      let p = null;
      if (String(id).startsWith('osm-')) {
        // Live OSM result from the map — kept in a memory cache, expires on reload.
        p = getLivePlace(id);
      } else {
        p = await db.locations.get(Number(id)).catch(() => null);
        if (!p) p = await db.locations.get(id).catch(() => null);
      }
      if (!p && !navigator.onLine) return;
      if (!p) {
        try {
          const r = await fetch(`/api/locations/${id}`);
          const j = await r.json();
          p = j.location || null;
        } catch { /* offline */ }
      }
      setPlace(p);
      if (p) {
        pushRecent({ id: `loc-${p.id}`, kind: 'location', refId: String(p.id),
          title_en: p.name_en, title_ne: p.name_ne }).catch(() => {});
        db.table('bookmarks').get(`loc-${p.id}`).then((b) => setSaved(!!b)).catch(() => {});
        if (navigator.geolocation && p.latitude && p.longitude) {
          navigator.geolocation.getCurrentPosition(
            (pos) => setDist(haversineKm(pos.coords.latitude, pos.coords.longitude,
              Number(p.latitude), Number(p.longitude))),
            () => {}, { timeout: 8000 }
          );
        }
        // Nearby directory places with coordinates (straight-line, approximate)
        try {
          const all = await db.locations.toArray();
          const plat = Number(p.latitude), plng = Number(p.longitude);
          if (plat && plng) {
            setNearby(all
              .filter((o) => String(o.id) !== String(p.id) && Number(o.latitude) && Number(o.longitude))
              .map((o) => ({ ...o, _km: haversineKm(plat, plng, Number(o.latitude), Number(o.longitude)) }))
              .sort((a, b) => a._km - b._km)
              .slice(0, 4));
          }
        } catch { /* ignore */ }
      }
    })();
  }, [id]);

  if (!place) {
    const isLive = String(id).startsWith('osm-');
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <p className="text-slate-400 text-sm">
          {isLive
            ? (lang === 'ne'
              ? 'यो लाइभ नतिजाको म्याद सकियो — नक्सामा गएर फेरि खोज्नुहोस्।'
              : 'This live result expired — search again from the map.')
            : (lang === 'ne' ? 'स्थान भेटिएन वा अफलाइनमा उपलब्ध छैन।' : 'Place not found or not downloaded for offline.')}
        </p>
        <Link to="/map" className="text-sky-400 text-sm font-bold">← {lang === 'ne' ? 'नक्सा' : 'Map'}</Link>
      </div>
    );
  }

  const name = lang === 'ne' ? (place.name_ne || place.name_en) : (place.name_en || place.name_ne);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <Link to="/help" className="inline-flex items-center gap-1 text-xs font-bold text-sky-400">
        <ArrowLeft className="w-3.5 h-3.5" /> {lang === 'ne' ? 'फर्कनुहोस्' : 'Back'}
      </Link>
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">{place.category_id}</span>
            <h1 className="text-2xl font-black text-white mt-1">{name}</h1>
            {(place.address_en || place.region) && (
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />{place.address_en || place.region}
              </p>
            )}
            {dist != null && (
              <p className="text-xs text-emerald-300 mt-1">≈ {dist.toFixed(1)} km {lang === 'ne' ? '(सिधा दूरी)' : '(straight-line)'}</p>
            )}
          </div>
          <button
            onClick={async () => {
              const v = await toggleBookmark({ id: `loc-${place.id}`, kind: 'location',
                refId: String(place.id), title_en: place.name_en, title_ne: place.name_ne });
              setSaved(v);
            }}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200"
            title="Bookmark"
          >
            {saved ? <BookmarkCheck className="w-5 h-5 text-emerald-400" /> : <Bookmark className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {place.phone && (
            <a href={`tel:${place.phone}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold">
              <Phone className="w-4 h-4" /> {place.phone}
            </a>
          )}
          {(place.latitude && place.longitude) && (
            <a href={`https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=15/${place.latitude}/${place.longitude}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold">
              <Navigation className="w-4 h-4" /> {lang === 'ne' ? 'नक्सामा हेर्नुहोस्' : 'Open in map'}
            </a>
          )}
        </div>
        {place.verification_status && (
          <p className="text-[11px] text-slate-500 mt-3">
            {place.verification_status === 'verified_official' ? '✓ ' : ''}
            {place.verification_status}{place.last_verified ? ` · ${place.last_verified}` : ''}
          </p>
        )}
      </div>

      {/* Every stored fact about this place */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <h2 className="font-bold text-white text-sm mb-3">
          {lang === 'ne' ? 'सबै विवरण' : 'All details'}
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
          {[
            [lang === 'ne' ? 'श्रेणी' : 'Category', place.category_id || '—'],
            [lang === 'ne' ? 'क्षेत्र' : 'Region', place.region || '—'],
            [lang === 'ne' ? 'ठेगाना' : 'Address', place.address_en || place.address_ne || '—'],
            [lang === 'ne' ? 'फोन' : 'Phone', place.phone || place.emergency_phone || '—'],
            [lang === 'ne' ? 'सिधा दूरी' : 'Straight-line distance',
              dist != null ? `≈ ${dist.toFixed(dist < 10 ? 1 : 0)} km` : '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 py-1.5 border-b border-slate-800/70">
              <dt className="text-slate-400 text-xs">{k}</dt>
              <dd className="text-slate-100 text-xs font-semibold text-right">{v}</dd>
            </div>
          ))}
        </dl>
        {(place.latitude && place.longitude) && (
          <button
            onClick={() => copy(`${Number(place.latitude).toFixed(5)}, ${Number(place.longitude).toFixed(5)}`)}
            className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-100 transition active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {Number(place.latitude).toFixed(5)}, {Number(place.longitude).toFixed(5)}
            <span className="text-slate-400 font-semibold">
              {copied ? (lang === 'ne' ? '✓ कपी भयो' : '✓ Copied') : (lang === 'ne' ? '· कपी' : '· Copy')}
            </span>
          </button>
        )}
      </div>

      {/* Nearby places */}
      {nearby.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-3">
            {lang === 'ne' ? 'नजिकका स्थानहरू' : 'Nearby places'}
          </h2>
          <div className="space-y-2">
            {nearby.map((n) => (
              <Link key={n.id} to={`/places/${n.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-700 transition">
                <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">{lang === 'ne' ? (n.name_ne || n.name_en) : (n.name_en || n.name_ne)}</div>
                  <div className="text-[11px] text-slate-400">{n.category_id}</div>
                </div>
                <div className="text-[11px] text-emerald-300 font-bold">≈ {n._km.toFixed(n._km < 10 ? 1 : 0)} km</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
