import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { db } from '../offline/db';
import LocationCard from '../components/LocationCard';
import { fetchLivePlaces, LIVE_AMENITIES } from '../data/liveDirectory';
import {
  Search,
  Filter,
  Navigation,
  Compass,
  MapPin,
  Layers,
  PhoneCall,
  X,
  Radio,
  WifiOff,
  LocateFixed,
  RefreshCw
} from 'lucide-react';

// Custom SVG icon generator for Leaflet markers
function createCustomMarker(color, emoji) {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      ">
        <span style="transform: rotate(45deg); font-size: 14px; margin-top: -2px;">${emoji}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

const categoryIcons = {
  hospital: { color: '#DC2626', emoji: '🏥' },
  police: { color: '#2563EB', emoji: '🚓' },
  fire: { color: '#EA580C', emoji: '🔥' },
  pharmacy: { color: '#16A34A', emoji: '💊' },
  disaster: { color: '#D97706', emoji: '⛑️' },
  atm: { color: '#0284C7', emoji: '🏧' },
  transport: { color: '#7C3AED', emoji: '🚌' },
  government: { color: '#475569', emoji: '🏛️' }
};

// Map controller: follows the live GPS dot (pan, keeps zoom) until the
// user drags the map, which drops follow mode so the map never fights back.
function LiveFollowController({ center, zoom, follow, isLive, onUserDrag }) {
  const map = useMap();
  useMapEvents({
    dragstart: () => { if (follow) onUserDrag(); }
  });
  useEffect(() => {
    if (follow && isLive && center && center[0] && center[1]) {
      map.panTo(center, { animate: true, duration: 0.6 });
      if (map.getZoom() < 14) map.setZoom(15, { animate: true });
    } else if (!follow && center && center[0] && center[1] && zoom) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, follow, isLive, map]);
  return null;
}

export default function MapPage() {
  const { lang, t } = useLanguage();
  const { coordinates, gpsStatus, isOnline, activePack } = useNetwork();

  const [locations, setLocations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routeLine, setRouteLine] = useState(null);
  const [mapCenter, setMapCenter] = useState([coordinates.latitude, coordinates.longitude]);
  const [mapZoom, setMapZoom] = useState(13);
  const [follow, setFollow] = useState(true); // live-follow until user drags
  // Live OSM directory (online only, user-triggered, never polled)
  const [liveOn, setLiveOn] = useState(true);
  const [liveItems, setLiveItems] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState('');
  const [liveQuery, setLiveQuery] = useState(0); // bump to (re)fetch around mapCenter

  // Load locations (Server if online, IndexedDB if offline)
  useEffect(() => {
    async function fetchLocations() {
      try {
        if (isOnline) {
          const res = await fetch('/api/locations');
          const data = await res.json();
          if (data.locations && data.locations.length > 0) {
            setLocations(data.locations);
            return;
          }
        }

        // Offline mode: load from IndexedDB
        const localLocs = await db.locations.toArray();
        if (localLocs.length > 0) {
          setLocations(localLocs);
        } else {
          // If empty in IndexedDB, fetch and auto-cache
          const res = await fetch('/api/locations');
          const data = await res.json();
          if (data.locations) {
            setLocations(data.locations);
            await db.locations.bulkPut(data.locations);
          }
        }
      } catch (err) {
        console.warn('Map location fetch notice:', err);
        const localLocs = await db.locations.toArray();
        setLocations(localLocs);
      }
    }

    fetchLocations();
  }, [isOnline]);

  // Recenter map on user GPS coordinates if available
  useEffect(() => {
    if (coordinates.isRealGps) {
      if (follow) setMapCenter([coordinates.latitude, coordinates.longitude]);
    } else if (activePack && activePack.center) {
      setMapCenter(activePack.center);
    }
  }, [coordinates.isRealGps, coordinates.latitude, coordinates.longitude, activePack, follow]);

  // Live directory: one Overpass query per category tap / refresh / recenter.
  // Debounced, online-only, max 60 results. Bundled data always stays.
  useEffect(() => {
    if (!isOnline || !liveOn || selectedCategory === 'all' || !LIVE_AMENITIES[selectedCategory]) {
      setLiveItems([]);
      setLiveError('');
      return;
    }
    setLiveLoading(true);
    setLiveError('');
    const h = setTimeout(async () => {
      try {
        const { items } = await fetchLivePlaces(selectedCategory, mapCenter[0], mapCenter[1]);
        setLiveItems(items);
      } catch (e) {
        setLiveError(lang === 'ne' ? 'लाइभ खोज असफल — बन्डल डाटा देखिँदैछ।' : 'Live search failed — showing bundled data.');
        setLiveItems([]);
      } finally {
        setLiveLoading(false);
      }
    }, 900);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, liveQuery, isOnline, liveOn]);

  // Filtered locations
  const filteredLocations = locations.filter((loc) => {
    const matchesCategory =
      selectedCategory === 'all' || loc.category_id === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      loc.name_en.toLowerCase().includes(q) ||
      loc.name_ne.includes(q) ||
      (loc.address_en && loc.address_en.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  // Handle location selection and offline straight-line direction polyline
  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setFollow(false); // stop trailing the GPS dot while inspecting a place
    setMapCenter([loc.latitude, loc.longitude]);
    setMapZoom(15);

    // Build straight-line route from user coordinates to destination
    setRouteLine([
      [coordinates.latitude, coordinates.longitude],
      [loc.latitude, loc.longitude]
    ]);
  };

  const clearSelection = () => {
    setSelectedLocation(null);
    setRouteLine(null);
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-[#0B192C]">
      {/* Top Filter and Search Bar */}
      <div className="z-20 bg-slate-900/95 border-b border-slate-800 p-3 sm:px-6 space-y-2 backdrop-blur-md shadow-md">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('map.searchPlaceholder')}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:border-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              if (coordinates.latitude) {
                setFollow(true);
                setMapCenter([coordinates.latitude, coordinates.longitude]);
                setMapZoom(15);
                setLiveQuery((q) => q + 1);
              }
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition"
            title={lang === 'ne' ? 'मेरो स्थानमा जानुहोस्' : 'Go to my location'}
          >
            <Compass className="w-5 h-5" />
          </button>

          {/* Live-follow toggle */}
          <button
            onClick={() => setFollow((f) => !f)}
            className={`p-2 rounded-xl border transition ${
              follow && coordinates.isRealGps
                ? 'bg-sky-700 border-sky-500 text-white shadow shadow-sky-950'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title={follow
              ? (lang === 'ne' ? 'लाइभ पछ्याउने बन्द' : 'Stop following me')
              : (lang === 'ne' ? 'मलाई लाइभ पछ्याउने' : 'Follow me live')}
          >
            <LocateFixed className="w-5 h-5" />
          </button>

          {/* Live GPS status chip */}
          {coordinates.isRealGps ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-950/90 border border-sky-700 text-[11px] font-bold text-sky-200 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-live-ring" />
              <span>LIVE · ±{coordinates.accuracy}m</span>
              {coordinates.speed != null && coordinates.speed > 0.5 && (
                <span>{(coordinates.speed * 3.6).toFixed(0)} km/h</span>
              )}
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-400 whitespace-nowrap">
              {gpsStatus === 'requesting'
                ? (lang === 'ne' ? 'स्थान खोज्दै…' : 'Locating…')
                : (lang === 'ne' ? 'स्थान छैन' : 'No GPS')}
            </div>
          )}
        </div>

        {/* Category Pills (Horizontal scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {t('map.allCategories')}
          </button>

          {Object.entries(categoryIcons).map(([catId, info]) => (
            <button
              key={catId}
              onClick={() => setSelectedCategory(catId)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
                selectedCategory === catId
                  ? 'bg-slate-100 text-slate-900 shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{info.emoji}</span>
              <span className="capitalize">{catId}</span>
            </button>
          ))}
        </div>

        {/* Live directory bar (online only) */}
        {isOnline && selectedCategory !== 'all' && LIVE_AMENITIES[selectedCategory] && (
          <div className="flex items-center gap-2 pt-1 text-[11px]">
            <button
              onClick={() => setLiveOn((v) => !v)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold border transition ${
                liveOn ? 'bg-sky-900/60 border-sky-600 text-sky-200' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${liveOn ? 'bg-sky-400' : 'bg-slate-500'}`} />
              {liveOn ? (lang === 'ne' ? 'लाइभ खोज चालु' : 'Live search ON') : (lang === 'ne' ? 'लाइभ खोज बन्द' : 'Live search OFF')}
            </button>
            {liveOn && (
              <>
                <span className="text-slate-400 font-semibold">
                  {liveLoading
                    ? (lang === 'ne' ? 'खोज्दै…' : 'Searching…')
                    : `${liveItems.length} ${lang === 'ne' ? 'लाइभ नतिजा (OSM)' : 'live results (OSM)'}`}
                </span>
                <button
                  onClick={() => setLiveQuery((q) => q + 1)}
                  className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-bold"
                >
                  <RefreshCw className={`w-3 h-3 ${liveLoading ? 'animate-spin' : ''}`} />
                  {lang === 'ne' ? 'ताजा' : 'Refresh'}
                </button>
              </>
            )}
          </div>
        )}
        {liveError && (
          <p className="text-[11px] text-amber-300 pt-1">{liveError}</p>
        )}
      </div>

      {/* Offline Status Warning Banner */}
      {!isOnline && (
        <div className="z-10 bg-amber-950/90 text-amber-200 border-b border-amber-800/80 px-4 py-1.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span>
              <strong>Offline Mode:</strong> Viewing downloaded offline places. Straight-line bearing direction active.
            </span>
          </div>
          {activePack && (
            <span className="text-[11px] font-bold text-emerald-400">
              {activePack.region} Pack Active
            </span>
          )}
        </div>
      )}

      {/* Main Interactive Leaflet Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <LiveFollowController
            center={mapCenter}
            zoom={mapZoom}
            follow={follow}
            isLive={coordinates.isRealGps}
            onUserDrag={() => setFollow(false)}
          />

          {/* OpenStreetMap Tile Layer (Browser caches viewed tiles) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Live user marker: heading arrow when moving, pulsing dot when still */}
          {coordinates.latitude && (
            <>
              <Circle
                center={[coordinates.latitude, coordinates.longitude]}
                radius={coordinates.accuracy || 20}
                pathOptions={{ color: '#0284C7', fillColor: '#38BDF8', fillOpacity: 0.15, weight: 1.5 }}
              />
              <Marker
                position={[coordinates.latitude, coordinates.longitude]}
                icon={L.divIcon({
                  className: 'user-gps-marker',
                  html: coordinates.heading != null && coordinates.speed != null && coordinates.speed > 0.5 ? `
                    <div style="transform: rotate(${coordinates.heading}deg); filter: drop-shadow(0 2px 6px rgba(2,132,199,0.8));">
                      <div style="
                        width: 0; height: 0;
                        border-left: 11px solid transparent;
                        border-right: 11px solid transparent;
                        border-bottom: 26px solid #0284C7;
                        margin: 0 auto;
                      "></div>
                      <div style="
                        width: 14px; height: 14px; border-radius: 50%;
                        background-color: #38BDF8; border: 3px solid #ffffff;
                        margin: -8px auto 0;
                      "></div>
                    </div>
                  ` : `
                    <div class="animate-live-ring" style="
                      width: 18px;
                      height: 18px;
                      border-radius: 50%;
                      background-color: #0284C7;
                      border: 3px solid #ffffff;
                    "></div>
                  `,
                  iconSize: [26, 30],
                  iconAnchor: [13, 15]
                })}
              >
                <Popup>
                  <div className="text-xs">
                    <strong>{lang === 'ne' ? 'मेरो लाइभ स्थान' : 'My live location'}</strong>
                    <br />
                    ±{coordinates.accuracy} m
                    {coordinates.speed != null && coordinates.speed > 0.5 &&
                      ` · ${(coordinates.speed * 3.6).toFixed(0)} km/h`}
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Locations Markers (bundled directory) */}
          {filteredLocations.map((loc) => {
            const iconInfo = categoryIcons[loc.category_id] || { color: '#64748B', emoji: '📍' };
            const markerIcon = createCustomMarker(iconInfo.color, iconInfo.emoji);

            return (
              <Marker
                key={loc.id}
                position={[loc.latitude, loc.longitude]}
                icon={markerIcon}
                eventHandlers={{
                  click: () => handleSelectLocation(loc)
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[200px]">
                    <div className="text-xs font-bold text-white mb-1">
                      {lang === 'ne' ? loc.name_ne : loc.name_en}
                    </div>
                    <div className="text-[11px] text-slate-300 mb-2">
                      {loc.address_en || loc.region}
                    </div>
                    {(loc.phone || loc.emergency_phone) && (
                      <a
                        href={`tel:${loc.emergency_phone || loc.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 text-white text-xs font-bold"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Live OSM markers — sky pins, only for the chosen category */}
          {liveItems.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={createCustomMarker('#0EA5E9', (categoryIcons[loc.category_id] || {}).emoji || '📍')}
              eventHandlers={{
                click: () => handleSelectLocation(loc)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <div className="text-[10px] font-black text-sky-300 mb-0.5">● LIVE OSM</div>
                  <div className="text-xs font-bold text-white mb-1">
                    {lang === 'ne' ? (loc.name_ne || loc.name_en) : loc.name_en}
                  </div>
                  <div className="text-[11px] text-slate-300 mb-2">
                    {loc.address_en || (lang === 'ne' ? 'ठेगाना सूची छैन' : 'No address listed')}
                  </div>
                  {loc.phone && (
                    <a
                      href={`tel:${loc.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 text-white text-xs font-bold"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Offline Straight-Line Polyline Route */}
          {routeLine && (
            <Polyline
              positions={routeLine}
              pathOptions={{
                color: '#38BDF8',
                weight: 4,
                dashArray: '8, 8',
                opacity: 0.85
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Bottom Sheet Drawer for Selected Location */}
      {selectedLocation && (
        <div className="z-30 absolute bottom-16 lg:bottom-4 left-4 right-4 max-w-lg mx-auto animate-slide-up">
          <div className="relative">
            <button
              onClick={clearSelection}
              className="absolute -top-3 -right-3 z-40 p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
            <LocationCard
              location={selectedLocation}
              isSelected={true}
              onSelectLocation={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
}
