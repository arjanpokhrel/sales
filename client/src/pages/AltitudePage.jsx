import React, { useState } from 'react';
import { Mountain, Compass, ShieldAlert, HeartPulse, AlertTriangle, ArrowLeft, Droplet, Thermometer, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';

export default function AltitudePage() {
  const { lang } = useLanguage();
  const { coordinates } = useNetwork();
  const [manualAlt, setManualAlt] = useState('');

  // Use GPS altitude if available, otherwise manual or default Kathmandu 1400m
  const currentAltitude = manualAlt !== ''
    ? Number(manualAlt)
    : (coordinates.altitude ? Math.round(coordinates.altitude) : 1400);

  const altFeet = Math.round(currentAltitude * 3.28084);

  // Determine AMS risk tier
  let tier = 'safe';
  let tierLabel_en = 'Low Risk Zone (< 2,500m)';
  let tierLabel_ne = 'सामान्य तथा सुरक्षित क्षेत्र (< २,५०० मि.)';
  let tierDesc_en = 'Altitude sickness rarely occurs at this elevation. Standard hydration is sufficient.';
  let tierDesc_ne = 'यस उचाइमा लेक लाग्ने (AMS) जोखिम नगण्य हुन्छ। सामान्य पानी पिउने र हिँड्ने गरे पुग्छ।';
  let tierColor = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800';

  if (currentAltitude >= 2500 && currentAltitude < 3500) {
    tier = 'moderate';
    tierLabel_en = 'Moderate Altitude (2,500m - 3,500m)';
    tierLabel_ne = 'मध्यम उचाइ (२,५०० देखि ३,५०० मि.)';
    tierDesc_en = 'Mild symptoms like light headache or breathlessness may begin. Ascend no more than 300-500m per day.';
    tierDesc_ne = 'टाउको भारी हुने वा स्वाँस्वाँ हुने हुन सक्छ। दिनमा ३०० देखि ५०० मिटरभन्दा बढी उचाइ नबढाउनुहोस्।';
    tierColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800';
  } else if (currentAltitude >= 3500 && currentAltitude < 5500) {
    tier = 'high';
    tierLabel_en = 'High Altitude Risk (3,500m - 5,500m)';
    tierLabel_ne = 'उच्च जोखिम क्षेत्र (३,५०० देखि ५,५०० मि.)';
    tierDesc_en = 'Acute Mountain Sickness (AMS) danger is high. Take acclimatization rest days. Watch for vomiting or confusion.';
    tierDesc_ne = 'लेक लाग्ने उच्च सम्भावना। प्रत्येक ३-४ दिनमा विश्राम दिन (Acclimatization day) राख्नुहोस्। मदिरा र धुम्रपान नगर्नुहोस्।';
    tierColor = 'text-red-500 bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800';
  } else if (currentAltitude >= 5500) {
    tier = 'extreme';
    tierLabel_en = 'Extreme Altitude (> 5,500m)';
    tierLabel_ne = 'चरम उचाइ क्षेत्र (> ५,५०० मि.)';
    tierDesc_en = 'Extreme hazard. Severe risk of life-threatening HAPE and HACE. Immediate descent required if symptoms appear.';
    tierDesc_ne = 'अत्यधिक जोखिम। ज्यान जाने खतरा हुने हुँदा लक्षण देखिनासाथ तुरुन्तै कम्तीमा १,००० मिटर तल झर्नुपर्छ।';
    tierColor = 'text-purple-500 bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800';
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold uppercase mb-2">
            <Mountain className="w-3.5 h-3.5" />
            <span>GPS Altitude & Health Safety</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {lang === 'ne' ? 'उचाइ मिटर र लेक लाग्ने (AMS) सुरक्षा' : 'Live Altitude Meter & AMS Safety Guide'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {lang === 'ne'
              ? 'GPS मार्फत आफ्नो वास्तविक उचाइ नाप्नुहोस् र हिमाली पदयात्रा तथा यात्रामा लेक लाग्नबाट जोगिने नियमहरू जान्नुहोस्।'
              : 'Measure elevation from device GPS, check altitude sickness hazard zones, and review mountain acclimatization rules.'}
          </p>
        </div>
      </div>

      {/* Main Altitude Gauge Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold font-mono">
          <Compass className="w-4 h-4 text-sky-500 animate-spin" />
          <span>{coordinates.altitude ? 'GPS Altitude Active' : 'Estimated / Reference Elevation'}</span>
        </div>

        {/* Big Digital Altitude Readout */}
        <div className="space-y-1">
          <div className="text-6xl sm:text-7xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {currentAltitude.toLocaleString()}
            <span className="text-2xl sm:text-3xl font-bold text-sky-500 ml-2">m</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-400 font-mono">
            ≈ {altFeet.toLocaleString()} ft
          </div>
        </div>

        {/* Current Risk Badge */}
        <div className={`p-4 rounded-2xl border max-w-xl mx-auto ${tierColor}`}>
          <div className="font-black text-sm uppercase tracking-wide">
            {lang === 'ne' ? tierLabel_ne : tierLabel_en}
          </div>
          <p className="text-xs mt-1 leading-relaxed opacity-90">
            {lang === 'ne' ? tierDesc_ne : tierDesc_en}
          </p>
        </div>

        {/* Manual Altitude Adjustment Slider / Input */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{lang === 'ne' ? 'परीक्षणको लागि उचाइ बदल्नुहोस्:' : 'Test with custom elevation:'}</span>
            <button
              onClick={() => setManualAlt('')}
              className="text-sky-500 hover:underline font-bold"
            >
              {lang === 'ne' ? 'GPS रिसेट' : 'Reset to GPS'}
            </button>
          </div>
          <div className="flex gap-2">
            {[1400, 2800, 3800, 5364].map((alt) => (
              <button
                key={alt}
                onClick={() => setManualAlt(String(alt))}
                className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                {alt}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Golden Rules of Altitude Sickness */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 font-black text-sm flex items-center justify-center">
            १
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            {lang === 'ne' ? 'लक्षण भएमा थप उचाइ नचढ्ने' : 'Never Ascend with Symptoms'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {lang === 'ne'
              ? 'टाउको दुखेको, रिँगटा लागेको वा वाकवाकी लागेको अवस्थामा थप उचाइमा कहिल्यै नजानुहोस्। त्यहीँ विश्राम लिनुहोस्।'
              : 'If you have a headache, nausea, or fatigue, stop and rest at the same altitude until fully recovered.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 font-black text-sm flex items-center justify-center">
            २
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            {lang === 'ne' ? 'लक्षण बढेमा तुरुन्त तल झर्ने' : 'Descend Immediately if Worsening'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {lang === 'ne'
              ? 'औषधिले काम नगरे वा लक्षण बढेमा कम्तीमा ५०० देखि १,००० मिटर तुरुन्त तल झर्नु नै सर्वोत्तम जीवन बचाउने उपाय हो।'
              : 'Descent is the definitive cure. Go down at least 500m to 1,000m immediately if symptoms persist.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center justify-center">
            ३
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            {lang === 'ne' ? 'पर्याप्त पानी र झोलिलो खानेकुरा' : 'Stay Hydrated & Eat Well'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {lang === 'ne'
              ? 'दिनमा कम्तीमा ३ देखि ४ लिटर पानी वा लसुनको झोल खानुहोस्। रक्सी, बियर र चुरोट पूर्णतया त्याग गर्नुहोस्।'
              : 'Drink 3-4 liters of water daily. Garlic soup helps acclimatization. Avoid alcohol, sleeping pills, and smoking.'}
          </p>
        </div>
      </div>
    </div>
  );
}

