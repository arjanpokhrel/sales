import React, { useState, useEffect } from 'react';
import { ShieldAlert, MapPin, Share2, Copy, Check, Volume2, VolumeX, PhoneCall, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { db } from '../offline/db';

export default function SOSPage() {
  const { lang, t } = useLanguage();
  const { coordinates, gpsStatus, isOnline } = useNetwork();

  const [copied, setCopied] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const [strobeActive, setStrobeActive] = useState(false);
  const [audioCtx, setAudioCtx] = useState(null);
  const [oscillator, setOscillator] = useState(null);
  const [personalContacts, setPersonalContacts] = useState([]);

  useEffect(() => {
    async function loadContacts() {
      const contacts = await db.personal_contacts.toArray();
      setPersonalContacts(contacts);
    }
    loadContacts();
  }, []);

  // Format emergency message template with coordinates
  const shareText = `EMERGENCY ALERT: I need immediate assistance in Nepal.
My current GPS coordinates are:
Latitude: ${coordinates.latitude.toFixed(6)}
Longitude: ${coordinates.longitude.toFixed(6)}
Accuracy: ±${coordinates.accuracy} meters
Google Maps link: https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}
Sent via Nepal Navigator App.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '🚨 EMERGENCY SOS — Nepal Navigator',
          text: shareText
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  // Audio Siren generator using Web Audio API (works 100% offline!)
  const toggleSiren = () => {
    if (sirenActive) {
      if (oscillator) {
        try {
          oscillator.stop();
          oscillator.disconnect();
        } catch (e) {}
      }
      setSirenActive(false);
      setStrobeActive(false);
    } else {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(650, ctx.currentTime);

        // Modulate frequency to sound like emergency whistle/siren
        let isHigh = false;
        const intervalId = setInterval(() => {
          if (!osc) return;
          try {
            osc.frequency.setValueAtTime(isHigh ? 650 : 950, ctx.currentTime);
            isHigh = !isHigh;
          } catch (e) {
            clearInterval(intervalId);
          }
        }, 350);

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        setAudioCtx(ctx);
        setOscillator(osc);
        setSirenActive(true);
        setStrobeActive(true);
      } catch (err) {
        console.warn('Web Audio not supported or blocked:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (oscillator) {
        try {
          oscillator.stop();
          oscillator.disconnect();
        } catch (e) {}
      }
    };
  }, [oscillator]);

  return (
    <div className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 transition-colors duration-150 ${
      strobeActive ? 'bg-red-950/90' : 'bg-[#080E1A]'
    }`}>
      <div className="max-w-xl mx-auto space-y-6">
        {/* Urgent Warning Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 text-xs font-black tracking-wider uppercase">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>CRITICAL RESCUE INTERFACE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t('sos.screenTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            {t('sos.warning')}
          </p>
        </div>

        {/* Live GPS Coordinates Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500 animate-pulse" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {t('sos.coordinatesTitle')}
              </h2>
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
              gpsStatus === 'available'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-amber-950 text-amber-300 border-amber-800'
            }`}>
              {gpsStatus === 'available' ? 'GPS Active' : 'Default Reference'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">{t('sos.latitude')}</div>
              <div className="text-lg font-bold text-white">{coordinates.latitude.toFixed(6)}° N</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">{t('sos.longitude')}</div>
              <div className="text-lg font-bold text-white">{coordinates.longitude.toFixed(6)}° E</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">{t('sos.accuracy')}</div>
              <div className="text-sm font-bold text-sky-400">±{coordinates.accuracy} meters</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Altitude</div>
              <div className="text-sm font-bold text-slate-300">
                {coordinates.altitude ? `${coordinates.altitude} m ASL` : 'Unavailable'}
              </div>
            </div>
          </div>

          {/* Share / Copy Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-bold shadow transition active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('sos.shareCoords')}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {copied && (
            <p className="text-center text-xs text-emerald-400 font-semibold mt-2">
              {t('sos.copied')}
            </p>
          )}
        </div>

        {/* Audible Siren & Strobe Alarm Tool */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{t('sos.flashSiren')}</span>
              {sirenActive && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Loud acoustic alert to help search and rescue teams locate you in rubble or fog.
            </p>
          </div>

          <button
            onClick={toggleSiren}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow transition active:scale-95 ${
              sirenActive
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'bg-red-600 text-white hover:bg-red-500'
            }`}
          >
            {sirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{sirenActive ? t('sos.stopSiren') : t('sos.startSiren')}</span>
          </button>
        </div>

        {/* 1-Tap Emergency Calling Numbers */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Direct Dispatch Lines
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href="tel:100"
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow transition active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Police (100)</span>
            </a>
            <a
              href="tel:102"
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow transition active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Ambulance (102)</span>
            </a>
            <a
              href="tel:101"
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm shadow transition active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Fire (101)</span>
            </a>
            <a
              href="tel:1155"
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm shadow transition active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Disaster NEOC (1155)</span>
            </a>
          </div>
        </div>

        {/* Personal Contacts List */}
        {personalContacts.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Call Saved Contact
            </div>
            {personalContacts.map((c) => (
              <a
                key={c.id}
                href={`tel:${c.phone}`}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs text-white transition"
              >
                <span>{c.name} ({c.phone})</span>
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
