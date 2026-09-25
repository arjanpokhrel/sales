import React, { useState } from 'react';
import { PhoneCall, Navigation, ShieldCheck, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';

// Haversine formula in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
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
  const { coordinates, isOnline } = useNetwork();
  const [expanded, setExpanded] = useState(false);

  const isNepali = lang === 'ne';
  const name = isNepali ? location.name_ne : location.name_en;
  const address = isNepali ? location.address_ne : location.address_en;
  const description = isNepali ? location.description_ne : location.description_en;

  const distance = calculateDistance(
    coordinates.latitude,
    coordinates.longitude,
    location.latitude,
    location.longitude
  );

  const bearing = calculateBearing(
    coordinates.latitude,
    coordinates.longitude,
    location.latitude,
    location.longitude
  );

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
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-slate-800 border-sky-500 shadow-md ring-1 ring-sky-500'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
              {location.category_id}
            </span>
            {location.verification_status === 'verified' ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('status.verified')}</span>
              </span>
            ) : (
              <span className="text-[11px] text-amber-400 font-medium">
                {t('status.communitySubmitted')}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-white truncate">{name}</h3>
          
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
            <span className="truncate">{address || location.region}</span>
          </div>
        </div>

        {/* Distance Badge with Bearing */}
        {distance && (
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="text-sm font-extrabold text-sky-400">{distance}</span>
            <span className="text-[10px] text-slate-400 font-semibold">{bearing} {t('map.distanceAway')}</span>
          </div>
        )}
      </div>

      {/* Description when expanded */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1.5">
          <p>{description}</p>
          <div className="text-[11px] text-slate-400">
            <strong>Operating:</strong> {location.operating_hours || '24/7'}
          </div>
          <div className="text-[11px] text-slate-400">
            <strong>Verified Source:</strong> {location.source || 'NepaReady Disaster Authority'}
          </div>
          <div className="text-[10px] text-slate-500">
            GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {phoneNumber && (
            <a
              href={`tel:${phoneNumber}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t('map.call')}</span>
            </a>
          )}

          <button
            onClick={handleDirections}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{t('map.directions')}</span>
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 p-1"
        >
          <span>{expanded ? 'Less' : 'Details'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
