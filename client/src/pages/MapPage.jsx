import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { useTheme } from '../context/ThemeContext';
import { db, saveCustomPin, getCustomPins, deleteCustomPin, haversineKm } from '../offline/db';
import LocationCard from '../components/LocationCard';
import VoiceSearchButton from '../components/VoiceSearchButton';
import LocationQrModal from '../components/LocationQrModal';
import { fetchLivePlaces, LIVE_AMENITIES } from '../data/liveDirectory';
import {
  Search,
  Compass,
  MapPin,
  Layers,
  PhoneCall,
  X,
  WifiOff,
  LocateFixed,
  RefreshCw,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Navigation,
  Globe,
  CheckCircle2,
  AlertCircle,
  Trash2,
  QrCode,
  Share2,
  Droplet,
  Car,
  Bus,
  Mountain,
  Building2,
  Bike,
  Footprints,
  Clock,
  ArrowRight,
  CornerUpRight,
  Play,
  Volume2,
  VolumeX,
  CloudRain,
  AlertOctagon,
  Activity,
  Radio,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Custom SVG icon generator for Leaflet markers
function createCustomMarker(color, emoji, isSelected = false) {
  const size = isSelected ? 38 : 32;
  const anchorY = isSelected ? 38 : 32;
  const anchorX = isSelected ? 19 : 16;
  const shadow = isSelected ? '0 6px 16px rgba(0,0,0,0.6)' : '0 4px 10px rgba(0,0,0,0.4)';
  const border = isSelected ? '3px solid #38BDF8' : '2px solid #ffffff';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: ${border};
        box-shadow: ${shadow};
        transition: transform 0.2s ease;
      ">
        <span style="transform: rotate(45deg); font-size: ${isSelected ? 16 : 14}px; margin-top: -2px;">${emoji}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [anchorX, anchorY],
    popupAnchor: [0, -anchorY]
  });
}

// Category design system: distinct colors & icons
const categoryConfig = {
  government: { color: '#475569', emoji: '🏛️', label_en: 'Government', label_ne: 'सरकारी' },
  hospital: { color: '#DC2626', emoji: '🏥', label_en: 'Hospitals', label_ne: 'अस्पताल' },
  police: { color: '#2563EB', emoji: '🚓', label_en: 'Police', label_ne: 'प्रहरी' },
  fire: { color: '#EA580C', emoji: '🔥', label_en: 'Fire', label_ne: 'दमकल' },
  pharmacy: { color: '#16A34A', emoji: '💊', label_en: 'Pharmacy', label_ne: 'औषधि' },
  school: { color: '#0D9488', emoji: '🏫', label_en: 'Education', label_ne: 'शिक्षा' },
  transport: { color: '#7C3AED', emoji: '🚌', label_en: 'Transit', label_ne: 'यातायात' },
  atm: { color: '#0284C7', emoji: '🏧', label_en: 'Banks/ATM', label_ne: 'बैंक' },
  utility: { color: '#CA8A04', emoji: '⚡', label_en: 'Utilities', label_ne: 'सेवा' },
  hotel: { color: '#6366F1', emoji: '🏨', label_en: 'Hotels', label_ne: 'होटल' },
  daily: { color: '#E11D48', emoji: '🛒', label_en: 'Daily/Fuel', label_ne: 'इन्धन' },
  tourism: { color: '#D97706', emoji: '🛕', label_en: 'Heritage', label_ne: 'सम्पदा' },
  disaster: { color: '#B45309', emoji: '⛑️', label_en: 'Shelters', label_ne: 'राहत' }
};

// Major Nepal cities for quick manual location selection
const NEPAL_CITIES = [
  { name: 'Kathmandu', name_ne: 'काठमाडौँ', lat: 27.7172, lng: 85.3240, zoom: 13 },
  { name: 'Pokhara', name_ne: 'पोखरा', lat: 28.2096, lng: 83.9856, zoom: 13 },
  { name: 'Lalitpur', name_ne: 'ललितपुर', lat: 27.6710, lng: 85.3150, zoom: 14 },
  { name: 'Biratnagar', name_ne: 'विराटनगर', lat: 26.4525, lng: 87.2718, zoom: 13 },
  { name: 'Bharatpur', name_ne: 'भरतपुर', lat: 27.6830, lng: 84.4350, zoom: 13 },
  { name: 'Dharan', name_ne: 'धरान', lat: 26.8124, lng: 87.2834, zoom: 13 },
  { name: 'Butwal', name_ne: 'बुटवल', lat: 27.7010, lng: 83.4650, zoom: 13 },
  { name: 'Birgunj', name_ne: 'वीरगन्ज', lat: 27.0110, lng: 84.8790, zoom: 13 },
  { name: 'Dhangadhi', name_ne: 'धनगढी', lat: 28.6920, lng: 80.5910, zoom: 13 },
  { name: 'Nepalgunj', name_ne: 'नेपालगन्ज', lat: 28.0530, lng: 81.6180, zoom: 13 },
  { name: 'Janakpur', name_ne: 'जनकपुर', lat: 26.7300, lng: 85.9265, zoom: 13 },
  { name: 'Hetauda', name_ne: 'हेटौँडा', lat: 27.4290, lng: 85.0310, zoom: 13 },
  { name: 'Surkhet', name_ne: 'सुर्खेत', lat: 28.5980, lng: 81.6350, zoom: 13 }
];

// Map tile layer providers - All 100% free, zero watermark, no API key required
// maxNativeZoom ensures Leaflet auto-scales tiles past native limits without hitting "Zoom Level Not Supported"
const MAP_LAYERS = {
  osm: {
    name: 'OpenStreetMap (Standard)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxNativeZoom: 19,
    maxZoom: 20
  },
  esriStreet: {
    name: 'Esri World Streets (Clean)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxNativeZoom: 17,
    maxZoom: 20
  },
  osmHot: {
    name: 'Humanitarian OSM (High Contrast)',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors, Humanitarian Team',
    maxNativeZoom: 18,
    maxZoom: 20
  },
  satellite: {
    name: 'Satellite (Esri Imagery)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Satellite Imagery',
    maxNativeZoom: 17,
    maxZoom: 20
  },
  topo: {
    name: 'Topographic (Mountains & Relief)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Topo Map',
    maxNativeZoom: 16,
    maxZoom: 20
  },
  shadedRelief: {
    name: '3D Shaded Relief (Himalayan Elevation)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Shaded Relief',
    maxNativeZoom: 13,
    maxZoom: 20
  }
};

// Map controller: follows live GPS and handles programatic pan/zoom & click
function MapController({ center, zoom, follow, onUserDrag, onMapClick }) {
  const map = useMap();

  useMapEvents({
    dragstart: () => {
      if (follow && onUserDrag) onUserDrag();
    },
    click: (e) => {
      if (onMapClick) onMapClick(e.latlng);
    }
  });

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true, duration: 0.8 });
    }
  }, [center, zoom, map]);

  return null;
}

// Map Controls Bridge: provides zoomIn, zoomOut, resetNorth to UI
function MapActionBridge({ registerActions }) {
  const map = useMap();
  useEffect(() => {
    registerActions({
      zoomIn: () => map.zoomIn(),
      zoomOut: () => map.zoomOut(),
      flyTo: (lat, lng, z = 14) => map.flyTo([lat, lng], z, { duration: 1.2 })
    });
  }, [map, registerActions]);
  return null;
}

export default function MapPage() {
  const { lang, t } = useLanguage();
  const { coordinates, gpsStatus, isOnline, activePack } = useNetwork();
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();

  const [locations, setLocations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routeLine, setRouteLine] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null); // { distanceKm, durationMins, mode, isRoadGeometry }
  const [routeMode, setRouteMode] = useState('driving'); // 'driving' | 'transit' | 'walking' | 'cycling'
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(true); // default collapsed so map & HUD are never blocked!
  const [mapCenter, setMapCenter] = useState([coordinates.latitude, coordinates.longitude]);
  const [mapZoom, setMapZoom] = useState(13);
  const [follow, setFollow] = useState(true);
  const [activeLayer, setActiveLayer] = useState('osm');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dismissGpsBanner, setDismissGpsBanner] = useState(false);

  // Modern Overlays & Controls
  const [showTraffic, setShowTraffic] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [routeSteps, setRouteSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Custom offline dropped pins
  const [customPins, setCustomPins] = useState([]);
  const [isDroppingPin, setIsDroppingPin] = useState(false);
  const [newPinModal, setNewPinModal] = useState(null); // { lat, lng }
  const [newPinTitle, setNewPinTitle] = useState('');
  const [newPinNote, setNewPinNote] = useState('');
  const [selectedCustomPin, setSelectedCustomPin] = useState(null);
  const [qrModalData, setQrModalData] = useState(null);

  // Live OSM directory (online only, on explicit request)
  const [liveOn, setLiveOn] = useState(false);
  const [liveItems, setLiveItems] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState('');
  const [liveQuery, setLiveQuery] = useState(0);

  const containerRef = useRef(null);
  const mapActionsRef = useRef(null);

  // Load custom pins from IndexedDB
  useEffect(() => {
    getCustomPins().then((pins) => setCustomPins(pins || [])).catch(() => {});
  }, []);

  // Load locations (from server or IndexedDB)
  useEffect(() => {
    async function loadLocations() {
      try {
        if (isOnline) {
          const res = await fetch('/api/locations');
          const data = await res.json();
          if (data.locations && data.locations.length > 0) {
            setLocations(data.locations);
            await db.locations.bulkPut(data.locations).catch(() => {});
            return;
          }
        }

        // Offline mode: load from IndexedDB
        const localLocs = await db.locations.toArray();
        if (localLocs.length > 0) {
          setLocations(localLocs);
        } else {
          // If empty in IndexedDB, fetch static bundled data
          const res = await fetch('/data/locations.json');
          if (res.ok) {
            const staticLocs = await res.json();
            setLocations(staticLocs);
            await db.locations.bulkPut(staticLocs).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Map locations load notice:', err);
        const localLocs = await db.locations.toArray().catch(() => []);
        if (localLocs.length > 0) setLocations(localLocs);
      }
    }

    loadLocations();
  }, [isOnline]);

  // URL Query Params: auto-center and route to target location (e.g. from Directions / Explore page)
  useEffect(() => {
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const zoom = parseInt(searchParams.get('zoom'), 10) || 15;
    const destName = searchParams.get('dest') || searchParams.get('title');

    if (!isNaN(lat) && !isNaN(lng)) {
      setFollow(false);
      setMapCenter([lat, lng]);
      setMapZoom(zoom);
      setSelectedLocation({
        id: `target_${lat}_${lng}`,
        name_en: destName || 'Target Location',
        name_ne: destName || 'गन्तव्य स्थान',
        latitude: lat,
        longitude: lng,
        category_id: 'destination'
      });
      setIsSheetCollapsed(true);
    }
  }, [searchParams]);

  // Recenter map on user GPS coordinates when GPS fixes arrive
  useEffect(() => {
    if (searchParams.get('lat')) return; // do not override user query target
    if (coordinates.isRealGps) {
      if (follow) {
        setMapCenter([coordinates.latitude, coordinates.longitude]);
      }
    } else if (activePack && activePack.center) {
      setMapCenter(activePack.center);
    }
  }, [coordinates.isRealGps, coordinates.latitude, coordinates.longitude, activePack, follow, searchParams]);

  // Live OSM directory search
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
    }, 800);
    return () => clearTimeout(h);
  }, [selectedCategory, liveQuery, isOnline, liveOn, mapCenter, lang]);

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesCategory =
        selectedCategory === 'all' || loc.category_id === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        (loc.name_en && loc.name_en.toLowerCase().includes(q)) ||
        (loc.name_ne && loc.name_ne.includes(q)) ||
        (loc.address_en && loc.address_en.toLowerCase().includes(q)) ||
        (loc.address_ne && loc.address_ne.includes(q)) ||
        (loc.region && loc.region.toLowerCase().includes(q)) ||
        (loc.district && loc.district.toLowerCase().includes(q)) ||
        (loc.category_id && loc.category_id.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [locations, selectedCategory, searchQuery]);

  // Real-time Route Calculation (Online: OSRM Turn-by-turn road geometry; Offline: Haversine straight line)
  useEffect(() => {
    if (!selectedLocation || !coordinates.latitude || !coordinates.longitude) {
      setRouteLine(null);
      setRouteInfo(null);
      return;
    }

    let isMounted = true;
    const fromLat = coordinates.latitude;
    const fromLng = coordinates.longitude;
    const toLat = selectedLocation.latitude;
    const toLng = selectedLocation.longitude;

    const straightKm = haversineKm(fromLat, fromLng, toLat, toLng);

    // Initial fallback straight line
    const speedKmH = routeMode === 'walking' ? 4.5 : routeMode === 'cycling' ? 14 : routeMode === 'transit' ? 22 : 32;
    setRouteLine([[fromLat, fromLng], [toLat, toLng]]);
    setRouteInfo({
      distanceKm: straightKm,
      durationMins: Math.round((straightKm / speedKmH) * 60),
      mode: routeMode,
      isRoadGeometry: false
    });

    if (isOnline) {
      setIsCalculatingRoute(true);
      // Transit/Bus shares road network geometry with driving profile but adjusts timing for local bus stops
      const osrmProfile = routeMode === 'walking' ? 'foot' : routeMode === 'cycling' ? 'bicycle' : 'driving';
      const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&steps=true&geometries=geojson`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          if (data && data.routes && data.routes.length > 0) {
            const r = data.routes[0];
            const coords = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            const distKm = r.distance / 1000;
            const baseDurMins = Math.round(r.duration / 60);
            const durMins = routeMode === 'transit' ? Math.round(baseDurMins * 1.35) : baseDurMins;

            // Extract turn-by-turn navigation steps
            const rawSteps = r.legs?.[0]?.steps || [];
            const parsedSteps = rawSteps.map((s, idx) => {
              const modifier = s.maneuver?.modifier || '';
              const type = s.maneuver?.type || 'turn';
              let nepaliInstruction = 'सिधा अगाडि बढ्नुहोस्';

              if (type === 'depart') {
                nepaliInstruction = s.name ? `${s.name} बाट यात्रा सुरु गर्नुहोस्` : 'यात्रा सुरु गर्नुहोस्';
              } else if (type === 'arrive') {
                nepaliInstruction = 'तपाईं आफ्नो गन्तव्यमा पुग्नुभयो';
              } else if (modifier.includes('right')) {
                nepaliInstruction = s.name ? `${s.name} तर्फ दायाँ मोड्नुहोस्` : 'दायाँ मोड्नुहोस्';
              } else if (modifier.includes('left')) {
                nepaliInstruction = s.name ? `${s.name} तर्फ बायाँ मोड्नुहोस्` : 'बायाँ मोड्नुहोस्';
              } else if (modifier.includes('uturn')) {
                nepaliInstruction = 'यु-टर्न (U-Turn) लिनुहोस्';
              } else if (s.name) {
                nepaliInstruction = `${s.name} मा सिधा जानुहोस्`;
              }

              return {
                id: idx,
                instruction_ne: nepaliInstruction,
                instruction_en: `${type.toUpperCase()}: ${s.name || 'Continue'} (${modifier || 'straight'})`,
                distanceMeters: Math.round(s.distance || 0),
                modifier,
                type
              };
            });

            setRouteSteps(parsedSteps);
            setCurrentStepIndex(0);

            setRouteLine(coords);
            setRouteInfo({
              distanceKm: distKm,
              durationMins: Math.max(1, durMins),
              mode: routeMode,
              isRoadGeometry: true
            });

            // Announce first instruction in Nepali voice if enabled
            if (voiceGuidance && parsedSteps.length > 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
              try {
                window.speechSynthesis.cancel();
                const utter = new SpeechSynthesisUtterance(parsedSteps[0].instruction_ne);
                utter.lang = 'ne-NP';
                utter.rate = 0.95;
                window.speechSynthesis.speak(utter);
              } catch { /* ignore */ }
            }
          }
        })
        .catch((err) => {
          console.warn('OSRM routing fallback to straight line:', err);
        })
        .finally(() => {
          if (isMounted) setIsCalculatingRoute(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [selectedLocation, coordinates.latitude, coordinates.longitude, routeMode, isOnline]);

  // Handle location selection
  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setFollow(false);
    setMapCenter([loc.latitude, loc.longitude]);
    setMapZoom(15);
  };

  // Live Weather Fetcher using Open-Meteo for current map coordinates
  useEffect(() => {
    if (!isOnline || !showWeather) return;
    const lat = coordinates.latitude || 27.7172;
    const lng = coordinates.longitude || 85.3240;

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.current) {
          setWeatherData(data.current);
        }
      })
      .catch((err) => console.warn('Weather fetch error:', err));
  }, [showWeather, coordinates.latitude, coordinates.longitude, isOnline]);

  // Voice announcement helper
  const speakInstruction = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'ne-NP';
        utter.rate = 0.95;
        window.speechSynthesis.speak(utter);
      } catch { /* ignore */ }
    }
  };

  const clearSelection = () => {
    setSelectedLocation(null);
    setRouteLine(null);
    setRouteInfo(null);
    setRouteSteps([]);
    setIsNavigating(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Recenter on user's location
  const handleLocateMe = () => {
    if (coordinates.latitude && coordinates.longitude) {
      setFollow(true);
      setMapCenter([coordinates.latitude, coordinates.longitude]);
      setMapZoom(15);
      if (mapActionsRef.current?.flyTo) {
        mapActionsRef.current.flyTo(coordinates.latitude, coordinates.longitude, 15);
      }
    }
  };

  // Jump to specific city
  const handleSelectCity = (city) => {
    setFollow(false);
    setMapCenter([city.lat, city.lng]);
    setMapZoom(city.zoom);
    if (mapActionsRef.current?.flyTo) {
      mapActionsRef.current.flyTo(city.lat, city.lng, city.zoom);
    }
    setShowCityPicker(false);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Custom Dropped Pin Handlers
  const handleMapClick = (latlng) => {
    if (isDroppingPin) {
      setNewPinModal({ lat: latlng.lat, lng: latlng.lng });
      setIsDroppingPin(false);
    }
  };

  const handleSaveNewPin = async (e) => {
    e.preventDefault();
    if (!newPinModal || !newPinTitle.trim()) return;

    const pin = {
      id: `pin_${Date.now()}`,
      title: newPinTitle.trim(),
      notes: newPinNote.trim(),
      latitude: newPinModal.lat,
      longitude: newPinModal.lng,
      createdAt: new Date().toISOString()
    };

    await saveCustomPin(pin);
    const updated = await getCustomPins();
    setCustomPins(updated);
    setNewPinModal(null);
    setNewPinTitle('');
    setNewPinNote('');
  };

  const handleDeletePin = async (id) => {
    await deleteCustomPin(id);
    const updated = await getCustomPins();
    setCustomPins(updated);
    if (selectedCustomPin?.id === id) {
      setSelectedCustomPin(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100dvh-130px)] lg:h-[calc(100dvh-4rem)] flex flex-col overflow-hidden bg-slate-100 dark:bg-[#080E1A] text-slate-900 dark:text-slate-100 transition-colors"
    >
      {/* 1. Top Modern Floating Search & Filter Bar */}
      <div className="z-20 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 p-2.5 sm:px-6 space-y-2 backdrop-blur-md shadow-lg transition-colors">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ne' ? 'अस्पताल, सरकारी कार्यालय, प्रहरी, स्कुल खोज्नुहोस्…' : 'Search government offices, hospitals, police, schools…'}
              className="w-full pl-9 pr-16 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <VoiceSearchButton onTranscript={(txt) => setSearchQuery(txt)} />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick City Jump Selector Button */}
          <div className="relative">
            <button
              onClick={() => setShowCityPicker((v) => !v)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              title="Jump to Nepal City"
            >
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>{lang === 'ne' ? 'सहर छान्नुहोस्' : 'Cities'}</span>
            </button>

            {/* City Dropdown Modal */}
            {showCityPicker && (
              <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-60 max-h-72 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 z-50">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 mb-1">
                  {lang === 'ne' ? 'नेपालका प्रमुख सहरहरू' : 'Major Nepal Cities'}
                </div>
                {NEPAL_CITIES.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleSelectCity(city)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-300 flex items-center justify-between transition"
                  >
                    <span>{city.name}</span>
                    <span className="text-[11px] text-slate-400">{city.name_ne}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Drop Personal Pin Tool Button */}
          <button
            onClick={() => {
              setIsDroppingPin((v) => !v);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              isDroppingPin
                ? 'bg-purple-600 text-white border-purple-500 shadow-md animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
            title="Drop personal offline pin on map"
          >
            <MapPin className={`w-3.5 h-3.5 ${isDroppingPin ? 'text-white' : 'text-purple-500'}`} />
            <span>
              {isDroppingPin
                ? (lang === 'ne' ? 'नक्सामा थिच्नुहोस्' : 'Tap on Map')
                : (lang === 'ne' ? 'पिन राख्नुहोस्' : 'Drop Pin')}
            </span>
          </button>

          {/* Locate Me / Recenter Button */}
          <button
            onClick={handleLocateMe}
            className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs font-bold ${
              follow && coordinates.isRealGps
                ? 'bg-sky-600 border-sky-500 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={lang === 'ne' ? 'मेरो लाइभ स्थानमा जानुहोस्' : 'Center on My Location'}
          >
            <LocateFixed className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">
              {follow && coordinates.isRealGps ? (lang === 'ne' ? 'लाइभ' : 'Live') : (lang === 'ne' ? 'मेरो स्थान' : 'Locate')}
            </span>
          </button>

          {/* GPS Accuracy Chip */}
          {coordinates.isRealGps ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-700 text-[11px] font-bold text-sky-700 dark:text-sky-200 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-live-ring" />
              <span>LIVE · ±{coordinates.accuracy}m</span>
              {coordinates.speed != null && coordinates.speed > 0.5 && (
                <span>· {(coordinates.speed * 3.6).toFixed(0)} km/h</span>
              )}
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
              <span>{gpsStatus === 'requesting' ? (lang === 'ne' ? 'खोज्दै…' : 'Locating…') : (lang === 'ne' ? 'म्यानुअल स्थान' : 'Manual GPS')}</span>
            </div>
          )}
        </div>

        {/* Category Filter Pills (Horizontal Scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {t('map.allCategories')} ({locations.length})
          </button>

          {Object.entries(categoryConfig).map(([catId, info]) => {
            const count = locations.filter((l) => l.category_id === catId).length;
            const isSelected = selectedCategory === catId;
            return (
              <button
                key={catId}
                onClick={() => setSelectedCategory(catId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{info.emoji}</span>
                <span>{lang === 'ne' ? info.label_ne : info.label_en}</span>
                {count > 0 && <span className="text-[10px] opacity-75">({count})</span>}
              </button>
            );
          })}

          {/* Quick Utility Shortcut Badges */}
          <Link
            to="/services"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-300 border border-sky-300 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-slate-700"
          >
            <span>🏛️</span>
            <span>{lang === 'ne' ? 'कागजात चेकलिस्ट' : 'Citizen Checklist'}</span>
          </Link>
          <Link
            to="/blood-banks"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900 hover:bg-red-100"
          >
            <span>🩸</span>
            <span>{lang === 'ne' ? 'रक्त बैंक' : 'Blood Banks'}</span>
          </Link>
          <Link
            to="/highways"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 hover:bg-amber-100"
          >
            <span>🚧</span>
            <span>{lang === 'ne' ? 'राजमार्ग' : 'Highways'}</span>
          </Link>
          <Link
            to="/altitude"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100"
          >
            <span>🏔️</span>
            <span>{lang === 'ne' ? 'उचाइ' : 'Altitude'}</span>
          </Link>

          {/* Real-time Weather Radar Toggle */}
          <button
            onClick={() => setShowWeather((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition border ${
              showWeather
                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-900 hover:bg-blue-50'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>
              {weatherData
                ? `${weatherData.temperature_2m}°C · ${weatherData.precipitation > 0 ? (lang === 'ne' ? 'वर्षा' : 'Rain') : (lang === 'ne' ? 'सफा' : 'Clear')}`
                : (lang === 'ne' ? 'मौसम' : 'Weather')}
            </span>
          </button>

          {/* Real-time Traffic Indicator Overlay Toggle */}
          <button
            onClick={() => setShowTraffic((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition border ${
              showTraffic
                ? 'bg-amber-600 text-white border-amber-500 shadow-md animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-900 hover:bg-amber-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{showTraffic ? (lang === 'ne' ? 'ट्राफिक चालु' : 'Traffic ON') : (lang === 'ne' ? 'सडक ट्राफिक' : 'Traffic')}</span>
          </button>
        </div>

        {/* Live OSM directory toggle (online only) */}
        {isOnline && selectedCategory !== 'all' && LIVE_AMENITIES[selectedCategory] && (
          <div className="flex items-center gap-2 pt-1 text-[11px]">
            <button
              onClick={() => setLiveOn((v) => !v)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold border transition ${
                liveOn
                  ? 'bg-sky-100 dark:bg-sky-900/60 border-sky-400 dark:border-sky-600 text-sky-800 dark:text-sky-200'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${liveOn ? 'bg-sky-500' : 'bg-slate-400'}`} />
              <span>{liveOn ? (lang === 'ne' ? 'लाइभ OSM खोज चालु' : 'Live OSM Search ON') : (lang === 'ne' ? 'लाइभ OSM खोज' : 'Fetch Live OSM')}</span>
            </button>
            {liveOn && (
              <>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">
                  {liveLoading
                    ? (lang === 'ne' ? 'खोज्दै…' : 'Querying Overpass…')
                    : `${liveItems.length} ${lang === 'ne' ? 'लाइभ नतिजा' : 'live items'}`}
                </span>
                <button
                  onClick={() => setLiveQuery((q) => q + 1)}
                  className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold hover:underline"
                >
                  <RefreshCw className={`w-3 h-3 ${liveLoading ? 'animate-spin' : ''}`} />
                  <span>{lang === 'ne' ? 'ताजा' : 'Refresh'}</span>
                </button>
              </>
            )}
            {liveError && <span className="text-amber-500 text-[11px]">{liveError}</span>}
          </div>
        )}
      </div>

      {/* 2. Notification Banners (GPS Denied / Offline State) */}
      {!coordinates.isRealGps && gpsStatus === 'unavailable' && !dismissGpsBanner && (
        <div className="z-10 bg-sky-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-b border-sky-200 dark:border-slate-800 px-4 py-1.5 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
            <span className="truncate">
              {lang === 'ne'
                ? 'GPS अनुमति पाइएन। माथिको "सहर छान्नुहोस्" बाट नेपालका कुनै पनि सहर रोज्न सक्नुहुन्छ।'
                : 'GPS access denied/unavailable. Select any Nepal city above or explore manually.'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowCityPicker(true)}
              className="text-[11px] font-bold text-sky-600 dark:text-sky-400 underline"
            >
              {lang === 'ne' ? 'सहर रोज्नुहोस्' : 'Pick City'}
            </button>
            <button
              onClick={() => setDismissGpsBanner(true)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 text-xs ml-1"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="z-10 bg-amber-50 dark:bg-amber-950/90 text-amber-900 dark:text-amber-200 border-b border-amber-200 dark:border-amber-800 px-4 py-1.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-amber-500" />
            <span>
              <strong>{lang === 'ne' ? 'अफलाइन मोड:' : 'Offline Mode:'}</strong>{' '}
              {lang === 'ne'
                ? 'डाउनलोड गरिएका स्थानहरू र क्यास नक्सा देखिँदैछ। सिधा दूरी सक्रिय छ।'
                : 'Showing downloaded places & cached map tiles. Straight-line bearing active.'}
            </span>
          </div>
          {activePack && (
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {activePack.region} Pack Active ✓
            </span>
          )}
        </div>
      )}

      {/* 3. Main Leaflet Interactive Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <MapController
            center={mapCenter}
            zoom={mapZoom}
            follow={follow}
            onUserDrag={() => setFollow(false)}
            onMapClick={handleMapClick}
          />

          <MapActionBridge
            registerActions={(actions) => {
              mapActionsRef.current = actions;
            }}
          />

          {/* Active Tile Layer */}
          <TileLayer
            key={activeLayer}
            attribution={(MAP_LAYERS[activeLayer] || MAP_LAYERS.osm).attribution}
            url={(MAP_LAYERS[activeLayer] || MAP_LAYERS.osm).url}
            maxNativeZoom={(MAP_LAYERS[activeLayer] || MAP_LAYERS.osm).maxNativeZoom || 18}
            maxZoom={(MAP_LAYERS[activeLayer] || MAP_LAYERS.osm).maxZoom || 20}
          />

          {/* User's GPS Location Marker */}
          {coordinates.latitude && (
            <>
              <Circle
                center={[coordinates.latitude, coordinates.longitude]}
                radius={coordinates.accuracy || 25}
                pathOptions={{
                  color: '#0284C7',
                  fillColor: '#38BDF8',
                  fillOpacity: 0.15,
                  weight: 1.5
                }}
              />
              <Marker
                position={[coordinates.latitude, coordinates.longitude]}
                icon={L.divIcon({
                  className: 'user-gps-marker',
                  html:
                    coordinates.heading != null && coordinates.speed != null && coordinates.speed > 0.5
                      ? `
                      <div style="transform: rotate(${coordinates.heading}deg); filter: drop-shadow(0 2px 6px rgba(2,132,199,0.8));">
                        <div style="
                          width: 0; height: 0;
                          border-left: 10px solid transparent;
                          border-right: 10px solid transparent;
                          border-bottom: 24px solid #0284C7;
                          margin: 0 auto;
                        "></div>
                        <div style="
                          width: 14px; height: 14px; border-radius: 50%;
                          background-color: #38BDF8; border: 3px solid #ffffff;
                          margin: -8px auto 0;
                        "></div>
                      </div>
                    `
                      : `
                      <div class="animate-live-ring" style="
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background-color: #0284C7;
                        border: 3.5px solid #ffffff;
                        box-shadow: 0 2px 10px rgba(2,132,199,0.5);
                      "></div>
                    `,
                  iconSize: [26, 30],
                  iconAnchor: [13, 15]
                })}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <strong className="text-sky-600 dark:text-sky-400">
                      {lang === 'ne' ? 'मेरो लाइभ स्थान' : 'My Live Location'}
                    </strong>
                    <br />
                    <span>GPS Accuracy: ±{coordinates.accuracy} m</span>
                    {coordinates.speed != null && coordinates.speed > 0.5 && (
                      <div>Speed: {(coordinates.speed * 3.6).toFixed(0)} km/h</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Curated Bundled Directory Markers */}
          {filteredLocations.map((loc) => {
            const config = categoryConfig[loc.category_id] || { color: '#64748B', emoji: '📍' };
            const isSelected = selectedLocation?.id === loc.id;
            const markerIcon = createCustomMarker(config.color, config.emoji, isSelected);

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
                    <div className="flex items-center gap-1 text-[10px] font-bold text-sky-500 uppercase mb-0.5">
                      <span>{config.emoji}</span>
                      <span>{loc.category_id}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                      {lang === 'ne' ? (loc.name_ne || loc.name_en) : (loc.name_en || loc.name_ne)}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-300 mb-2">
                      {loc.address_en || loc.region}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {(loc.phone || loc.emergency_phone) && (
                        <a
                          href={`tel:${loc.emergency_phone || loc.phone}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-sm"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleSelectLocation(loc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600 text-white text-[11px] font-bold shadow-sm"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Route</span>
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Live OSM Markers (when requested) */}
          {liveItems.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={createCustomMarker('#0EA5E9', (categoryConfig[loc.category_id] || {}).emoji || '📍')}
              eventHandlers={{
                click: () => handleSelectLocation(loc)
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <div className="text-[10px] font-black text-sky-500 mb-0.5">● LIVE OSM</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    {lang === 'ne' ? (loc.name_ne || loc.name_en) : loc.name_en}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-300 mb-2">
                    {loc.address_en || (lang === 'ne' ? 'ठेगाना सूची छैन' : 'No address')}
                  </div>
                  {loc.phone && (
                    <a
                      href={`tel:${loc.phone}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-sm"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Custom Offline Dropped Pins */}
          {customPins.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.latitude, pin.longitude]}
              icon={createCustomMarker('#8B5CF6', '📌', selectedCustomPin?.id === pin.id)}
              eventHandlers={{
                click: () => {
                  setSelectedCustomPin(pin);
                  setSelectedLocation(null);
                }
              }}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <div className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-0.5">
                    📌 {lang === 'ne' ? 'अफलाइन पिन' : 'Custom Offline Pin'}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    {pin.title}
                  </div>
                  {pin.notes && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-300 mb-2">
                      {pin.notes}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        setQrModalData({
                          title: pin.title,
                          category: 'Custom Pin',
                          address: pin.notes || 'Offline Marked Coordinate',
                          latitude: pin.latitude,
                          longitude: pin.longitude
                        });
                      }}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200"
                    >
                      QR Code
                    </button>
                    <button
                      onClick={() => handleDeletePin(pin.id)}
                      className="px-2 py-1 rounded bg-red-100 dark:bg-red-950/60 text-[11px] font-bold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Route Line from User to Selected Place */}
          {routeLine && (
            <>
              {/* Route shadow / outline */}
              <Polyline
                positions={routeLine}
                pathOptions={{
                  color: '#0369A1',
                  weight: 7,
                  opacity: 0.4
                }}
              />
              {/* Inner crisp line */}
              <Polyline
                positions={routeLine}
                pathOptions={{
                  color: routeInfo?.isRoadGeometry ? '#38BDF8' : '#38BDF8',
                  weight: 4,
                  dashArray: routeInfo?.isRoadGeometry ? null : '6, 8',
                  opacity: 0.95
                }}
              />
            </>
          )}

          {/* Live Rain Radar Overlay (RainViewer free weather radar tiles) */}
          {showWeather && (
            <TileLayer
              url="https://tilecache.rainviewer.com/v2/radar/nowcast_5/256/{z}/{x}/{y}/2/1_1.png"
              opacity={0.65}
              zIndex={500}
            />
          )}

          {/* Live Highway Traffic Congestion & Corridor Overlay */}
          {showTraffic && (
            <>
              {/* Narayangadh - Mugling Corridor (Red / Amber Alert Zone) */}
              <Polyline
                positions={[
                  [27.7010, 84.4250],
                  [27.7720, 84.4750],
                  [27.8590, 84.5210]
                ]}
                pathOptions={{
                  color: '#EF4444',
                  weight: 5,
                  opacity: 0.85
                }}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <strong className="text-red-600">🚧 मुग्लिन–नारायणगढ सडक खण्ड</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">पहिरो सम्भावित क्षेत्र: मध्यम चाप</p>
                  </div>
                </Popup>
              </Polyline>

              {/* Kathmandu Ring Road (Kalanki - Koteshwor) */}
              <Polyline
                positions={[
                  [27.6936, 85.2815],
                  [27.6660, 85.3120],
                  [27.6750, 85.3470]
                ]}
                pathOptions={{
                  color: '#F59E0B',
                  weight: 5,
                  opacity: 0.85
                }}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <strong className="text-amber-600">🚗 काठमाडौँ चक्रपथ (कलङ्की-कोटेश्वर)</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5">सडक चाप: नियमित गति</p>
                  </div>
                </Popup>
              </Polyline>
            </>
          )}
        </MapContainer>

        {/* 4. Floating Map Controls (Zoom, Layers, Fullscreen) */}
        <div className="absolute right-3.5 bottom-20 sm:bottom-8 z-[1000] flex flex-col gap-2">
          {/* Layer Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu((v) => !v)}
              className="p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title="Change Map Layer"
            >
              <Layers className="w-4 h-4 text-sky-500" />
            </button>

            {/* Layer Menu Dropdown */}
            {showLayerMenu && (
              <div className="absolute right-full mr-2 bottom-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-1.5 z-50">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 mb-0.5">
                  Map Layers
                </div>
                {Object.entries(MAP_LAYERS).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveLayer(key);
                      setShowLayerMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      activeLayer === key
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{info.name}</span>
                    {activeLayer === key && <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Zoom In */}
          <button
            onClick={() => mapActionsRef.current?.zoomIn()}
            className="p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => mapActionsRef.current?.zoomOut()}
            className="p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Google-Style Route & Navigation HUD (Positioned inside the map container with high z-index) */}
        {selectedLocation && routeInfo && (
          <div className="z-[1000] absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-auto max-w-sm w-full animate-slide-down">
            <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-sky-400 dark:border-sky-700 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="p-2 rounded-xl bg-sky-500 text-white shadow-md">
                    <Navigation className="w-4 h-4 animate-pulse" />
                  </span>
                  <div className="truncate">
                    <span className="text-[10px] font-extrabold text-sky-500 uppercase tracking-wider block">
                      {routeInfo.isRoadGeometry ? (lang === 'ne' ? 'वास्तविक सडक बाटो' : 'Road Route (OSRM)') : (lang === 'ne' ? 'सिधा दूरी (अफलाइन)' : 'Straight Distance')}
                    </span>
                    <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {lang === 'ne' ? (selectedLocation.name_ne || selectedLocation.name_en) : selectedLocation.name_en}
                    </div>
                  </div>
                </div>

                <button
                  onClick={clearSelection}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            {/* Travel metrics display */}
            <div className="flex items-baseline justify-between py-2 border-y border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {routeInfo.distanceKm < 1
                    ? `${Math.round(routeInfo.distanceKm * 1000)} m`
                    : `${routeInfo.distanceKm.toFixed(routeInfo.distanceKm < 10 ? 1 : 0)} km`}
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {routeInfo.durationMins < 60
                    ? `~${routeInfo.durationMins} min`
                    : `~${(routeInfo.durationMins / 60).toFixed(1)} hr`}
                </span>
              </div>

              {isCalculatingRoute && (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-500 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{lang === 'ne' ? 'बाटो खोज्दै…' : 'Routing…'}</span>
                </div>
              )}
            </div>

            {/* Active Turn-by-Turn Maneuver Bar */}
            {routeSteps.length > 0 && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-800 border border-slate-800 dark:border-slate-700 shadow-md">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-sky-400">
                    <CornerUpRight className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span>
                      {lang === 'ne'
                        ? `चरण ${currentStepIndex + 1}/${routeSteps.length}`
                        : `Step ${currentStepIndex + 1}/${routeSteps.length}`}
                    </span>
                    {routeSteps[currentStepIndex]?.distanceMeters > 0 && (
                      <span className="text-[11px] text-slate-300">
                        ({routeSteps[currentStepIndex].distanceMeters} m)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const nextVoice = !voiceGuidance;
                        setVoiceGuidance(nextVoice);
                        if (nextVoice && routeSteps[currentStepIndex]) {
                          speakInstruction(routeSteps[currentStepIndex].instruction_ne);
                        }
                      }}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400"
                      title={voiceGuidance ? 'Mute Voice' : 'Enable Voice'}
                    >
                      {voiceGuidance ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                    {voiceGuidance && (
                      <button
                        onClick={() => {
                          if (routeSteps[currentStepIndex]) {
                            speakInstruction(routeSteps[currentStepIndex].instruction_ne);
                          }
                        }}
                        className="px-1.5 py-0.5 rounded bg-sky-600 text-[10px] font-bold text-white hover:bg-sky-500"
                        title="Repeat Nepali Voice"
                      >
                        🔊 बोल
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-100">
                  {lang === 'ne'
                    ? routeSteps[currentStepIndex]?.instruction_ne
                    : routeSteps[currentStepIndex]?.instruction_en}
                </div>

                {/* Step stepper buttons */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800 text-[11px]">
                  <button
                    disabled={currentStepIndex === 0}
                    onClick={() => {
                      const prevIdx = Math.max(0, currentStepIndex - 1);
                      setCurrentStepIndex(prevIdx);
                      if (voiceGuidance && routeSteps[prevIdx]) {
                        speakInstruction(routeSteps[prevIdx].instruction_ne);
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 disabled:opacity-30 font-bold"
                  >
                    ← {lang === 'ne' ? 'अघिल्लो' : 'Prev'}
                  </button>
                  <button
                    disabled={currentStepIndex >= routeSteps.length - 1}
                    onClick={() => {
                      const nextIdx = Math.min(routeSteps.length - 1, currentStepIndex + 1);
                      setCurrentStepIndex(nextIdx);
                      if (voiceGuidance && routeSteps[nextIdx]) {
                        speakInstruction(routeSteps[nextIdx].instruction_ne);
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-30 font-bold"
                  >
                    {lang === 'ne' ? 'पछिल्लो' : 'Next'} →
                  </button>
                </div>
              </div>
            )}

            {/* Mode Selector (Drive / Bus / Walk / Cycle) */}
            <div className="flex items-center gap-1.5 pt-2">
              <button
                onClick={() => setRouteMode('driving')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  routeMode === 'driving'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Driving route"
              >
                <Car className="w-3.5 h-3.5" />
                <span>{lang === 'ne' ? 'गाडी' : 'Drive'}</span>
              </button>

              <button
                onClick={() => setRouteMode('transit')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  routeMode === 'transit'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Public bus transit route"
              >
                <Bus className="w-3.5 h-3.5" />
                <span>{lang === 'ne' ? 'बस' : 'Bus'}</span>
              </button>

              <button
                onClick={() => setRouteMode('walking')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  routeMode === 'walking'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Walking route"
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>{lang === 'ne' ? 'पैदल' : 'Walk'}</span>
              </button>

              <button
                onClick={() => setRouteMode('cycling')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  routeMode === 'cycling'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Cycling route"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>{lang === 'ne' ? 'साइकल' : 'Cycle'}</span>
              </button>

              <button
                onClick={() => {
                  setFollow(true);
                  if (coordinates.latitude && coordinates.longitude) {
                    mapActionsRef.current?.flyTo(coordinates.latitude, coordinates.longitude, 16);
                  }
                  if (voiceGuidance && routeSteps[0]) {
                    speakInstruction(routeSteps[0].instruction_ne);
                  }
                }}
                className="py-1.5 px-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 flex items-center gap-1 shadow-sm flex-shrink-0"
                title="Follow GPS Live"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{lang === 'ne' ? 'सुरु' : 'Start'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Bottom Sheet Drawer for Selected Location (Collapsible so it NEVER blocks the map!) */}
      {selectedLocation && !isNavigating && (
        <div className="z-30 absolute bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 max-w-lg mx-auto animate-slide-up">
          <div className="relative">
            {/* Header / Collapse Bar */}
            <div className="flex items-center justify-between mb-1.5 px-2">
              <button
                onClick={() => setIsSheetCollapsed((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-bold shadow-lg border border-slate-700 backdrop-blur-md transition"
              >
                <span>{isSheetCollapsed ? (lang === 'ne' ? 'विवरण हेर्नुहोस्' : 'View Place Details') : (lang === 'ne' ? 'नक्सा खाली गर्नुहोस्' : 'Minimize to Map')}</span>
                {isSheetCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={clearSelection}
                className="p-1.5 rounded-full bg-slate-900 text-slate-200 hover:text-white border border-slate-700 shadow-xl"
                title="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Expanded full details */}
            {!isSheetCollapsed && (
              <div className="animate-slide-up">
                <LocationCard
                  location={selectedLocation}
                  isSelected={true}
                  onSelectLocation={() => {}}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Bottom Sheet Drawer for Selected Custom Pin */}
      {selectedCustomPin && (
        <div className="z-30 absolute bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 max-w-md mx-auto animate-slide-up">
          <div className="relative p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 shadow-2xl">
            <button
              onClick={() => setSelectedCustomPin(null)}
              className="absolute top-3 right-3 p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 text-base">
                📌
              </span>
              <div>
                <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                  {lang === 'ne' ? 'तपाईंको आफ्नै पिन' : 'Personal Saved Pin'}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedCustomPin.title}
                </h3>
              </div>
            </div>

            {selectedCustomPin.notes && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                {selectedCustomPin.notes}
              </p>
            )}

            <div className="text-[11px] text-slate-400 font-mono mb-3">
              {selectedCustomPin.latitude.toFixed(5)}, {selectedCustomPin.longitude.toFixed(5)}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setQrModalData({
                    title: selectedCustomPin.title,
                    category: 'Custom Pin',
                    address: selectedCustomPin.notes || 'Offline Marked Coordinate',
                    latitude: selectedCustomPin.latitude,
                    longitude: selectedCustomPin.longitude
                  });
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition"
              >
                <QrCode className="w-3.5 h-3.5 text-sky-500" />
                <span>QR Code</span>
              </button>
              <button
                onClick={() => handleDeletePin(selectedCustomPin.id)}
                className="py-2 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-bold text-red-600 dark:text-red-300 flex items-center justify-center gap-1.5 transition border border-red-200 dark:border-red-800/60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Drop Pin Modal */}
      {newPinModal && (
        <div className="z-50 fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveNewPin}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl animate-scale-in"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 text-base">📌</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {lang === 'ne' ? 'नयाँ पिन सुरक्षित गर्नुहोस्' : 'Save Custom Pin'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNewPinModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {lang === 'ne'
                ? 'यो पिन तपाईंको फोन वा डिभाइसमा अफलाइन सुरक्षित हुनेछ।'
                : 'This pin will be saved to your device for 100% offline access.'}
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'ne' ? 'पिनको नाम' : 'Title / Label'} *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newPinTitle}
                  onChange={(e) => setNewPinTitle(e.target.value)}
                  placeholder={lang === 'ne' ? 'जस्तै: मेरो क्याम्प, पानीको मुहान...' : 'e.g. My Camp, Water Spring, Hotel...'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'ne' ? 'विवरण वा नोट' : 'Field Note / Description'}
                </label>
                <textarea
                  rows={2}
                  value={newPinNote}
                  onChange={(e) => setNewPinNote(e.target.value)}
                  placeholder={lang === 'ne' ? 'कुनै अतिरिक्त जानकारी...' : 'Any landmark or field note...'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                Lat: {newPinModal.lat.toFixed(5)}, Lng: {newPinModal.lng.toFixed(5)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNewPinModal(null)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {lang === 'ne' ? 'रद्द गर्नुहोस्' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md shadow-purple-900/30"
              >
                {lang === 'ne' ? 'सुरक्षित गर्नुहोस्' : 'Save Pin'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 8. QR Code Share Modal */}
      {qrModalData && (
        <LocationQrModal
          location={qrModalData}
          onClose={() => setQrModalData(null)}
        />
      )}
      </div>
    </div>
  );
}

