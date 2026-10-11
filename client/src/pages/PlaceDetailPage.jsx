import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Navigation, Bookmark, BookmarkCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db, pushRecent, toggleBookmark, haversineKm } from '../offline/db';

// Detail for directory places (hospitals, police, pharmacies…).
// Distances are straight-line approximations; routing needs internet.
export default function PlaceDetailPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [place, setPlace] = useState(null);
  const [saved, setSaved] = useState(false);
  const [dist, setDist] = useState(null);

  useEffect(() => {
    (async () => {
      let p = await db.locations.get(Number(id)).catch(() => null);
      if (!p) p = await db.locations.get(id).catch(() => null);
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
      }
    })();
  }, [id]);

  if (!place) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <p className="text-slate-400 text-sm">{lang === 'ne' ? 'स्थान भेटिएन वा अफलाइनमा उपलब्ध छैन।' : 'Place not found or not downloaded for offline.'}</p>
        <Link to="/help" className="text-sky-400 text-sm font-bold">← {lang === 'ne' ? 'नजिकको मद्दत' : 'Nearby help'}</Link>
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
    </div>
  );
}
