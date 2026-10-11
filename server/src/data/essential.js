// Essential bundled dataset — ships INSIDE the app, available on first open
// with zero downloads. Emergency numbers verified against Nepal Police /
// NEOC public listings, last checked 2026-10-11 (see About > Verification).
export const DATA_VERSION = '2026.10.11';
export const VERIFIED_ON = '2026-10-11';

export const EMERGENCY_NUMBERS = [
  { id: 'police', number: '100', name_en: 'Nepal Police', name_ne: 'नेपाल प्रहरी', scope: 'national', official: true },
  { id: 'fire', number: '101', name_en: 'Fire Brigade', name_ne: 'दमकल', scope: 'national', official: true },
  { id: 'ambulance', number: '102', name_en: 'Ambulance', name_ne: 'एम्बुलेन्स', scope: 'national', official: true },
  { id: 'neoc', number: '1155', name_en: 'NEOC Disaster Ops', name_ne: 'विपद् व्यवस्थापन (NEOC)', scope: 'national', official: true },
  { id: 'apf', number: '1114', name_en: 'Armed Police Rescue', name_ne: 'सशस्त्र प्रहरी उद्धार', scope: 'national', official: true },
  { id: 'traffic', number: '103', name_en: 'Traffic Police', name_ne: 'ट्राफिक प्रहरी', scope: 'national', official: true },
  { id: 'child', number: '1098', name_en: 'Child Helpline', name_ne: 'बाल हेल्पलाइन', scope: 'national', official: true },
  { id: 'koshi-cmd', number: '021-460111', name_en: 'Koshi Emergency Command', name_ne: 'कोशी आपतकालीन कमाण्ड', scope: 'Koshi', official: true },
];

export const PLACE_CATEGORIES = [
  { id: 'hospital', en: 'Hospitals', ne: 'अस्पताल' },
  { id: 'police', en: 'Police', ne: 'प्रहरी' },
  { id: 'fire', en: 'Fire stations', ne: 'दमकल' },
  { id: 'pharmacy', en: 'Pharmacies', ne: 'औषधि पसल' },
  { id: 'transport', en: 'Bus & transit', ne: 'बस तथा यातायात' },
  { id: 'atm', en: 'ATMs', ne: 'एटीएम' },
  { id: 'hotel', en: 'Hotels & stays', ne: 'होटल' },
  { id: 'restaurant', en: 'Restaurants', ne: 'रेस्टुरेन्ट' },
  { id: 'heritage', en: 'Heritage sites', ne: 'सम्पदा' },
  { id: 'temple', en: 'Temples', ne: 'मन्दिर' },
  { id: 'lake', en: 'Lakes', ne: 'ताल' },
  { id: 'park', en: 'National parks', ne: 'निकुञ्ज' },
];
