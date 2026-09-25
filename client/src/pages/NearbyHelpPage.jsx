import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import LocationCard from '../components/LocationCard';
import { db } from '../offline/db';
import { HeartPulse, ShieldAlert, Flame, Pill, Landmark, Bus, Search, Filter } from 'lucide-react';

export default function NearbyHelpPage() {
  const { lang, t } = useLanguage();
  const { coordinates, isOnline } = useNetwork();

  const [locations, setLocations] = useState([]);
  const [activeCategory, setActiveCategory] = useState('hospital');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'hospital', label: 'Hospitals', icon: HeartPulse, color: 'text-red-500' },
    { id: 'police', label: 'Police', icon: ShieldAlert, color: 'text-blue-500' },
    { id: 'fire', label: 'Fire', icon: Flame, color: 'text-orange-500' },
    { id: 'pharmacy', label: 'Pharmacies', icon: Pill, color: 'text-emerald-500' },
    { id: 'transport', label: 'Transit', icon: Bus, color: 'text-violet-500' },
    { id: 'government', label: 'Govt Offices', icon: Landmark, color: 'text-slate-400' }
  ];

  useEffect(() => {
    async function loadLocations() {
      try {
        if (isOnline) {
          const res = await fetch('/api/locations');
          const data = await res.json();
          if (data.locations) {
            setLocations(data.locations);
            return;
          }
        }
        const local = await db.locations.toArray();
        setLocations(local);
      } catch (err) {
        const local = await db.locations.toArray();
        setLocations(local);
      }
    }
    loadLocations();
  }, [isOnline]);

  // Sort by straight-line distance from user's current GPS position
  const sortedLocations = [...locations]
    .filter(loc => {
      const matchCat = activeCategory === 'all' || loc.category_id === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchQ =
        !q ||
        loc.name_en.toLowerCase().includes(q) ||
        loc.name_ne.includes(q) ||
        (loc.address_en && loc.address_en.toLowerCase().includes(q));
      return matchCat && matchQ;
    })
    .sort((a, b) => {
      const distA = Math.hypot(a.latitude - coordinates.latitude, a.longitude - coordinates.longitude);
      const distB = Math.hypot(b.latitude - coordinates.latitude, b.longitude - coordinates.longitude);
      return distA - distB;
    });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t('quickActions.findHelp')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Verified emergency responders, trauma care centers, and pharmacies sorted by distance.
        </p>
      </div>

      {/* Category selector pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap border transition ${
                isActive
                  ? 'bg-slate-100 text-slate-950 border-white shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : cat.color}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter nearby locations by name or address..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:border-sky-500"
        />
      </div>

      {/* List of Location Cards */}
      <div className="space-y-3">
        {sortedLocations.map((loc) => (
          <LocationCard key={loc.id} location={loc} />
        ))}

        {sortedLocations.length === 0 && (
          <div className="text-center py-12 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm">
            No matching locations found for this category in your downloaded offline data.
          </div>
        )}
      </div>
    </div>
  );
}
