import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Navigation, Bookmark, BookmarkCheck, Copy, Check, Globe, Clock, Layers, ExternalLink, QrCode } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db, pushRecent, toggleBookmark, haversineKm } from '../offline/db';
import { getLivePlace } from '../data/liveDirectory';
import { useCopy } from '../components/useCopy';
import LocationQrModal from '../components/LocationQrModal';
import AudioVoiceGuideButton from '../components/AudioVoiceGuideButton';

export default function PlaceDetailPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [place, setPlace] = useState(null);
  const [saved, setSaved] = useState(false);
  const [dist, setDist] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [showQr, setShowQr] = useState(false);
  const { copied, copy } = useCopy();

  useEffect(() => {
    (async () => {
      let p = null;
      if (String(id).startsWith('osm-')) {
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
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {isLive
            ? (lang === 'ne'
              ? 'यो लाइभ नतिजाको म्याद सकियो — नक्सामा गएर फेरि खोज्नुहोस्।'
              : 'This live result expired — search again from the map.')
            : (lang === 'ne' ? 'स्थान भेटिएन वा अफलाइनमा उपलब्ध छैन।' : 'Place not found or not downloaded for offline.')}
        </p>
        <Link to="/map" className="text-sky-600 dark:text-sky-400 text-sm font-bold">← {lang === 'ne' ? 'नक्सा' : 'Map'}</Link>
      </div>
    );
  }

  const name = lang === 'ne' ? (place.name_ne || place.name_en) : (place.name_en || place.name_ne);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link to="/map" className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400">
        <ArrowLeft className="w-3.5 h-3.5" /> {lang === 'ne' ? 'नक्सामा फर्कनुहोस्' : 'Back to map'}
      </Link>
      
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
              {place.category_id}
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-2">{name}</h1>
            {(place.address_en || place.region) && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-red-500" />
                {place.address_en || place.region}
              </p>
            )}
            {dist != null && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                ≈ {dist.toFixed(1)} km {lang === 'ne' ? '(सिधा दूरी)' : '(straight-line distance)'}
              </p>
            )}
          </div>
          <button
            onClick={async () => {
              const v = await toggleBookmark({ id: `loc-${place.id}`, kind: 'location',
                refId: String(place.id), title_en: place.name_en, title_ne: place.name_ne });
              setSaved(v);
            }}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title="Bookmark"
          >
            {saved ? <BookmarkCheck className="w-5 h-5 text-emerald-500" /> : <Bookmark className="w-5 h-5" />}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2.5 mt-5">
          {place.phone && (
            <a href={`tel:${place.phone}`} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95">
              <Phone className="w-4 h-4" /> {place.phone}
            </a>
          )}
          {(place.latitude && place.longitude) && (
            <>
              <Link
                to={`/map?lat=${place.latitude}&lng=${place.longitude}&zoom=16`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
              >
                <Navigation className="w-4 h-4" /> {lang === 'ne' ? 'नक्सामा हेर्नुहोस्' : 'Explore on Map'}
              </Link>
              <Link
                to="/directions"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold transition"
              >
                {lang === 'ne' ? 'बाटो र दूरी' : 'Directions'}
              </Link>
            </>
          )}
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold transition"
            >
              <Globe className="w-4 h-4 text-sky-500" />
              <span>{lang === 'ne' ? 'वेबसाइट' : 'Website'}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
          {place.latitude && place.longitude && (
            <button
              onClick={() => setShowQr(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold transition"
              title="Share Location QR Code"
            >
              <QrCode className="w-4 h-4 text-sky-500" />
              <span>{lang === 'ne' ? 'QR कोड' : 'Share QR'}</span>
            </button>
          )}
          <AudioVoiceGuideButton
            text={`${name}. ${place.address_en || place.region || ''}. ${place.phone ? `सम्पर्क फोन नम्बर ${place.phone}.` : ''} ${place.services ? `सेवाहरू: ${Array.isArray(place.services) ? place.services.join(', ') : place.services}.` : ''}`}
          />
        </div>

        {/* Location QR Code Modal */}
        <LocationQrModal
          isOpen={showQr}
          onClose={() => setShowQr(false)}
          title={name}
          lat={place.latitude}
          lng={place.longitude}
          address={place.address_en || place.region}
        />

        {place.services && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              {lang === 'ne' ? 'सेवाहरू' : 'Services'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(Array.isArray(place.services) ? place.services : String(place.services).split(',')).map((s, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {typeof s === 'string' ? s.trim() : s}
                </span>
              ))}
            </div>
          </div>
        )}

        {place.verification_status && (
          <p className="text-[11px] text-slate-400 mt-4">
            {place.verification_status === 'verified_official' ? '✓ Official Government Record' : place.verification_status}
            {place.last_verified ? ` · Last verified: ${place.last_verified}` : ''}
          </p>
        )}
      </div>

      {/* Every stored fact about this place */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
          {lang === 'ne' ? 'सबै विवरण' : 'All details'}
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
          {[
            [lang === 'ne' ? 'श्रेणी' : 'Category', place.category_id || '—'],
            [lang === 'ne' ? 'क्षेत्र' : 'Region', place.region || '—'],
            [lang === 'ne' ? 'ठेगाना' : 'Address', place.address_en || place.address_ne || '—'],
            [lang === 'ne' ? 'फोन' : 'Phone', place.phone || place.emergency_phone || '—'],
            [lang === 'ne' ? 'समय' : 'Opening Hours', place.opening_hours || (place.is_24_7 ? '24/7' : '—')],
            [lang === 'ne' ? 'सिधा दूरी' : 'Straight-line distance',
              dist != null ? `≈ ${dist.toFixed(dist < 10 ? 1 : 0)} km` : '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 py-1.5 border-b border-slate-100 dark:border-slate-800/70">
              <dt className="text-slate-500 dark:text-slate-400 text-xs">{k}</dt>
              <dd className="text-slate-800 dark:text-slate-100 text-xs font-semibold text-right">{v}</dd>
            </div>
          ))}
        </dl>
        {(place.latitude && place.longitude) && (
          <button
            onClick={() => copy(`${Number(place.latitude).toFixed(5)}, ${Number(place.longitude).toFixed(5)}`)}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 transition active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {Number(place.latitude).toFixed(5)}, {Number(place.longitude).toFixed(5)}
            <span className="text-slate-500 font-semibold">
              {copied ? (lang === 'ne' ? '✓ कपी भयो' : '✓ Copied') : (lang === 'ne' ? '· कपी' : '· Copy')}
            </span>
          </button>
        )}
      </div>

      {/* Nearby places */}
      {nearby.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {lang === 'ne' ? 'नजिकका स्थानहरू' : 'Nearby places'}
          </h2>
          <div className="space-y-2">
            {nearby.map((n) => (
              <Link key={n.id} to={`/places/${n.id}`}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/60 shadow-sm transition">
                <MapPin className="w-4 h-4 text-sky-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 dark:text-white text-sm truncate">{lang === 'ne' ? (n.name_ne || n.name_en) : (n.name_en || n.name_ne)}</div>
                  <div className="text-[11px] text-slate-400 capitalize">{n.category_id}</div>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">≈ {n._km.toFixed(n._km < 10 ? 1 : 0)} km</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
