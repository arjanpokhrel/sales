import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { db } from '../offline/db';
import LocationCard from '../components/LocationCard';
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
  WifiOff
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

// Map controller to center view
function MapViewHandler({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 14, { animate: true });
    }
  }, [center, zoom, map]);
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
      setMapCenter([coordinates.latitude, coordinates.longitude]);
    } else if (activePack && activePack.center) {
      setMapCenter(activePack.center);
    }
  }, [coordinates.isRealGps, activePack]);

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
                setMapCenter([coordinates.latitude, coordinates.longitude]);
                setMapZoom(15);
              }
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition"
            title="Recenter to my location"
          >
            <Compass className="w-5 h-5" />
          </button>
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
          <MapViewHandler center={mapCenter} zoom={mapZoom} />

          {/* OpenStreetMap Tile Layer (Browser caches viewed tiles) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* User Location Marker & Accuracy Circle */}
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
                  html: `
                    <div style="
                      width: 18px;
                      height: 18px;
                      border-radius: 50%;
                      background-color: #0284C7;
                      border: 3px solid #ffffff;
                      box-shadow: 0 0 12px rgba(2,132,199,0.8);
                    "></div>
                  `,
                  iconSize: [18, 18],
                  iconAnchor: [9, 9]
                })}
              >
                <Popup>
                  <div className="text-xs">
                    <strong>My Location</strong>
                    <br />
                    Accuracy: ±{coordinates.accuracy} m
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Locations Markers */}
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
