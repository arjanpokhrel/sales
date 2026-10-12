import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, ExternalLink, ArrowLeft, Search, HelpCircle, Shield, AlertTriangle, Building2, CreditCard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const CITIZEN_SERVICES = [
  {
    id: 'driving-license',
    title_en: 'Driving License (सवारी चालक अनुमतिपत्र)',
    title_ne: 'सवारी चालक अनुमतिपत्र (Driving License)',
    department_en: 'Department of Transport Management (DoTM)',
    department_ne: 'यातायात व्यवस्था विभाग',
    category: 'transport',
    icon: '🚗',
    official_url: 'https://applydl.dotm.gov.np/',
    steps: [
      {
        title_en: 'New License Application (नयाँ आवेदन)',
        title_ne: 'नयाँ लाइसेन्स आवेदन',
        documents_en: [
          'Original Citizenship Certificate (नागरिकताको प्रमाणपत्र)',
          'Blood Group Test Report (रक्त समूह परीक्षण रिपोर्ट)',
          'Recent Passport-sized Photographs (2 copies)',
          'Medical Fitness Certificate (आँखा तथा शारीरिक जाँच रिपोर्ट - कार्यालयमै हुन्छ)',
          'Online Application Voucher / Registration Slip'
        ],
        documents_ne: [
          'नागरिकताको सक्कल प्रमाणपत्र र प्रतिलिपि',
          'रक्त समूह (Blood Group) प्रमाणीकरण कार्ड',
          'हालसालै खिचिएको पासपोर्ट साइजको फोटो (२ प्रति)',
          'स्वास्थ्य तथा आँखा परीक्षण रिपोर्ट (कार्यालय परिसरमै उपलब्ध हुन्छ)',
          'अनलाइन आवेदन दर्ता फारम (Slip)'
        ],
        fees_en: 'Bike/Scooter (Cat A): Rs 1,500 | Car/Jeep (Cat B): Rs 2,000 | Biometrics: Rs 500',
        fees_ne: 'मोटरसाइकल/स्कुटर: रु १,५०० | कार/जिप: रु २,००० | बायोमेट्रिक: रु ५००'
      },
      {
        title_en: 'License Renewal (नवीकरण)',
        title_ne: 'लाइसेन्स नवीकरण',
        documents_en: [
          'Original Expired Driving License',
          'Citizenship Certificate copy',
          'Medical / Eye test report',
          'Online renewal booking slip'
        ],
        documents_ne: [
          'पुरानो सक्कल ड्राइभिङ लाइसेन्स',
          'नागरिकताको प्रमाणपत्रको प्रतिलिपि',
          'स्वास्थ्य परीक्षण रिपोर्ट (कार्यालयमा हुने)',
          'अनलाइन नवीकरण भौचर'
        ],
        fees_en: 'Rs 1,500 to Rs 2,500 depending on category (Penalty if expired past 3 months)',
        fees_ne: 'वर्ग अनुसार रु १,५०० देखि २,५०० सम्म (३ महिना नाघेमा जरिवाना)'
      }
    ]
  },
  {
    id: 'e-passport',
    title_en: 'e-Passport (विद्युतीय राहदानी)',
    title_ne: 'विद्युतीय राहदानी (e-Passport)',
    department_en: 'Department of Passports (DoP)',
    department_ne: 'राहदानी विभाग',
    category: 'foreign',
    icon: '🛂',
    official_url: 'https://emrtds.nepalpassport.gov.np/',
    steps: [
      {
        title_en: 'Standard e-Passport (नयाँ / नवीकरण)',
        title_ne: 'साधारण विद्युतीय राहदानी',
        documents_en: [
          'National Identity Card (NID) Number or Biometric Slip (राष्ट्रिय परिचयपत्र नम्बर अनिवार्य)',
          'Original Citizenship Certificate & Photocopy',
          'Old Passport (if renewing)',
          'Online Pre-enrollment Appointment confirmation barcoded form',
          'Payment voucher (Online or Bank counter)'
        ],
        documents_ne: [
          'राष्ट्रिय परिचयपत्र (NID) नम्बर वा बायोमेट्रिक स्लिप (अनिवार्य)',
          'नागरिकताको सक्कल प्रमाणपत्र र १ प्रति फोटोकपी',
          'नवीकरण भएमा पुरानो राहदानीको सक्कल',
          'अनलाइन प्रि-इनरोलमेन्ट मिति तथा बारकोड भएको फारम',
          'राजस्व तिरेको भौचर (अनलाइन वा बैंक रसिद)'
        ],
        fees_en: 'Districts/DAOs (34 pages): Rs 5,000 | Department Fast Track (Kathmandu): Rs 12,000 (34 pages) / Rs 20,000 (66 pages)',
        fees_ne: 'जिल्ला प्रशासनबाट: रु ५,००० (३४ पृष्ठ) | राहदानी विभाग (काठमाडौँ द्रुत सेवा): रु १२,००० (३४ पृष्ठ) / रु २०,००० (६६ पृष्ठ)'
      }
    ]
  },
  {
    id: 'national-id',
    title_en: 'National Identity Card (राष्ट्रिय परिचयपत्र - NID)',
    title_ne: 'राष्ट्रिय परिचयपत्र (National ID - NID)',
    department_en: 'Department of National ID and Civil Registration (DoNIDCR)',
    department_ne: 'राष्ट्रिय परिचयपत्र तथा पञ्जीकरण विभाग',
    category: 'identity',
    icon: '🪪',
    official_url: 'https://donidcr.gov.np/',
    steps: [
      {
        title_en: 'Biometric Enrollment (बायोमेट्रिक दर्ता)',
        title_ne: 'बायोमेट्रिक विवरण दर्ता',
        documents_en: [
          'Original Nepali Citizenship Certificate',
          'Marriage Certificate (विवाह दर्ता - यदि विवाहित र नागरिकतामा पति/पत्नीको नाम नभएमा)',
          'Migration Certificate (बसाइँसराइ दर्ता प्रमाणपत्र - यदि बसाइँ सरेको भए)',
          'Online application number (available via Ward or DAO counter)'
        ],
        documents_ne: [
          'नेपाली नागरिकताको सक्कल प्रमाणपत्र',
          'विवाह दर्ता प्रमाणपत्र (विवाहित महिलाको नागरिकतामा पतिको थर नभएमा)',
          'बसाइँसराइ दर्ता प्रमाणपत्र (नागरिकताको ठेगानाभन्दा फरक ठाउँमा स्थायी बसोबास भएमा)',
          'अनलाइन आवेदन कोड (वडा वा जिल्ला प्रशासन कार्यालयमा निःशुल्क उपलब्ध)'
        ],
        fees_en: 'Free of cost for first-time government enrollment',
        fees_ne: 'पहिलो पटकको सरकारी दर्ता पूर्ण रूपमा निःशुल्क (Free)'
      }
    ]
  },
  {
    id: 'land-revenue',
    title_en: 'Land Registration & Property Transfer (मालपोत तथा रजिष्ट्रेसन)',
    title_ne: 'जग्गा रजिस्ट्रेसन तथा नामसारी (मालपोत)',
    department_en: 'Department of Land Management and Archive (DoLMA)',
    department_ne: 'भूमि व्यवस्थापन तथा अभिलेख विभाग',
    category: 'property',
    icon: '📜',
    official_url: 'https://molpa.gov.np/',
    steps: [
      {
        title_en: 'Land Purchase / Transfer (राजीनामा / खरिद-बिक्री)',
        title_ne: 'जग्गा खरिद-बिक्री तथा राजीनामा',
        documents_en: [
          'Original Land Ownership Certificate (लालपुर्जा सक्कल)',
          'Current Fiscal Year Local Tax Clearance Receipt (चालु आ.व. को मालपोत तिरो तिरेको रसिद)',
          'Original Citizenships and Copies of both Buyer and Seller',
          'Ward Office Four Boundaries Recommendation (वडाको चारकिल्ला सिफारिस)',
          'Survey Office Cadastral Trace Map (नापी कार्यालयको ट्रेस नक्सा र फिल्डबुक उतार)',
          'No-objection / clearance letter if mortgaged (बैंक फुकुवा पत्र)'
        ],
        documents_ne: [
          'जग्गाधनी प्रमाणपुर्जा (लालपुर्जा) को सक्कल प्रति',
          'सम्बन्धित स्थानीय तह (वडा/पालिका) मा चालु आ.व. को सम्पत्ति कर/तिरो बुझाएको रसिद',
          'क्रेता (किन्ने) र विक्रेता (बेच्ने) दुवैको सक्कल नागरिकता र फोटो',
          'वडा कार्यालयबाट जारी भएको चारकिल्ला प्रमाणित पत्र',
          'सम्बन्धित नापी कार्यालयबाट प्रमाणित ट्रेस नक्सा र फिल्डबुक उतार',
          'धितो/रोक्का रहेको भए बैंक तथा वित्तीय संस्थाको फुकुवा पत्र'
        ],
        fees_en: 'Registration fee: 4.5% to 7% of evaluated value (Municipality dependent)',
        fees_ne: 'रजिष्ट्रेसन दस्तुर: सरकारी मूल्याङ्कनको ४.५% देखि ७% सम्म (महानगर/नगरपालिका अनुसार)'
      }
    ]
  },
  {
    id: 'ward-services',
    title_en: 'Ward Office Recommendations (वडा कार्यालयका प्रमुख सिफारिस)',
    title_ne: 'वडा कार्यालयका प्रमुख सिफारिस तथा सेवा',
    department_en: 'Local Municipalities & Ward Offices',
    department_ne: 'स्थानीय तह तथा वडा कार्यालयहरू',
    category: 'local',
    icon: '🏛️',
    official_url: 'https://nepal.gov.np/',
    steps: [
      {
        title_en: 'Relationship Verification (नाता प्रमाणीकरण)',
        title_ne: 'नाता प्रमाणीकरण',
        documents_en: [
          'Citizenship Certificates of family members',
          'Birth Certificates of children',
          'Marriage Registration (for spouses)',
          'Passport-size photographs of applicant and family',
          'Two local witnesses with citizenship'
        ],
        documents_ne: [
          'नाता प्रमाणित गर्नुपर्ने सम्पूर्ण परिवारका सदस्यहरूको नागरिकता',
          'नाबालकको हकमा जन्मदर्ता प्रमाणपत्र',
          'विवाहितको हकमा विवाह दर्ता प्रमाणपत्र',
          'निवेदक र सदस्यहरूको पासपोर्ट साइजको फोटो',
          'स्थानीय साक्षी २ जना (नागरिकता सहित उपस्थित हुनुपर्ने)'
        ],
        fees_en: 'Internal fee: Rs 500 to Rs 1,000 depending on municipality',
        fees_ne: 'वडा दस्तुर: पालिकाको नियमानुसार रु ५०० देखि १,००० सम्म'
      },
      {
        title_en: 'Vital Event Registrations (जन्म, मृत्यु, विवाह, बसाइँसराइ)',
        title_ne: 'घटना दर्ता (जन्म, मृत्यु, विवाह, बसाइँसराइ)',
        documents_en: [
          'Hospital birth record / Cremation certificate',
          'Citizenship copies of parents / spouses',
          'Must be registered within 35 days'
        ],
        documents_ne: [
          'अस्पतालको जन्म प्रतिवेदन वा मृत्युको हकमा अस्पताल/घाटको मुचुल्का',
          'आमा-बुबा वा दुलहा-दुलहीको नागरिकता प्रतिलिपि',
          '३५ दिनभित्र दर्ता गरेमा पूर्ण निःशुल्क, ढिलो भएमा विलम्ब शुल्क'
        ],
        fees_en: 'Free within 35 days of event | Rs 50 to Rs 200 late fine',
        fees_ne: '३५ दिनभित्र निःशुल्क | ३५ दिन नाघेमा रु ५० देखि २०० सम्म'
      }
    ]
  }
];

export default function CitizenServicesPage() {
  const { lang } = useLanguage();
  const [q, setQ] = useState('');
  const [selectedService, setSelectedService] = useState(CITIZEN_SERVICES[0].id);

  const filtered = CITIZEN_SERVICES.filter((s) => {
    const text = `${s.title_en} ${s.title_ne} ${s.department_en} ${s.department_ne}`.toLowerCase();
    return text.includes(q.toLowerCase().trim());
  });

  const active = CITIZEN_SERVICES.find((s) => s.id === selectedService) || CITIZEN_SERVICES[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold uppercase mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Official Citizen Helpdesk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {lang === 'ne' ? 'सरकारी सेवा र कागजात चेकलिस्ट' : 'Government Services & Document Checklist'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {lang === 'ne'
              ? 'लाइसेन्स, राहदानी, राष्ट्रिय परिचयपत्र, मालपोत र वडा सिफारिस लिन जाँदा चाहिने सम्पूर्ण कागजात र सरकारी दस्तुर सूची।'
              : 'Official required documents, fees, and government portal links for licenses, passports, NID, land revenue, and ward verifications.'}
          </p>
        </div>
        <Link
          to="/map"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{lang === 'ne' ? 'नक्सामा फर्कनुहोस्' : 'Back to map'}</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={lang === 'ne' ? 'लाइसेन्स, राहदानी, मालपोत, जन्मदर्ता…' : 'Search license, passport, NID, land revenue…'}
          className="w-full bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400 text-sm"
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Service Selector List */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 block mb-1">
            {lang === 'ne' ? 'सेवाहरू छान्नुहोस्' : 'Select Service'}
          </span>
          {filtered.map((service) => {
            const isSelected = service.id === active.id;
            return (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition shadow-sm flex items-start gap-3 ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-600 ring-2 ring-sky-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{service.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {lang === 'ne' ? service.title_ne : service.title_en}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {lang === 'ne' ? service.department_ne : service.department_en}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Detailed Document Checklist */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
            {/* Service Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {active.icon}
                </span>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {lang === 'ne' ? active.title_ne : active.title_en}
                  </h2>
                  <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
                    {lang === 'ne' ? active.department_ne : active.department_en}
                  </p>
                </div>
              </div>

              {active.official_url && (
                <a
                  href={active.official_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition active:scale-95 flex-shrink-0"
                >
                  <span>{lang === 'ne' ? 'आधिकारिक अनलाइन पोर्टल' : 'Official Portal'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Steps & Requirements */}
            <div className="space-y-6">
              {active.steps.map((step, idx) => (
                <div key={idx} className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[11px] font-mono flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{lang === 'ne' ? step.title_ne : step.title_en}</span>
                  </h3>

                  {/* Required Documents List */}
                  <div className="space-y-2 pl-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      {lang === 'ne' ? 'आवश्यक कागजातहरू (Required Documents):' : 'Required Documents:'}
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {(lang === 'ne' ? step.documents_ne : step.documents_en).map((doc, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Fees information */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-start gap-2 text-xs">
                    <CreditCard className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {lang === 'ne' ? 'सरकारी दस्तुर/राजस्व: ' : 'Government Fees: '}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {lang === 'ne' ? step.fees_ne : step.fees_en}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Advisory Note */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 dark:text-amber-200/90 leading-relaxed">
                {lang === 'ne'
                  ? 'सधैं सक्कल (Original) कागजात र कम्तीमा २ प्रति फोटोकपी लिएर जानुहोस्। सरकारी कार्यालयको समय आइतबारदेखि बिहीबार बिहान १० देखि ५ बजेसम्म (शुक्रबार ३ बजेसम्म) हुने गर्छ।'
                  : 'Always carry original certificates along with at least 2 photocopies and recent passport photos. Normal government office hours are Sunday to Thursday 10:00 - 17:00 (Friday until 15:00).'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

