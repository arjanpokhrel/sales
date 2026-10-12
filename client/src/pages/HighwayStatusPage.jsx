import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Phone, AlertTriangle, CheckCircle2, XCircle, Clock, MapPin, RefreshCw, ArrowLeft, Navigation, Car, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const NEPAL_HIGHWAYS = [
  {
    id: 'narayangadh-mugling',
    name_en: 'Narayangadh - Mugling Highway',
    name_ne: 'नारायणगढ - मुग्लिन सडकखण्ड',
    route_code: 'H05',
    length_km: 36,
    status: 'caution', // 'open' | 'caution' | 'blocked'
    status_label_en: 'One-Way / High Landslide Alert (एकतर्फी / सतर्कता)',
    status_label_ne: 'सञ्चालनमा (पहिरो जोखिम - सतर्कता)',
    hotspots_en: 'Tuin Khola, Kalikhola, Simaltal cliff',
    hotspots_ne: 'तुइन खोला, कालीखोला, सिमलताल पहिरो क्षेत्र',
    last_reported: 'Updated 20 mins ago (Nepal Traffic Police)',
    advisory_en: 'Frequent monsoon rockfalls near Tuin Khola bridge. Travel during daylight recommended.',
    advisory_ne: 'तुइन खोला पुल नजिक पहिरोको जोखिम। अत्यावश्यक बाहेक रातिको समयमा यात्रा नगर्न ट्राफिक प्रहरीको आग्रह।',
    bypass_en: 'Kathmandu - Hetauda - Bharatpur via Kanti Lokpath',
    bypass_ne: 'कान्ति लोकपथ वा त्रिभुवन राजपथ'
  },
  {
    id: 'prithvi-highway',
    name_en: 'Prithvi Highway (Kathmandu - Pokhara)',
    name_ne: 'पृथ्वी राजमार्ग (काठमाडौँ - पोखरा)',
    route_code: 'H04',
    length_km: 200,
    status: 'open',
    status_label_en: 'Open with ongoing road expansion',
    status_label_ne: 'सञ्चालनमा (विस्तार कार्य जारी - धुलो र खाल्डाखुल्डी)',
    hotspots_en: 'Nagdhunga tunnel approach, Malekhu, Dumre, Mugling',
    hotspots_ne: 'नागढुङ्गा, मलेखु, डुम्रे, मुग्लिन',
    last_reported: 'Updated 1 hour ago',
    advisory_en: 'Road widening work active between Mugling and Pokhara. Expect slower speeds.',
    advisory_ne: 'मुग्लिन-पोखरा खण्डमा सडक चौडा गर्ने कार्य जारी। सवारी साधन मध्यम गतिमा चलाउनुहोला।'
  },
  {
    id: 'bp-highway',
    name_en: 'BP Highway (Dhulikhel - Sindhuli - Bardibas)',
    name_ne: 'बीपी राजमार्ग (धुलिखेल - सिन्धुली - बर्दिबास)',
    route_code: 'H06',
    length_km: 158,
    status: 'caution',
    status_label_en: 'Operational with river diversions',
    status_label_ne: 'सञ्चालनमा (रोशी खोला डाइभर्सन बाटो)',
    hotspots_en: 'Roshi River basin, Nepalthok, Khurkot',
    hotspots_ne: 'रोशी खोला खण्ड, नेपालथोक, खुर्कोट',
    last_reported: 'Updated 3 hours ago',
    advisory_en: 'Diversions in place along damaged Roshi corridor. Heavy 10-wheeler trucks restricted.',
    advisory_ne: 'बाढीले क्षति पुर्‍याएको रोशी खोला किनारमा अस्थायी डाइभर्सन बाटो। ठूला मालबाहक ट्रक निषेध।'
  },
  {
    id: 'siddhartha-highway',
    name_en: 'Siddhartha Highway (Butwal - Pokhara)',
    name_ne: 'सिद्धार्थ राजमार्ग (बुटवल - पाल्पा - पोखरा)',
    route_code: 'H10',
    length_km: 181,
    status: 'caution',
    status_label_en: 'Caution near Siddhababa cliff',
    status_label_ne: 'सिद्धबाबा क्षेत्रमा सुरुङ निर्माण तथा पहिरो सतर्कता',
    hotspots_en: 'Siddhababa, Dobhan, Ramdi',
    hotspots_ne: 'सिद्धबाबा, दोभान, रम्दी पुल',
    last_reported: 'Updated today',
    advisory_en: 'Siddhababa rock shed tunnel construction active. Watch for falling stones during rainfall.',
    advisory_ne: 'सिद्धबाबा सुरुङ निर्माण जारी। पानी परेको बेला माथिबाट ढुङ्गा खस्ने जोखिम।'
  },
  {
    id: 'tribhuvan-highway',
    name_en: 'Tribhuvan Highway (Naubise - Daman - Hetauda)',
    name_ne: 'त्रिभुवन राजपथ (नौबिसे - दामन - हेटौँडा)',
    route_code: 'H02',
    length_km: 133,
    status: 'open',
    status_label_en: 'Open (Steep mountain turns)',
    status_label_ne: 'सञ्चालनमा (घुमाउरो पहाडी बाटो)',
    hotspots_en: 'Daman, Simbhanjyang (Winter fog & frost)',
    hotspots_ne: 'दामन, सिमभन्ज्याङ (जाडोमा कुहिरो र हिउँ/तुसारो)',
    last_reported: 'Updated today',
    advisory_en: 'Good alternative route when Mugling is congested. Steep turns suitable for light vehicles.',
    advisory_ne: 'मुग्लिन जाम भएको बेला उपयुक्त वैकल्पिक मार्ग।'
  },
  {
    id: 'karnali-highway',
    name_en: 'Karnali Highway (Surkhet - Jumla)',
    name_ne: 'कर्णाली राजमार्ग (सुर्खेत - जुम्ला)',
    route_code: 'H13',
    length_km: 232,
    status: 'caution',
    status_label_en: 'Challenging terrain / Narrow sections',
    status_label_ne: 'साँघुरो तथा अप्ठ्यारो पहाडी खण्ड',
    hotspots_en: 'Kalikot Gaganekhola, Hulma',
    hotspots_ne: 'कालीकोट गगनेखोला, हुल्म',
    last_reported: 'Updated today',
    advisory_en: 'Narrow cliff passes. 4WD vehicles and experienced mountain driving strictly advised.',
    advisory_ne: 'साँघुरो भीर भएकोले उच्च सतर्कता अपनाउनुहोला।'
  },
  {
    id: 'mahendra-highway',
    name_en: 'East-West (Mahendra) Highway',
    name_ne: 'पूर्व-पश्चिम (महेन्द्र) राजमार्ग',
    route_code: 'H01',
    length_km: 1027,
    status: 'open',
    status_label_en: 'Open throughout (Expansion diversions in Butwal-Narayangadh)',
    status_label_ne: 'सञ्चालनमा (बुटवल-नारायणगढ खण्डमा डाइभर्सन)',
    hotspots_en: 'Daunne hill section, Bardaghat',
    hotspots_ne: 'दाउन्ने डाँडा, बर्दघाट',
    last_reported: 'Updated 2 hours ago',
    advisory_en: 'Heavy construction between Narayangadh and Butwal. Expect bumpy roads in Daunne section.',
    advisory_ne: 'दाउन्ने खण्डमा सडक मर्मत भइरहेकोले सवारीको लामो लाइन हुन सक्छ।'
  }
];

export default function HighwayStatusPage() {
  const { lang } = useLanguage();
  const [filter, setFilter] = useState('all');

  const filtered = NEPAL_HIGHWAYS.filter((h) => {
    if (filter === 'all') return true;
    return h.status === filter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-bold uppercase mb-2">
              <Car className="w-3.5 h-3.5" />
              <span>Nepal Highway Safety Monitor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {lang === 'ne' ? 'नेपाल राजमार्ग तथा पहिरो स्थिति' : 'Nepal Highway & Landslide Status'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              {lang === 'ne'
                ? 'मुग्लिन, बीपी, पृथ्वी र महेन्द्र राजमार्गका ताजा सडक अवस्था, पहिरो जोखिम क्षेत्र र ट्राफिक प्रहरी हेल्पलाइन।'
                : 'Current road conditions, landslide alerts, and bypass routes across major national highways.'}
            </p>
          </div>

          {/* Direct Traffic Police Dial Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex-shrink-0 text-center min-w-[200px]">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Traffic Control Room</span>
            <a
              href="tel:103"
              className="text-2xl font-black text-sky-400 hover:text-sky-300 font-mono flex items-center justify-center gap-2 mt-1"
            >
              <Phone className="w-5 h-5 text-sky-400" />
              <span>103</span>
            </a>
            <span className="text-[10px] text-slate-500 mt-0.5 block">National Traffic Helpline (24/7)</span>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label_en: 'All Highways', label_ne: 'सबै राजमार्ग' },
          { id: 'open', label_en: '🟢 Fully Open', label_ne: '🟢 खुला' },
          { id: 'caution', label_en: '🟡 Caution / One-Way', label_ne: '🟡 सतर्कता / एकतर्फी' },
          { id: 'blocked', label_en: '🔴 Blocked', label_ne: '🔴 अवरुद्ध' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filter === tab.id
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {lang === 'ne' ? tab.label_ne : tab.label_en}
          </button>
        ))}
      </div>

      {/* Highways List */}
      <div className="space-y-4">
        {filtered.map((highway) => {
          const isCaution = highway.status === 'caution';
          const isBlocked = highway.status === 'blocked';
          const isOpen = highway.status === 'open';

          const badgeBg = isBlocked
            ? 'bg-red-950/60 border-red-800 text-red-300'
            : isCaution
            ? 'bg-amber-950/60 border-amber-800 text-amber-300'
            : 'bg-emerald-950/60 border-emerald-800 text-emerald-300';

          return (
            <div
              key={highway.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {highway.route_code}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
                      {lang === 'ne' ? highway.status_label_ne : highway.status_label_en}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {highway.length_km} km
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {lang === 'ne' ? highway.name_ne : highway.name_en}
                  </h3>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{highway.last_reported}</span>
                </div>
              </div>

              {/* Advisory Details */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {lang === 'ne' ? 'जोखिम तथा निर्माण क्षेत्र: ' : 'Critical Hotspots: '}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {lang === 'ne' ? highway.hotspots_ne : highway.hotspots_en}
                    </span>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 pl-6 leading-relaxed">
                  {lang === 'ne' ? highway.advisory_ne : highway.advisory_en}
                </p>

                {highway.bypass_ne && (
                  <div className="pl-6 pt-1 text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                    <span>{lang === 'ne' ? 'वैकल्पिक बाटो: ' : 'Bypass route: '}</span>
                    <span>{lang === 'ne' ? highway.bypass_ne : highway.bypass_en}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Highway Travel Tips */}
      <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-sky-500" />
          <span>{lang === 'ne' ? 'वर्षायाम र पहाडी यात्राका लागि सुरक्षा सल्लाह' : 'Mountain Travel Safety Advisory'}</span>
        </h4>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {lang === 'ne'
            ? 'लामो यात्रा सुरु गर्नुअघि सधैं १०३ नम्बरमा फोन गरेर बाटोको ताजा अवस्था बुझ्नुहोस्। गाडीमा पानी, सुख्खा खानेकुरा, प्राथमिक उपचार बक्स र मोबाइल पावरबैंक अनिवार्य साथमा राख्नुहोस्।'
            : 'Always call 103 before departing on major inter-district highway trips. Keep emergency drinking water, first aid essentials, and a charged mobile power bank in your vehicle.'}
        </p>
      </div>
    </div>
  );
}

