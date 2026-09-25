import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, ShieldAlert, HeartPulse, BookOpen, HardDrive, PhoneCall, Radio, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import QuickActionCard from '../components/QuickActionCard';
import EmergencyDialCard from '../components/EmergencyDialCard';
import GlobalSearchBar from '../components/GlobalSearchBar';
import { db } from '../offline/db';

export default function HomePage() {
  const { lang, t } = useLanguage();
  const { isOnline, connectionStatus, activePack, downloadedPacks } = useNetwork();
  const [emergencyServices, setEmergencyServices] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        if (isOnline) {
          const res = await fetch('/api/emergency');
          const data = await res.json();
          if (data.services) {
            setEmergencyServices(data.services.slice(0, 3));
            return;
          }
        }
        // Fallback to IndexedDB
        const localServices = await db.emergency_services.toArray();
        if (localServices.length > 0) {
          setEmergencyServices(localServices.slice(0, 3));
        }
      } catch (err) {
        console.warn('Failed to fetch emergency services:', err);
      }
    }
    loadData();
  }, [isOnline]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. Header Banner & Dynamic Connection State */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🇳🇵</span>
            <h2 className="text-lg font-bold text-white tracking-tight">NepaReady</h2>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {t('app.tagline')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {connectionStatus === 'online' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>🟢 {t('status.online')}</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-xs font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>🔴 {lang === 'ne' ? 'तपाईँ अफलाइन हुनुहुन्छ' : 'You are offline'}</span>
              </div>
              {activePack && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Offline Pack: <strong>{activePack.region}</strong> ✓ Available</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Global Search Bar (Works offline) */}
      <div className="max-w-2xl mx-auto">
        <GlobalSearchBar />
      </div>

      {/* 2. Hero Section: “Stay Ready. Even Offline.” */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B192C] via-[#112340] to-slate-900 border border-slate-700/80 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold mb-4">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>NEPAL DISASTER & EMERGENCY READY</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {t('app.stayReady')}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
            {t('app.heroSubtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/map"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-950/60 transition active:scale-95"
            >
              <Map className="w-4 h-4" />
              <span>Explore Offline Map</span>
            </Link>

            <Link
              to="/packs"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-sm transition active:scale-95"
            >
              <HardDrive className="w-4 h-4 text-sky-400" />
              <span>Download Offline Pack</span>
            </Link>
          </div>
        </div>

        {/* Decorative Background Accent */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 3. Four Quick Action Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-white tracking-tight">Quick Access</h2>
          <span className="text-xs text-slate-400">Essential Offline Utilities</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            to="/map"
            title={t('quickActions.offlineMap')}
            description={t('quickActions.offlineMapDesc')}
            icon={Map}
            color="blue"
          />
          <QuickActionCard
            to="/emergency"
            title={t('quickActions.emergency')}
            description={t('quickActions.emergencyDesc')}
            icon={ShieldAlert}
            color="red"
          />
          <QuickActionCard
            to="/help"
            title={t('quickActions.findHelp')}
            description={t('quickActions.findHelpDesc')}
            icon={HeartPulse}
            color="emerald"
          />
          <QuickActionCard
            to="/guides"
            title={t('quickActions.emergencyGuides')}
            description={t('quickActions.emergencyGuidesDesc')}
            icon={BookOpen}
            color="amber"
          />
        </div>
      </section>

      {/* 4. Prominent One-Tap Emergency Bar */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/60 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-0.5 rounded bg-red-600 text-white uppercase tracking-wider">
                CRITICAL
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                {t('emergency.title')} DIRECT DIAL
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t('emergency.cellularNotice')}
            </p>
          </div>

          <Link
            to="/emergency"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300"
          >
            <span>View All National Numbers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 1-tap quick calling grid: Police, Fire, Ambulance, SOS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a
            href="tel:100"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-950/60 border border-blue-700/60 hover:bg-blue-900/60 transition active:scale-95 shadow-md"
          >
            <span className="text-2xl mb-1">🚓</span>
            <span className="text-xl font-black text-white">100</span>
            <span className="text-xs font-bold text-blue-300">Nepal Police</span>
          </a>

          <a
            href="tel:101"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-orange-950/60 border border-orange-700/60 hover:bg-orange-900/60 transition active:scale-95 shadow-md"
          >
            <span className="text-2xl mb-1">🔥</span>
            <span className="text-xl font-black text-white">101</span>
            <span className="text-xs font-bold text-orange-300">Fire (दमकल)</span>
          </a>

          <a
            href="tel:102"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-red-950/60 border border-red-700/60 hover:bg-red-900/60 transition active:scale-95 shadow-md"
          >
            <span className="text-2xl mb-1">🚑</span>
            <span className="text-xl font-black text-white">102</span>
            <span className="text-xs font-bold text-red-300">Ambulance</span>
          </a>

          <Link
            to="/sos"
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-red-600 hover:bg-red-500 border border-red-400 transition active:scale-95 shadow-lg shadow-red-900/50 animate-sos-pulse"
          >
            <ShieldAlert className="w-6 h-6 text-white mb-1" />
            <span className="text-xl font-black text-white">SOS</span>
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">Rescue Mode</span>
          </Link>
        </div>
      </section>

      {/* 5. Offline Packs Summary Card */}
      <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Your Offline Packs</h2>
            <p className="text-xs text-slate-400">Stored on your device for disconnected access</p>
          </div>
          <Link
            to="/packs"
            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <span>Manage Packs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {downloadedPacks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {downloadedPacks.map((pack) => (
              <div
                key={pack.id}
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/80"
              >
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{pack.name_en}</span>
                    <span className="text-emerald-400 text-xs">✓ Downloaded</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {pack.region} • {pack.size_mb} MB
                  </div>
                </div>
                <Link
                  to="/map"
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl">
            <HardDrive className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 mb-3">
              You haven't downloaded an Offline Pack yet.
            </p>
            <Link
              to="/packs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
            >
              <span>Explore Offline Packs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* Footer Tagline */}
      <footer className="text-center py-6 text-xs text-slate-500 border-t border-slate-900">
        <p className="font-semibold text-slate-400 mb-1">
          Stay Prepared. Stay Connected. Even When You're Offline.
        </p>
        <p>NepaReady 🇳🇵 • Authoritative Disaster & Emergency Directory for Nepal</p>
      </footer>
    </div>
  );
}
