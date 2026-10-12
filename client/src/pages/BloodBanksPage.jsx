import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Phone, MapPin, Search, Clock, ArrowLeft, ShieldAlert, Check, Copy, ExternalLink, Droplet } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCopy } from '../components/useCopy';

export const NEPAL_BLOOD_BANKS = [
  {
    id: 'nrrc-central',
    name_en: 'Central Blood Transfusion Service (Red Cross)',
    name_ne: 'केन्द्रीय रक्तसञ्चार सेवा (नेपाल रेडक्रस सोसाइटी)',
    city: 'Kathmandu',
    province: 'Bagmati',
    address_en: 'Exhibition Road, Bhrikutimandap, Kathmandu',
    address_ne: 'प्रदर्शनी मार्ग, भृकुटीमण्डप, काठमाडौँ',
    phone: '01-4225344',
    alt_phone: '01-4229344',
    hours: '24/7 (दिनरात खुला)',
    is_24_7: true,
    latitude: 27.7025,
    longitude: 85.3180,
    services_en: ['Whole Blood', 'Platelets (PRP)', 'Packed Red Cells', 'Fresh Frozen Plasma (FFP)'],
    services_ne: ['सम्पूर्ण रगत', 'प्लेटलेट्स', 'रातो रक्तकोष (PRBC)', 'प्लाज्मा (FFP)']
  },
  {
    id: 'tuth-blood-bank',
    name_en: 'TUTH Blood Bank (Teaching Hospital)',
    name_ne: 'त्रिवि शिक्षण अस्पताल रक्तसञ्चार केन्द्र (TUTH)',
    city: 'Kathmandu',
    province: 'Bagmati',
    address_en: 'Maharajgunj, Kathmandu',
    address_ne: 'महाराजगन्ज, काठमाडौँ',
    phone: '01-4412303',
    alt_phone: '01-4412505',
    hours: '24/7 (Emergency Blood Desk)',
    is_24_7: true,
    latitude: 27.7360,
    longitude: 85.3310,
    services_en: ['Trauma blood supply', 'Cross-matching', 'Emergency transfusion'],
    services_ne: ['आकस्मिक ट्रमा रगत', 'क्रस-म्याचिङ', 'इमर्जेन्सी ब्लड सप्लाई']
  },
  {
    id: 'bir-blood-bank',
    name_en: 'Bir Hospital Emergency Blood Center',
    name_ne: 'वीर अस्पताल रक्तसञ्चार इकाई',
    city: 'Kathmandu',
    province: 'Bagmati',
    address_en: 'Kanti Path / Tundikhel, Kathmandu',
    address_ne: 'कान्तिपथ / खुलामञ्च नजिक, काठमाडौँ',
    phone: '01-4221119',
    alt_phone: '01-4221988',
    hours: '24/7',
    is_24_7: true,
    latitude: 27.7042,
    longitude: 85.3140,
    services_en: ['General Transfusion', 'Emergency Surgery Support'],
    services_ne: ['शल्यक्रिया रगत सपोर्ट', 'इमर्जेन्सी रगत सेवा']
  },
  {
    id: 'patan-blood-bank',
    name_en: 'Patan Hospital Blood Bank',
    name_ne: 'पाटन अस्पताल रक्त बैंक',
    city: 'Lalitpur',
    province: 'Bagmati',
    address_en: 'Lagankhel, Lalitpur',
    address_ne: 'लगनखेल, ललितपुर',
    phone: '01-5522295',
    alt_phone: '01-5522266',
    hours: '24/7',
    is_24_7: true,
    latitude: 27.6685,
    longitude: 85.3210,
    services_en: ['Maternal Blood Support', 'Pediatric Blood', 'All Blood Groups'],
    services_ne: ['प्रसूति रगत सपोर्ट', 'बालरोग रगत', 'सबै रक्त समूह']
  },
  {
    id: 'bhaktapur-blood-bank',
    name_en: 'Bhaktapur Red Cross Blood Bank',
    name_ne: 'भक्तपुर रेडक्रस रक्तसञ्चार केन्द्र',
    city: 'Bhaktapur',
    province: 'Bagmati',
    address_en: 'Doodhpati, Bhaktapur',
    address_ne: 'दूधपाटी, भक्तपुर',
    phone: '01-6611661',
    hours: '24/7',
    is_24_7: true,
    latitude: 27.6720,
    longitude: 85.4240,
    services_en: ['Blood Collection', 'Distribution'],
    services_ne: ['रक्त संकलन तथा वितरण']
  },
  {
    id: 'pokhara-blood-bank',
    name_en: 'Pokhara Regional Blood Transfusion Service',
    name_ne: 'पोखरा क्षेत्रीय रक्तसञ्चार सेवा (रेडक्रस)',
    city: 'Pokhara',
    province: 'Gandaki',
    address_en: 'Ramghat, Pokhara, Kaski',
    address_ne: 'रामघाट, पोखरा, कास्की',
    phone: '061-521091',
    alt_phone: '061-520555',
    hours: '24/7',
    is_24_7: true,
    latitude: 28.2140,
    longitude: 83.9920,
    services_en: ['Western Regional Transfusion Hub', 'Component separation'],
    services_ne: ['गण्डकी प्रदेश मुख्य रक्त केन्द्र', 'कम्पोनेन्ट रगत']
  },
  {
    id: 'chitwan-blood-bank',
    name_en: 'Chitwan Red Cross Blood Center',
    name_ne: 'चितवन रेडक्रस रक्तसञ्चार केन्द्र',
    city: 'Bharatpur',
    province: 'Bagmati',
    address_en: 'Chaubiskothi, Bharatpur, Chitwan',
    address_ne: 'चौबिसकोठी, भरतपुर, चितवन',
    phone: '056-520194',
    hours: '24/7',
    is_24_7: true,
    latitude: 27.6780,
    longitude: 84.4320,
    services_en: ['Cancer Hospital Transfusion Support', 'Trauma Blood Supply'],
    services_ne: ['क्यान्सर अस्पताल रगत आपूर्ति', 'आकस्मिक ट्रमा सपोर्ट']
  },
  {
    id: 'bpkihs-blood-bank',
    name_en: 'BPKIHS Blood Bank Dharan',
    name_ne: 'विपी कोइराला स्वास्थ्य विज्ञान प्रतिष्ठान रक्त बैंक',
    city: 'Dharan',
    province: 'Koshi',
    address_en: 'Ghopa Camp, Dharan, Sunsari',
    address_ne: 'घोपा क्याम्प, धरान, सुनसरी',
    phone: '025-525555',
    hours: '24/7',
    is_24_7: true,
    latitude: 26.8120,
    longitude: 87.2840,
    services_en: ['Eastern Regional Referral Supply', 'All Component types'],
    services_ne: ['कोशी प्रदेश मुख्य रेफरल रगत बैंक']
  },
  {
    id: 'biratnagar-blood-bank',
    name_en: 'Biratnagar Red Cross Blood Bank',
    name_ne: 'विराटनगर रेडक्रस रक्तसञ्चार सेवा',
    city: 'Biratnagar',
    province: 'Koshi',
    address_en: 'Hospital Chowk, Biratnagar, Morang',
    address_ne: 'अस्पताल चोक, विराटनगर, मोरङ',
    phone: '021-522111',
    hours: '24/7',
    is_24_7: true,
    latitude: 26.4520,
    longitude: 87.2710,
    services_en: ['Koshi Hospital Support', 'Emergency Transfusions'],
    services_ne: ['कोशी अस्पताल सपोर्ट', 'आकस्मिक रक्तसञ्चार']
  },
  {
    id: 'butwal-blood-bank',
    name_en: 'Butwal Red Cross Blood Bank',
    name_ne: 'बुटवल रेडक्रस रक्तसञ्चार केन्द्र',
    city: 'Butwal',
    province: 'Lumbini',
    address_en: 'Lumbini Provincial Hospital Area, Butwal',
    address_ne: 'लुम्बिनी प्रादेशिक अस्पताल नजिक, बुटवल',
    phone: '071-540194',
    hours: '24/7',
    is_24_7: true,
    latitude: 27.7020,
    longitude: 83.4630,
    services_en: ['Lumbini Province Blood Hub'],
    services_ne: ['लुम्बिनी प्रदेश मुख्य रगत आपूर्ति']
  },
  {
    id: 'nepalgunj-blood-bank',
    name_en: 'Nepalgunj Red Cross Blood Bank',
    name_ne: 'नेपालगन्ज रेडक्रस रक्तसञ्चार केन्द्र',
    city: 'Nepalgunj',
    province: 'Lumbini',
    address_en: 'Bheri Hospital Chowk, Nepalgunj, Banke',
    address_ne: 'भेरी अस्पताल चोक, नेपालगन्ज, बाँके',
    phone: '081-520194',
    hours: '24/7',
    is_24_7: true,
    latitude: 28.0530,
    longitude: 81.6180,
    services_en: ['Mid-Western Referral Supply'],
    services_ne: ['भेरी अस्पताल र पश्चिम नेपाल आपूर्ति']
  }
];

export default function BloodBanksPage() {
  const { lang } = useLanguage();
  const [q, setQ] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const { copied, copy } = useCopy();

  const cities = ['all', 'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Bharatpur', 'Dharan', 'Biratnagar', 'Butwal', 'Nepalgunj'];

  const filtered = NEPAL_BLOOD_BANKS.filter((b) => {
    const text = `${b.name_en} ${b.name_ne} ${b.city} ${b.address_en} ${b.address_ne}`.toLowerCase();
    const matchesQ = text.includes(q.toLowerCase().trim());
    const matchesCity = selectedCity === 'all' || b.city.toLowerCase() === selectedCity.toLowerCase();
    return matchesQ && matchesCity;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/60 via-red-900/30 to-slate-900 border border-red-800/60 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 text-xs font-bold uppercase mb-2">
              <Droplet className="w-3.5 h-3.5 fill-red-400 text-red-400" />
              <span>Emergency Blood Transfusion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {lang === 'ne' ? 'नेपाल रक्त बैंक डाइरेक्टरी' : 'Nepal Blood Bank Directory'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {lang === 'ne'
                ? 'काठमाडौँ उपत्यका तथा ७ वटै प्रदेशका मुख्य रक्तसञ्चार केन्द्रहरू, २४/७ आकस्मिक फोन नम्बर र प्रत्यक्ष सम्पर्क।'
                : 'Verified 24/7 Red Cross & Hospital blood transfusion hubs across Nepal with direct one-tap calling.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-red-900/60 flex-shrink-0 text-center">
            <span className="text-[11px] font-bold text-red-300 uppercase block">Central Red Cross Helpline</span>
            <a
              href="tel:014225344"
              className="text-lg font-black text-white hover:text-red-400 font-mono flex items-center justify-center gap-1.5 mt-1"
            >
              <Phone className="w-4 h-4 text-red-400" />
              <span>01-4225344</span>
            </a>
            <span className="text-[10px] text-slate-400 mt-0.5 block">भृकुटीमण्डप, काठमाडौँ (24/7)</span>
          </div>
        </div>
      </div>

      {/* Search and City Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={lang === 'ne' ? 'रक्त बैंक, सहर, अस्पताल वा ठेगाना खोज्नुहोस्…' : 'Search blood bank, city, or hospital…'}
            className="w-full bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCity === city
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {city === 'all' ? (lang === 'ne' ? 'सबै सहरहरू' : 'All Cities') : city}
            </button>
          ))}
        </div>
      </div>

      {/* Blood Bank Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((bank) => (
          <div
            key={bank.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                      {bank.city} · {bank.province}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{bank.hours}</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {lang === 'ne' ? bank.name_ne : bank.name_en}
                  </h3>
                </div>

                <div className="p-2 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex-shrink-0">
                  <Droplet className="w-5 h-5 fill-red-500" />
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
                <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                <span>{lang === 'ne' ? bank.address_ne : bank.address_en}</span>
              </p>

              {/* Component Tags */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(lang === 'ne' ? bank.services_ne : bank.services_en).map((srv, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    ✓ {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <a
                href={`tel:${bank.phone}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm transition active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>{bank.phone}</span>
              </a>

              {bank.latitude && bank.longitude && (
                <Link
                  to={`/map?lat=${bank.latitude}&lng=${bank.longitude}&zoom=15`}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-xs transition flex items-center gap-1"
                  title="View on Map"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  <span className="hidden sm:inline">{lang === 'ne' ? 'नक्सा' : 'Map'}</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Donor Guidance Note */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
        <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-red-500" />
          <span>{lang === 'ne' ? 'रक्तदान तथा रगत माग गर्दा ध्यान दिनुपर्ने कुराहरू' : 'Blood Donation & Request Guidelines'}</span>
        </h3>
        <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
          <li>{lang === 'ne' ? 'रगत माग गर्न जाँदा बिरामीको अस्पताल भर्ना पुर्जी (Doctor Blood Requisition Slip) र रगतको नमुना (Cross-matching sample) अनिवार्य लैजानुहोस्।' : 'Always carry the doctor requisition slip and patient cross-matching blood sample tube.'}</li>
          <li>{lang === 'ne' ? '१८ देखि ६० वर्ष उमेरका, ४५ केजीभन्दा माथि तौल भएका स्वस्थ व्यक्तिले प्रत्येक ३ महिनामा रक्तदान गर्न सक्छन्।' : 'Healthy individuals aged 18-60 weighing above 45kg can donate blood every 3 months.'}</li>
        </ul>
      </div>
    </div>
  );
}

