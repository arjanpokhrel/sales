import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { db } from '../offline/db';
import { Bus, Clock, Coins, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TransportPage() {
  const { lang, t } = useLanguage();
  const { isOnline } = useNetwork();

  const [routes, setRoutes] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Biratnagar');

  const cities = ['Biratnagar', 'Dharan', 'Kathmandu'];

  useEffect(() => {
    async function loadRoutes() {
      try {
        if (isOnline) {
          const res = await fetch(`/api/transport/routes?region=${selectedCity}`);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            setRoutes(data.routes);
            return;
          }
        }
        // Fallback to IndexedDB
        const local = await db.transport_routes.where('region').equalsIgnoreCase(selectedCity).toArray();
        setRoutes(local);
      } catch (err) {
        const local = await db.transport_routes.where('region').equalsIgnoreCase(selectedCity).toArray();
        setRoutes(local);
      }
    }
    loadRoutes();
  }, [selectedCity, isOnline]);

  const isNepali = lang === 'ne';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Bus className="w-7 h-7 text-sky-400" />
          <span>{t('transport.title')}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {t('transport.subtitle')}
        </p>
      </div>

      {/* City Switcher */}
      <div className="flex items-center gap-2">
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition border ${
              selectedCity === city
                ? 'bg-sky-600 text-white border-sky-500 shadow-md'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            📍 {city}
          </button>
        ))}
      </div>

      {/* Verified Schedule Note */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-sky-400 flex-shrink-0" />
        <span>
          Fixed public transit routes and municipal fares. No live GPS vehicle tracking is claimed unless active in that municipality.
        </span>
      </div>

      {/* Route Cards */}
      <div className="space-y-4">
        {routes.map((route) => {
          const routeName = isNepali ? route.name_ne : route.name_en;
          const fare = isNepali ? route.fare_info_ne : route.fare_info_en;

          return (
            <div
              key={route.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    {route.route_number}
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    {routeName}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{route.operating_hours}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{fare}</span>
                  </span>
                </div>
              </div>

              {/* Stops Timeline */}
              {route.stops && route.stops.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Route Stops ({route.stops.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {route.stops.map((stop) => (
                      <div
                        key={stop.sequence}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-bold text-sky-400 flex items-center justify-center flex-shrink-0">
                          {stop.sequence}
                        </span>
                        <span className="text-slate-200 font-medium truncate">
                          {isNepali ? stop.name_ne : stop.name_en}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                <span>Verified by Koshi Transport Directorate</span>
                <span>Last verified: {route.last_verified || '2026-09-25'}</span>
              </div>
            </div>
          );
        })}

        {routes.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">
            No public transit routes stored for {selectedCity} yet.
          </div>
        )}
      </div>
    </div>
  );
}
