import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Mountain, Bookmark, BookmarkCheck, Navigation, Camera, Copy, Check, Expand } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { db, pushRecent, toggleBookmark, haversineKm } from '../offline/db';
import { getPhotoMeta, photoCreditLine } from '../data/photos';
import Lightbox from '../components/Lightbox';
import { useCopy } from '../components/useCopy';

function getDest(id) {
  return import('../data/destinations').then((m) => m.DESTINATIONS.find((d) => d.id === id) || null);
}

export default function DestinationDetailPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [dest, setDest] = useState(null);
  const [credit, setCredit] = useState('');
  const [saved, setSaved] = useState(false);
  const [dist, setDist] = useState(null);
  const [lightbox, setLightbox] = useState(false);
  const [nearby, setNearby] = useState([]);
  const { copied, copy } = useCopy();

  useEffect(() => {
    (async () => {
      let d = await db.table('destinations').get(id).catch(() => null);
      if (!d) d = await getDest(id);
      setDest(d);
      if (d) {
        pushRecent({ id: `dest-${d.id}`, kind: 'destination', refId: d.id,
          title_en: d.name_en, title_ne: d.name_ne }).catch(() => {});
        db.table('bookmarks').get(`dest-${d.id}`).then((b) => setSaved(!!b)).catch(() => {});
        if (d.photo) {
          const meta = await getPhotoMeta(d.photo).catch(() => null);
          if (meta) setCredit(`${photoCreditLine(meta)} · Wikimedia Commons`);
        }
        if (navigator.geolocation && d.lat) {
          navigator.geolocation.getCurrentPosition(
            (pos) => setDist(haversineKm(pos.coords.latitude, pos.coords.longitude, d.lat, d.lng)),
            () => {}, { timeout: 8000 }
          );
        }
        // Nearby destinations from bundled data (straight-line, approximate)
        try {
          const all = await db.table('destinations').toArray();
          setNearby(all
            .filter((o) => o.id !== d.id && o.lat && o.lng)
            .map((o) => ({ ...o, _km: haversineKm(d.lat, d.lng, o.lat, o.lng) }))
            .sort((a, b) => a._km - b._km)
            .slice(0, 4));
        } catch { /* ignore */ }
      }
    })();
  }, [id]);

  if (!dest) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 text-sm">{lang === 'ne' ? 'गन्तव्य भेटिएन।' : 'Destination not found.'}</p>
        <Link to="/destinations" className="text-sky-400 text-sm font-bold">← {lang === 'ne' ? 'गन्तव्यहरू' : 'Destinations'}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <Link to="/destinations" className="inline-flex items-center gap-1 text-xs font-bold text-sky-400">
        <ArrowLeft className="w-3.5 h-3.5" /> {lang === 'ne' ? 'गन्तव्यहरू' : 'Destinations'}
      </Link>
      {dest.photo ? (
        <figure className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800">
          <button className="relative block w-full group" onClick={() => setLightbox(true)}>
            <img src={`/photos/${dest.photo}.jpg`} alt={dest.name_en} className="w-full max-h-96 object-cover" />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/60 text-white text-[11px] font-bold opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition">
              <Expand className="w-3.5 h-3.5" /> HD
            </span>
          </button>
          {credit && <figcaption className="px-4 py-2 text-[11px] text-slate-500">📷 {credit}</figcaption>}
        </figure>
      ) : (
        <div className="rounded-3xl bg-slate-900 border border-dashed border-slate-700 p-10 text-center text-slate-500">
          <Camera className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{lang === 'ne' ? 'यस स्थानको अफलाइन फोटो उपलब्ध छैन।' : 'No offline photo for this place yet.'}</p>
        </div>
      )}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">{lang === 'ne' ? dest.name_ne : dest.name_en}</h1>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" />{dest.district} · {dest.province}
              {dest.elevation_m ? <span className="inline-flex items-center gap-1 ml-2"><Mountain className="w-3.5 h-3.5" />{dest.elevation_m}m</span> : null}
            </p>
            {dist != null && (
              <p className="text-xs text-emerald-300 mt-1">≈ {dist.toFixed(0)} km {lang === 'ne' ? '(सिधा दूरी, अनुमानित)' : '(straight-line, approximate)'}</p>
            )}
          </div>
          <button
            onClick={async () => {
              const v = await toggleBookmark({ id: `dest-${dest.id}`, kind: 'destination',
                refId: dest.id, title_en: dest.name_en, title_ne: dest.name_ne });
              setSaved(v);
            }}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700" title="Bookmark"
          >
            {saved ? <BookmarkCheck className="w-5 h-5 text-emerald-400" /> : <Bookmark className="w-5 h-5 text-slate-200" />}
          </button>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mt-3">
          {lang === 'ne' ? dest.summary_ne : dest.summary_en}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Link to="/map" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-800 hover:bg-sky-700 text-white text-sm font-bold">
            <MapPin className="w-4 h-4" /> {lang === 'ne' ? 'नक्सामा हेर्नुहोस्' : 'View on map'}
          </Link>
          <a href={`https://www.openstreetmap.org/?mlat=${dest.lat}&mlon=${dest.lng}#map=13/${dest.lat}/${dest.lng}`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold">
            <Navigation className="w-4 h-4" /> OSM
          </a>
        </div>
        {!dest.verified && (
          <p className="text-[11px] text-amber-300/80 mt-3">
            {lang === 'ne' ? '⚠ यो विवरण अझै फिल्ड-प्रमाणित छैन — यात्रा अघि स्थानीय स्रोतसँग पुष्टि गर्नुहोस्।'
              : '⚠ Details not yet field-verified — confirm with local sources before travelling.'}
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
            [lang === 'ne' ? 'श्रेणी' : 'Category', dest.category],
            [lang === 'ne' ? 'प्रदेश' : 'Province', dest.province],
            [lang === 'ne' ? 'जिल्ला' : 'District', dest.district],
            [lang === 'ne' ? 'उचाइ' : 'Elevation', dest.elevation_m ? `${dest.elevation_m} m` : '—'],
            [lang === 'ne' ? 'प्रमाणीकरण' : 'Verification',
              dest.verified
                ? (lang === 'ne' ? '✓ प्रमाणित' : '✓ Verified')
                : (lang === 'ne' ? 'प्रमाणित हुन बाँकी' : 'Needs verification')],
            [lang === 'ne' ? 'सिधा दूरी' : 'Straight-line distance',
              dist != null ? `≈ ${dist.toFixed(dist < 10 ? 1 : 0)} km` : '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 py-1.5 border-b border-slate-800/70">
              <dt className="text-slate-400 text-xs">{k}</dt>
              <dd className="text-slate-100 text-xs font-semibold text-right">{v}</dd>
            </div>
          ))}
        </dl>
        <button
          onClick={() => copy(`${dest.lat.toFixed(5)}, ${dest.lng.toFixed(5)}`)}
          className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-100 transition active:scale-95"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {dest.lat.toFixed(5)}, {dest.lng.toFixed(5)}
          <span className="text-slate-400 font-semibold">
            {copied ? (lang === 'ne' ? '✓ कपी भयो' : '✓ Copied') : (lang === 'ne' ? '· कपी' : '· Copy')}
          </span>
        </button>
      </div>

      {/* Nearby destinations */}
      {nearby.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-3">
            {lang === 'ne' ? 'नजिकका गन्तव्यहरू' : 'Nearby destinations'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nearby.map((n) => (
              <Link key={n.id} to={`/destinations/${n.id}`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-700 transition">
                {n.photo ? (
                  <img src={`/photos/${n.photo}.jpg`} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-5 h-5 text-slate-500" />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-white text-sm">{lang === 'ne' ? n.name_ne : n.name_en}</div>
                  <div className="text-[11px] text-emerald-300">≈ {n._km.toFixed(n._km < 10 ? 1 : 0)} km</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      {lightbox && dest.photo && (
        <Lightbox
          src={`/photos/${dest.photo}.jpg`}
          alt={dest.name_en}
          credit={credit}
          onClose={() => setLightbox(false)}
        />
      )}
    </div>
  );
}
