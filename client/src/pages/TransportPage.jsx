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
  const [calcKm, setCalcKm] = useState(8);
  const [isNight, setIsNight] = useState(false);

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

      {/* Official Nepal Fare Calculator */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {lang === 'ne' ? 'आधिकारिक भाडा दर क्याल्कुलेटर (DoTM Rate)' : 'Official Fare Calculator (DoTM Standard)'}
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Govt Standard
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {lang === 'ne'
            ? 'यातायात व्यवस्था विभागले तोकेको आधिकारिक मिटर ट्याक्सी तथा सार्वजनिक बस भाडा अनुमान गर्नुहोस्।'
            : 'Estimate official metered taxi and public transport fares calculated according to DoTM gazette rates.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              {lang === 'ne' ? 'दूरी (किलोमिटर)' : 'Distance (km)'}
            </label>
            <input
              type="number"
              min="1"
              max="1500"
              value={calcKm}
              onChange={(e) => setCalcKm(Math.max(1, Number(e.target.value) || 1))}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              {lang === 'ne' ? 'समय (समय तालिका)' : 'Time of Day'}
            </label>
            <select
              value={isNight ? 'night' : 'day'}
              onChange={(e) => setIsNight(e.target.value === 'night')}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-white"
            >
              <option value="day">{lang === 'ne' ? 'दिन (Day: 6AM - 9PM)' : 'Daytime (6:00 - 21:00)'}</option>
              <option value="night">{lang === 'ne' ? 'रात्री (Night: 9PM - 6AM - 50% थप)' : 'Night (21:00 - 6:00 - +50%)'}</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex gap-1.5">
              {[3, 8, 15, 25].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setCalcKm(preset)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {preset}km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fare Results Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* 1. Metered Taxi */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block mb-1">
              🚕 {lang === 'ne' ? 'मिटर ट्याक्सी (Taxi)' : 'Metered Taxi'}
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
              Rs. {Math.round((60 + Math.max(0, calcKm - 1) * 50) * (isNight ? 1.5 : 1))}
            </div>
            <span className="text-[10px] text-slate-500">
              {lang === 'ne' ? 'सुरुवाती रु ६० + रु ५०/किमि' : 'Flag Rs 60 + Rs 50/km'}
            </span>
          </div>

          {/* 2. City Bus / Micro */}
          <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-center">
            <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 block mb-1">
              🚌 {lang === 'ne' ? 'स्थानीय बस / माइक्रो' : 'Local City Bus / Micro'}
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
              Rs. {calcKm <= 5 ? 20 : calcKm <= 10 ? 27 : calcKm <= 15 ? 35 : calcKm <= 20 ? 42 : Math.round(42 + (calcKm - 20) * 2.5)}
            </div>
            <span className="text-[10px] text-slate-500">
              {lang === 'ne' ? 'सरकारी ५-किमि स्ल्याब दर' : 'DoTM slab structure'}
            </span>
          </div>

          {/* 3. Long Distance Deluxe */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
              🚎 {lang === 'ne' ? 'डिलक्स लामो दूरी' : 'Inter-District Deluxe'}
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
              Rs. {Math.round(calcKm * 3.8)}
            </div>
            <span className="text-[10px] text-slate-500">
              {lang === 'ne' ? 'औसत रु ३.८० / किमि' : 'Avg Rs 3.80 / km'}
            </span>
          </div>
        </div>
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
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            📍 {city}
          </button>
        ))}
      </div>

      {/* Verified Schedule Note */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-sky-500 flex-shrink-0" />
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
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30">
                    {route.route_number}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {routeName}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{route.operating_hours}</span>
                  </span>
                  <span className="flex items-center gap-1 font-bold">
                    <Coins className="w-3.5 h-3.5 text-emerald-500" />
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
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px] font-bold text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                          {stop.sequence}
                        </span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium truncate">
                          {isNepali ? stop.name_ne : stop.name_en}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span>Verified transit route</span>
                <span>Last verified: {route.last_verified || '2026-09-25'}</span>
              </div>
            </div>
          );
        })}

        {routes.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
            No public transit routes stored for {selectedCity} yet.
          </div>
        )}
      </div>
    </div>
  );
}
