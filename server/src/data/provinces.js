// Nepal administrative data — 7 provinces + 77 districts.
// Sources: Constitution of Nepal 2015 (provinces), Ministry of Federal Affairs
// (district lists). District names (EN) are official; Nepali names for districts
// are intentionally omitted (null) pending verification — see README.
// Province centers/bboxes are approximate map guides, NOT survey boundaries.
export const PROVINCES = [
  {
    id: 'koshi',
    name_en: 'Koshi Province',
    name_ne: 'कोशी प्रदेश',
    capital_en: 'Biratnagar',
    capital_ne: 'विराटनगर',
    capital_lat: 26.4525,
    capital_lng: 87.2718,
    center: [27.2, 87.2],
    bbox: [26.3, 86.2, 28.1, 88.2],
    districts: ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur'],
  },
  {
    id: 'madhesh',
    name_en: 'Madhesh Province',
    name_ne: 'मधेश प्रदेश',
    capital_en: 'Janakpur',
    capital_ne: 'जनकपुर',
    capital_lat: 26.7288,
    capital_lng: 85.9244,
    center: [26.9, 85.5],
    bbox: [26.3, 84.7, 27.6, 86.6],
    districts: ['Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha'],
  },
  {
    id: 'bagmati',
    name_en: 'Bagmati Province',
    name_ne: 'बागमती प्रदेश',
    capital_en: 'Hetauda',
    capital_ne: 'हेटौँडा',
    capital_lat: 27.4281,
    capital_lng: 85.0324,
    center: [27.7, 85.5],
    bbox: [27.1, 84.3, 28.3, 86.4],
    districts: ['Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok'],
  },
  {
    id: 'gandaki',
    name_en: 'Gandaki Province',
    name_ne: 'गण्डकी प्रदेश',
    capital_en: 'Pokhara',
    capital_ne: 'पोखरा',
    capital_lat: 28.2096,
    capital_lng: 83.9856,
    center: [28.3, 83.9],
    bbox: [27.6, 82.9, 29.3, 85.2],
    districts: ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun'],
  },
  {
    id: 'lumbini',
    name_en: 'Lumbini Province',
    name_ne: 'लुम्बिनी प्रदेश',
    capital_en: 'Deukhuri (Rapti Valley)',
    capital_ne: 'देउखुरी',
    capital_lat: 27.93,
    capital_lng: 82.6,
    center: [28.0, 82.5],
    bbox: [27.3, 80.9, 28.9, 83.9],
    districts: ['Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Gulmi', 'Kapilvastu', 'Nawalparasi West', 'Palpa', 'Pyuthan', 'Rolpa', 'Rukum East', 'Rupandehi'],
  },
  {
    id: 'karnali',
    name_en: 'Karnali Province',
    name_ne: 'कर्णाली प्रदेश',
    capital_en: 'Birendranagar (Surkhet)',
    capital_ne: 'वीरेन्द्रनगर',
    capital_lat: 28.6,
    capital_lng: 81.6167,
    center: [29.0, 81.9],
    bbox: [28.2, 80.9, 30.5, 83.1],
    districts: ['Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Salyan', 'Surkhet', 'Rukum West'],
  },
  {
    id: 'sudurpashchim',
    name_en: 'Sudurpashchim Province',
    name_ne: 'सुदूरपश्चिम प्रदेश',
    capital_en: 'Godawari (Kailali)',
    capital_ne: 'गोदावरी',
    capital_lat: 28.8766,
    capital_lng: 80.5779,
    center: [29.2, 80.7],
    bbox: [28.4, 80.0, 30.5, 81.9],
    districts: ['Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur'],
  },
];

export function getProvince(id) {
  return PROVINCES.find((p) => p.id === id) || null;
}

export function districtsOf(provinceId) {
  const p = getProvince(provinceId);
  return p ? p.districts : [];
}
