import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneCall, Navigation, ShieldCheck, ChevronDown, ChevronUp,
  MapPin, Globe, Bookmark, BookmarkCheck, Car, Footprints, Bike, Share2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { db, toggleBookmark } from '../offline/db';

// Haversine formula in kilometers
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km) {
  if (km == null) return null;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// Compass bearing calculation in degrees (0 = North, 90 = East, 180 = South, 270 = West)
function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin((lon2 - lon1) * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180));
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos((lon2 - lon1) * (Math.PI / 180));
  const brng = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  const compassPoints = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(brng / 45) % 8;
  return compassPoints[index];
}

export default function LocationCard({ location, onSelectLocation, isSelected = false }) {
  const { lang, t } = useLanguage();
  const { coordinates } = useNetwork();
  const [expanded, setExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    let active = true;
    if (location && location.id) {
      db.table('bookmarks').get(`loc-${location.id}`)
        .then((b) => { if (active) setIsBookmarked(!!b); })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [location?.id]);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    const next = await toggleBookmark({
      id: `loc-${location.id}`,
      kind: 'location',
      refId: String(location.id),
      title_en: location.name_en,
      title_ne: location.name_ne,
      category_id: location.category_id,
      latitude: location.latitude,
      longitude: location.longitude,
      address_en: location.address_en || location.region
    });
    setIsBookmarked(next);
  };

  const isNepali = lang === 'ne';
  const name = isNepali ? location.name_ne : location.name_en;
  const address = isNepali ? location.address_ne : location.address_en;
  const description = isNepali ? location.description_ne : location.description_en;

  const distKm = calculateDistanceKm(
    coordinates.latitude,
    coordinates.longitude,
    location.latitude,
    location.longitude
  );

  const distance = formatDistance(distKm);

  const bearing = calculateBearing(
    coordinates.latitude,
    coordinates.longitude,
    location.latitude,
    location.longitude
  );

  const driveMins = distKm != null ? Math.max(2, Math.round((distKm / 35) * 60)) : null;
  const walkMins = distKm != null ? Math.round((distKm / 4.5) * 60) : null;
  const cycleMins = distKm != null ? Math.round((distKm / 15) * 60) : null;

  const phoneNumber = location.emergency_phone || location.phone;

  const handleDirections = (e) => {
    e.stopPropagation();
    if (onSelectLocation) {
      onSelectLocation(location);
    }
  };

  return (
    <div
      onClick={() => onSelectLocation && onSelectLocation(location)}
      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-slate-900/95 dark:bg-slate-900/95 border-sky-500 shadow-xl ring-2 ring-sky-500/50'
          : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-sky-500/60 dark:hover:border-slate-700 shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {location.category_id}
            </span>
            {location.verification_status === 'verified_official' ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isNepali ? 'प्रमाणित आधिकारिक' : 'Verified Official'}</span>
              </span>
            ) : location.verification_status === 'verified' ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('status.verified')}</span>
              </span>
            ) : location.verification_status === 'approximate' ? (
              <span className="text-[11px] text-amber-600 dark:text-amber-300 font-bold">
                📍 {isNepali ? 'अनुमानित स्थान' : 'Approximate pin'}
              </span>
            ) : location.verification_status === 'osm_live' ? (
              <span className="text-[11px] text-sky-600 dark:text-sky-300 font-bold">
                ● {isNepali ? 'लाइभ OSM' : 'LIVE OSM'}
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 font-medium">
                {t('status.communitySubmitted')}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{name}</h3>
          
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">{address || location.region}</span>
          </div>
        </div>

        {/* Distance Badge & Bookmark */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-lg border transition ${
              isBookmarked
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark location'}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
          {distance && (
            <div className="text-right">
              <span className="text-sm font-black text-sky-600 dark:text-sky-400">{distance}</span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{bearing} {t('map.distanceAway')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Travel Time Pills when distance is available */}
      {driveMins != null && (
        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 font-medium">
            <Car className="w-3 h-3 text-sky-500" />
            <span>~{driveMins < 60 ? `${driveMins}m` : `${(driveMins / 60).toFixed(1)}h`}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 font-medium">
            <Footprints className="w-3 h-3 text-emerald-500" />
            <span>~{walkMins < 60 ? `${walkMins}m` : `${(walkMins / 60).toFixed(1)}h`}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 font-medium">
            <Bike className="w-3 h-3 text-violet-500" />
            <span>~{cycleMins < 60 ? `${cycleMins}m` : `${(cycleMins / 60).toFixed(1)}h`}</span>
          </div>
        </div>
      )}

      {/* Services Chips */}
      {Array.isArray(location.services) && location.services.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {location.services.slice(0, 3).map((s, idx) => (
            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900 font-medium">
              {s}
            </span>
          ))}
          {location.services.length > 3 && (
            <span className="text-[10px] text-slate-400 self-center">+{location.services.length - 3}</span>
          )}
        </div>
      )}

      {/* Description when expanded */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
          {description ? <p>{description}</p> : null}
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            <strong>{isNepali ? 'समय:' : 'Hours:'}</strong>{' '}
            {location.operating_hours || (isNepali ? 'सूची छैन' : 'Not listed')}
          </div>
          {phoneNumber && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              <strong>{isNepali ? 'फोन:' : 'Phone:'}</strong> {phoneNumber}
            </div>
          )}
          {location.website && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <strong>{isNepali ? 'वेबसाइट:' : 'Website:'}</strong>
              <a href={location.website} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline truncate">
                {location.website}
              </a>
            </div>
          )}
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            <strong>{isNepali ? 'स्रोत:' : 'Source:'}</strong> {location.source || 'Nepal Navigator'}
            {location.verified_at || location.last_verified
              ? ` · ${(location.verified_at || location.last_verified)}` : ''}
          </div>
          {location.verification_status === 'approximate' && (
            <div className="text-[11px] text-amber-600 dark:text-amber-300">
              {isNepali
                ? '📍 यो पिन अनुमानित हो — पुगेर पुष्टि गर्नुहोस्।'
                : '📍 Approximate pin — confirm when you arrive.'}
            </div>
          )}
          <div className="text-[10px] text-slate-400">
            GPS: {Number(location.latitude).toFixed(5)}, {Number(location.longitude).toFixed(5)}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {phoneNumber && (
            <a
              href={`tel:${phoneNumber}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition active:scale-95 shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t('map.call')}</span>
            </a>
          )}

          <button
            onClick={handleDirections}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition active:scale-95 shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{t('map.directions')}</span>
          </button>

          {location.website && (
            <a
              href={location.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              title="Official Website"
            >
              <Globe className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 p-1"
          >
            <span>{expanded ? 'Less' : 'Details'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <Link
            to={`/places/${location.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline p-1 whitespace-nowrap"
          >
            {isNepali ? 'विवरण →' : 'Full →'}
          </Link>
        </div>
      </div>
    </div>
  );
}
