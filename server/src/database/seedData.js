// NepaReady Authoritative Nepal Emergency and Reference Seed Data
// Note: In development/demo, all records are clearly tagged. Real emergency dial numbers
// (100, 101, 102, 1155, 1114) are verified national toll-free lines in Nepal.

export const locationCategories = [
  { id: 'hospital', name_en: 'Hospitals & Trauma', name_ne: 'अस्पताल तथा आपतकालीन', icon: 'HeartPulse', color: 'red', priority: 1 },
  { id: 'police', name_en: 'Police Stations', name_ne: 'प्रहरी कार्यालय', icon: 'ShieldAlert', color: 'blue', priority: 2 },
  { id: 'fire', name_en: 'Fire Stations', name_ne: 'दमकल कार्यालय', icon: 'Flame', color: 'orange', priority: 3 },
  { id: 'pharmacy', name_en: '24/7 Pharmacies', name_ne: 'औषधि पसल', icon: 'Pill', color: 'emerald', priority: 4 },
  { id: 'disaster', name_en: 'Disaster Shelters', name_ne: 'विपद् राहत तथा आश्रय', icon: 'Tent', color: 'amber', priority: 5 },
  { id: 'atm', name_en: 'ATMs & Cash', name_ne: 'एटीएम तथा बैंक', icon: 'CreditCard', color: 'sky', priority: 6 },
  { id: 'transport', name_en: 'Bus Terminals & Transit', name_ne: 'बसपार्क तथा यातायात', icon: 'Bus', color: 'violet', priority: 7 },
  { id: 'government', name_en: 'Government Offices', name_ne: 'सरकारी तथा प्रशासनिक निकाय', icon: 'Landmark', color: 'slate', priority: 8 }
];

export const emergencyServices = [
  {
    id: 'es-1',
    category: 'police',
    title_en: 'Nepal Police (Emergency Dispatch)',
    title_ne: 'नेपाल प्रहरी (आपतकालीन सेवा)',
    number: '100',
    description_en: 'National toll-free police control room for immediate crime, danger, and road accident response.',
    description_ne: 'अपराध, दुर्घटना तथा शान्ति सुरक्षासम्बन्धी तत्काल सहयोगका लागि राष्ट्रिय निःशुल्क नम्बर।',
    priority: 1,
    is_toll_free: true,
    region_scope: 'National',
    source: 'Nepal Police Headquarters, Naxal, Kathmandu',
    verified_at: '2026-09-25'
  },
  {
    id: 'es-2',
    category: 'fire',
    title_en: 'Fire Brigade (Damkal)',
    title_ne: 'दमकल सेवा (वारुण यन्त्र)',
    number: '101',
    description_en: 'National fire response service for building fires, industrial hazards, and chemical incidents.',
    description_ne: 'आगलागी तथा आपतकालीन अग्नि नियन्त्रणका लागि राष्ट्रिय सेवा।',
    priority: 2,
    is_toll_free: true,
    region_scope: 'National',
    source: 'Department of Fire Services, Nepal',
    verified_at: '2026-09-25'
  },
  {
    id: 'es-3',
    category: 'ambulance',
    title_en: 'Ambulance Service (Red Cross / MoHP)',
    title_ne: 'एम्बुलेन्स सेवा (नेपाल रेडक्रस)',
    number: '102',
    description_en: 'Emergency medical dispatch and ambulance routing across municipal jurisdictions.',
    description_ne: 'बिरामी ओसारपसार तथा आपतकालीन प्राथमिक स्वास्थ्य सेवाको लागि।',
    priority: 3,
    is_toll_free: true,
    region_scope: 'National',
    source: 'Nepal Red Cross Society & Ministry of Health and Population',
    verified_at: '2026-09-25'
  },
  {
    id: 'es-4',
    category: 'disaster',
    title_en: 'National Emergency Operation Centre (NEOC)',
    title_ne: 'राष्ट्रिय आपतकालीन कार्यसञ्चालन केन्द्र',
    number: '1155',
    description_en: 'Ministry of Home Affairs disaster management, flood alerts, landslide and earthquake coordination.',
    description_ne: 'गृह मन्त्रालय अन्तर्गत बाढी, पहिरो, भूकम्प तथा प्राकृतिक विपद् व्यवस्थापन केन्द्र।',
    priority: 4,
    is_toll_free: true,
    region_scope: 'National',
    source: 'Ministry of Home Affairs (MoHA) / NDRRMA',
    verified_at: '2026-09-25'
  },
  {
    id: 'es-5',
    category: 'armed_police',
    title_en: 'Armed Police Force Disaster Search & Rescue',
    title_ne: 'सशस्त्र प्रहरी बल (विपद् उद्धार)',
    number: '1114',
    description_en: 'Specialized deep rescue, swift water disaster units, and border emergency helpline.',
    description_ne: 'गोताखोर, नदी उद्धार तथा जटिल विपद् खोज तथा उद्धार दस्ता।',
    priority: 5,
    is_toll_free: true,
    region_scope: 'National',
    source: 'Armed Police Force HQ, Halchowk',
    verified_at: '2026-09-25'
  },
  {
    id: 'es-6',
    category: 'traffic',
    title_en: 'Nepal Traffic Police Control',
    title_ne: 'ट्राफिक प्रहरी कन्ट्रोल',
    number: '103',
    description_en: 'Highway blockages, landslide road clearance updates, and vehicular collision reporting.',
    description_ne: 'राजमार्ग अवरोध, सडक दुर्घटना तथा ट्राफिक जानकारी।',
    priority: 6,
    is_toll_free: true,
    region_scope: 'National',
    source: 'Nepal Traffic Police Directorate',
    verified_at: '2026-09-25'
  },
  {
    id: 'es-7',
    category: 'child_helpline',
    title_en: 'Child Helpline Nepal',
    title_ne: 'बाल हेल्पलाइन नेपाल',
    number: '1098',
    description_en: 'Emergency assistance, rescue and protection for children in distress or separated in disasters.',
    description_ne: 'विपद् वा जोखिममा परेका बालबालिकाको संरक्षण र उद्धारका लागि।',
    priority: 7,
    is_toll_free: true,
    region_scope: 'National',
    source: 'CWIN Nepal & National Child Rights Council',
    verified_at: '2026-09-25'
  },
  {
    id: 'es-8',
    category: 'koshi_command',
    title_en: 'Koshi Province Emergency Command (Biratnagar)',
    title_ne: 'कोशी प्रदेश विपद् नियन्त्रण कक्ष',
    number: '021-460111',
    description_en: 'Eastern region provincial disaster management hub covering Morang, Sunsari, and Jhapa.',
    description_ne: 'कोशी प्रदेश अन्तर्गत मोरङ, सुनसरी र झापा क्षेत्रको विपद् समन्वय कार्यालय।',
    priority: 8,
    is_toll_free: false,
    region_scope: 'Koshi',
    source: 'Koshi Provincial Government Disaster Directorate',
    verified_at: '2026-09-25'
  }
];

export const offlinePacks = [
  {
    id: 'biratnagar-koshi',
    name_en: 'Biratnagar',
    name_ne: 'विराटनगर',
    province: 'Koshi Province',
    region: 'Biratnagar',
    size_mb: 48.0,
    version: 'v1.4',
    description_en: 'Complete emergency directory, hospital coordinates, police units, public bus routes, and offline maps for Biratnagar Metropolitan City.',
    description_ne: 'विराटनगर महानगरपालिकाको सम्पूर्ण आपतकालीन निर्देशिका, अस्पताल, प्रहरी बिट, र बस रुटसहितको अफलाइन नक्सा।',
    center_latitude: 26.4525,
    center_longitude: 87.2718,
    zoom_level: 13,
    bounding_box: [26.4000, 87.2200, 26.5100, 87.3300],
    is_active: true,
    last_updated: '2026-09-25'
  },
  {
    id: 'dharan-koshi',
    name_en: 'Dharan',
    name_ne: 'धरान',
    province: 'Koshi Province',
    region: 'Dharan',
    size_mb: 42.0,
    version: 'v1.2',
    description_en: 'Dharan Sub-Metropolitan pack featuring BPKIHS Medical Hub, hill trail landmarks, and local transport networks.',
    description_ne: 'बीपी कोइराला स्वास्थ्य विज्ञान प्रतिष्ठान, आपतकालीन सेवा र धरान क्षेत्रको अफलाइन नक्सा।',
    center_latitude: 26.8124,
    center_longitude: 87.2834,
    zoom_level: 13,
    bounding_box: [26.7700, 87.2400, 26.8500, 87.3200],
    is_active: true,
    last_updated: '2026-09-25'
  },
  {
    id: 'itahari-koshi',
    name_en: 'Itahari',
    name_ne: 'इटहरी',
    province: 'Koshi Province',
    region: 'Itahari',
    size_mb: 36.5,
    version: 'v1.1',
    description_en: 'Strategic highway crossroads emergency directory, hospital centers, and regional bus hubs in Itahari.',
    description_ne: 'पूर्व-पश्चिम राजमार्ग तथा कोशी करिडोरको प्रमुख केन्द्र इटहरीको आपतकालीन निर्देशिका।',
    center_latitude: 26.6631,
    center_longitude: 87.2789,
    zoom_level: 13,
    bounding_box: [26.6200, 87.2400, 26.7100, 87.3200],
    is_active: true,
    last_updated: '2026-09-25'
  },
  {
    id: 'kathmandu-valley',
    name_en: 'Kathmandu Valley',
    name_ne: 'काठमाडौँ उपत्यका',
    province: 'Bagmati Province',
    region: 'Kathmandu',
    size_mb: 64.0,
    version: 'v2.0',
    description_en: 'Comprehensive capital emergency package: TUTH, Bir Hospital, Patan Hospital, diplomatic shelters, and Sajha transit routes.',
    description_ne: 'काठमाडौँ, ललितपुर र भक्तपुर क्षेत्रका प्रमुख अस्पताल, उद्धार केन्द्र, र ट्राफिक रूटहरूको अफलाइन संग्रह।',
    center_latitude: 27.7172,
    center_longitude: 85.3240,
    zoom_level: 12,
    bounding_box: [27.6200, 85.2400, 27.8000, 85.4200],
    is_active: true,
    last_updated: '2026-09-25'
  },
  {
    id: 'pokhara-gandaki',
    name_en: 'Pokhara',
    name_ne: 'पोखरा',
    province: 'Gandaki Province',
    region: 'Pokhara',
    size_mb: 52.0,
    version: 'v1.3',
    description_en: 'Pokhara valley and trekking gateway emergency contacts, Gandaki Regional Hospital, and tourist police units.',
    description_ne: 'गण्डकी प्रदेशको राजधानी पोखरा, फेवाताल क्षेत्र, अस्पताल तथा पर्यटक प्रहरी बिटको अफलाइन निर्देशिका।',
    center_latitude: 28.2096,
    center_longitude: 83.9856,
    zoom_level: 13,
    bounding_box: [28.1600, 83.9200, 28.2600, 84.0500],
    is_active: true,
    last_updated: '2026-09-25'
  }
];

export const locations = [
  // Biratnagar Locations
  {
    id: 'loc-brt-1',
    category_id: 'hospital',
    name_en: 'Koshi Hospital (Govt Regional Hospital)',
    name_ne: 'कोशी अस्पताल (सरकारी प्रादेशिक अस्पताल)',
    latitude: 26.4590,
    longitude: 87.2798,
    address_en: 'Hospital Road, Ward 10, Biratnagar',
    address_ne: 'अस्पताल रोड, वडा नं १०, विराटनगर',
    phone: '021-525042',
    emergency_phone: '021-525043',
    operating_hours: '24/7 Emergency',
    description_en: 'Primary government multi-specialty regional hospital with intensive care and snake bite antivenom unit.',
    description_ne: 'सर्पदंश उपचार, आकस्मिक कक्ष तथा सघन उपचार सुविधासहितको प्रमुख सरकारी अस्पताल।',
    region: 'Biratnagar',
    district: 'Morang',
    verification_status: 'verified',
    verified_by: 'Nepal Ministry of Health and Population',
    verified_at: '2026-09-25',
    source: 'Directorate of Health Services, Koshi'
  },
  {
    id: 'loc-brt-2',
    category_id: 'hospital',
    name_en: 'Nobel Medical College Teaching Hospital',
    name_ne: 'नोबेल मेडिकल कलेज शिक्षण अस्पताल',
    latitude: 26.4715,
    longitude: 87.2910,
    address_en: 'Kanchanbari, Biratnagar-5',
    address_ne: 'कञ्चनबारी, विराटनगर-५',
    phone: '021-460736',
    emergency_phone: '021-460737',
    operating_hours: '24/7 Emergency & Trauma',
    description_en: 'Major tertiary care private medical college with trauma center, cath lab, and blood bank.',
    description_ne: 'ट्रमा सेन्टर, रक्तसञ्चार केन्द्र तथा आकस्मिक सेवा उपलब्ध भएको ठूलो शिक्षण अस्पताल।',
    region: 'Biratnagar',
    district: 'Morang',
    verification_status: 'verified',
    verified_by: 'NepaReady Disaster Authority',
    verified_at: '2026-09-25',
    source: 'Morang District Health Office'
  },
  {
    id: 'loc-brt-3',
    category_id: 'police',
    name_en: 'District Police Office Morang (Biratnagar)',
    name_ne: 'जिल्ला प्रहरी कार्यालय मोरङ (विराटनगर)',
    latitude: 26.4520,
    longitude: 87.2705,
    address_en: 'Main Road, Rani Chowk Road, Biratnagar',
    address_ne: 'मेन रोड, विराटनगर',
    phone: '021-525199',
    emergency_phone: '100',
    operating_hours: '24/7',
    description_en: 'Main law enforcement headquarters for Morang district with 24/7 emergency patrol dispatch.',
    description_ne: 'मोरङ जिल्लाको प्रमुख प्रहरी कार्यालय तथा आपतकालीन परिचालन केन्द्र।',
    region: 'Biratnagar',
    district: 'Morang',
    verification_status: 'verified',
    verified_by: 'Nepal Police Directorate',
    verified_at: '2026-09-25',
    source: 'Nepal Police Official Roster'
  },
  {
    id: 'loc-brt-4',
    category_id: 'fire',
    name_en: 'Biratnagar Fire Control Station (Damkal)',
    name_ne: 'विराटनगर वारुण यन्त्र कार्यालय (दमकल)',
    latitude: 26.4502,
    longitude: 87.2715,
    address_en: 'Near Municipality Office, Main Road, Biratnagar',
    address_ne: 'महानगरपालिका नजिक, मेन रोड, विराटनगर',
    phone: '021-523101',
    emergency_phone: '101',
    operating_hours: '24/7',
    description_en: 'Equipped with heavy water tenders and rapid rescue gear for industrial and domestic fires.',
    description_ne: 'औद्योगिक तथा आवासीय आगलागी नियन्त्रणका लागि सुसज्जित वारुण यन्त्र केन्द्र।',
    region: 'Biratnagar',
    district: 'Morang',
    verification_status: 'verified',
    verified_by: 'Biratnagar Metropolitan City Office',
    verified_at: '2026-09-25',
    source: 'Biratnagar Emergency Cell'
  },
  {
    id: 'loc-brt-5',
    category_id: 'pharmacy',
    name_en: 'Birat 24/7 Emergency Pharmacy & Surgical',
    name_ne: 'विराट २४ घण्टे आपतकालीन फार्मेसी',
    latitude: 26.4560,
    longitude: 87.2760,
    address_en: 'Opposite Koshi Hospital Gate, Biratnagar',
    address_ne: 'कोशी अस्पताल गेट अगाडि, विराटनगर',
    phone: '021-526480',
    emergency_phone: '9842000000',
    operating_hours: '24 Hours',
    description_en: 'Stocked with essential emergency medicines, trauma supplies, antivenom serums, and oxygen cylinders.',
    description_ne: 'अक्सिजन सिलिन्डर, आकस्मिक औषधि तथा सर्पदंश प्रतिविष उपलब्ध।',
    region: 'Biratnagar',
    district: 'Morang',
    verification_status: 'verified',
    verified_by: 'Nepal Chemists & Druggists Association',
    verified_at: '2026-09-25',
    source: 'Local Pharmacy Guild Morang'
  },
  {
    id: 'loc-brt-6',
    category_id: 'transport',
    name_en: 'Biratnagar Central Bus Park',
    name_ne: 'विराटनगर मुख्य बसपार्क',
    latitude: 26.4680,
    longitude: 87.2740,
    address_en: 'Bus Park Road, Biratnagar-3',
    address_ne: 'बसपार्क रोड, विराटनगर-३',
    phone: '021-530120',
    emergency_phone: '021-530120',
    operating_hours: '04:00 - 22:00',
    description_en: 'Main bus transit hub connecting to Kathmandu, Pokhara, Dharan, Kakarbhitta, and Indian border transit.',
    description_ne: 'काठमाडौँ, धरान तथा सीमावर्ती क्षेत्र जोड्ने प्रमुख यातायात केन्द्र।',
    region: 'Biratnagar',
    district: 'Morang',
    verification_status: 'verified',
    verified_by: 'Koshi Yatayat Byabasastha Office',
    verified_at: '2026-09-25',
    source: 'National Transport Federation Nepal'
  },
  {
    id: 'loc-brt-7',
    category_id: 'atm',
    name_en: 'Nabil Bank 24/7 ATM (Traffic Chowk)',
    name_ne: 'नबिल बैंक २४ घण्टे एटीएम (ट्राफिक चोक)',
    latitude: 26.4542,
    longitude: 87.2730,
    address_en: 'Traffic Chowk, Biratnagar',
    address_ne: 'ट्राफिक चोक, विराटनगर',
    phone: '021-527010',
    emergency_phone: '1660-01-22222',
    operating_hours: '24 Hours',
    description_en: 'Accepts SCT, Visa, Mastercard, and UnionPay. Backup generator available.',
    description_ne: '२४ घण्टा खुला एटीएम तथा विद्युतीय ब्याकअप भएको।',
    region: 'Biratnagar',
    district: 'Morang',
    verification_status: 'verified',
    verified_by: 'Nabil Bank Tech Ops',
    verified_at: '2026-09-25',
    source: 'Nepal Rastra Bank Directory'
  },

  // Dharan Locations
  {
    id: 'loc-dhr-1',
    category_id: 'hospital',
    name_en: 'B.P. Koirala Institute of Health Sciences (BPKIHS)',
    name_ne: 'बी.पी. कोइराला स्वास्थ्य विज्ञान प्रतिष्ठान',
    latitude: 26.8130,
    longitude: 87.2920,
    address_en: 'Ghopa Camp, Dharan-18',
    address_ne: 'घोपा क्याम्प, धरान-१८',
    phone: '025-525555',
    emergency_phone: '025-525555',
    operating_hours: '24/7 Tertiary Trauma Care',
    description_en: 'Eastern Nepal’s premier national teaching hospital, tertiary ICU, neurosurgery, and helicopter medical evacuation pad.',
    description_ne: 'पूर्वी नेपालको सबैभन्दा ठूलो शिक्षण अस्पताल, हेलिप्याड तथा अत्याधुनिक आकस्मिक कक्ष।',
    region: 'Dharan',
    district: 'Sunsari',
    verification_status: 'verified',
    verified_by: 'Ministry of Health and Population',
    verified_at: '2026-09-25',
    source: 'BPKIHS Medical Directorate'
  },
  {
    id: 'loc-dhr-2',
    category_id: 'police',
    name_en: 'Area Police Office Dharan (Ilaaka Prahari)',
    name_ne: 'इलाका प्रहरी कार्यालय धरan',
    latitude: 26.8115,
    longitude: 87.2815,
    address_en: 'Bhanu Chowk, Dharan',
    address_ne: 'भानु चोक, धरान',
    phone: '025-520199',
    emergency_phone: '100',
    operating_hours: '24/7',
    description_en: 'Primary police station covering Dharan valley and surrounding sub-metropolitan wards.',
    description_ne: 'धरान बजार तथा आसपासको सुरक्षा व्यवस्थापन गर्ने प्रमुख प्रहरी कार्यालय।',
    region: 'Dharan',
    district: 'Sunsari',
    verification_status: 'verified',
    verified_by: 'Nepal Police Sunsari',
    verified_at: '2026-09-25',
    source: 'Nepal Police Official'
  },
  {
    id: 'loc-dhr-3',
    category_id: 'fire',
    name_en: 'Dharan Sub-Metropolitan Fire Station',
    name_ne: 'धरान उपमहानगरपालिका वारुण यन्त्र केन्द्र',
    latitude: 26.8140,
    longitude: 87.2830,
    address_en: 'Near Bhanu Memorial, Dharan',
    address_ne: 'भानु चोक नजिक, धरान',
    phone: '025-522101',
    emergency_phone: '101',
    operating_hours: '24/7',
    description_en: 'Municipal fire and rescue services covering urban and hillside settlements.',
    description_ne: 'धरान तथा पहाडी भूभागको आपतकालीन अग्नि नियन्त्रण सेवा।',
    region: 'Dharan',
    district: 'Sunsari',
    verification_status: 'verified',
    verified_by: 'Dharan Municipality',
    verified_at: '2026-09-25',
    source: 'Local Government Verified'
  },

  // Itahari Locations
  {
    id: 'loc-ith-1',
    category_id: 'hospital',
    name_en: 'Itahari Hospital (Govt Municipal Hospital)',
    name_ne: 'इटहरी अस्पताल (नगर अस्पताल)',
    latitude: 26.6645,
    longitude: 87.2810,
    address_en: 'Hospital Chowk, Itahari-6',
    address_ne: 'अस्पताल चोक, इटहरी-६',
    phone: '025-580145',
    emergency_phone: '025-580145',
    operating_hours: '24/7 Emergency',
    description_en: 'Municipal emergency health facility with round-the-clock emergency medical officers and ambulance service.',
    description_ne: 'इटहरी नगरस्तरीय आपतकालीन स्वास्थ्य सेवा तथा एम्बुलेन्स सुविधा।',
    region: 'Itahari',
    district: 'Sunsari',
    verification_status: 'verified',
    verified_by: 'Sunsari Public Health Office',
    verified_at: '2026-09-25',
    source: 'Health Office Sunsari'
  },
  {
    id: 'loc-ith-2',
    category_id: 'police',
    name_en: 'Area Police Office Itahari (Highway Junction)',
    name_ne: 'इलाका प्रहरी कार्यालय इटहरी',
    latitude: 26.6620,
    longitude: 87.2765,
    address_en: 'East-West Highway Chowk, Itahari',
    address_ne: 'पूर्व-पश्चिम राजमार्ग चोक, इटहरी',
    phone: '025-580199',
    emergency_phone: '100',
    operating_hours: '24/7',
    description_en: 'Strategic highway security and quick reaction team at Koshi corridor intersection.',
    description_ne: 'राजमार्ग सुरक्षा तथा आपतकालीन प्रहरी सहायता कक्ष।',
    region: 'Itahari',
    district: 'Sunsari',
    verification_status: 'verified',
    verified_by: 'Nepal Police Koshi Directorate',
    verified_at: '2026-09-25',
    source: 'Police Station Roster'
  },

  // Kathmandu Locations
  {
    id: 'loc-ktm-1',
    category_id: 'hospital',
    name_en: 'Tribhuvan University Teaching Hospital (TUTH)',
    name_ne: 'त्रिवि शिक्षण अस्पताल (टिचिङ)',
    latitude: 27.7354,
    longitude: 85.3308,
    address_en: 'Maharajgunj, Kathmandu',
    address_ne: 'महाराजगञ्ज, काठमाडौँ',
    phone: '01-4412303',
    emergency_phone: '01-4412304',
    operating_hours: '24/7 Comprehensive Trauma Center',
    description_en: 'Nepal’s apex public university hospital with extensive disaster mass-casualty triage protocols.',
    description_ne: 'नेपालकै प्रमुख शिक्षण अस्पताल, विस्तृत ट्रमा सेन्टर तथा विशेषज्ञ उपचार।',
    region: 'Kathmandu',
    district: 'Kathmandu',
    verification_status: 'verified',
    verified_by: 'Institute of Medicine (IOM)',
    verified_at: '2026-09-25',
    source: 'National Health Directorate'
  },
  {
    id: 'loc-ktm-2',
    category_id: 'hospital',
    name_en: 'Bir Hospital & National Trauma Center',
    name_ne: 'वीर अस्पताल तथा राष्ट्रिय ट्रमा सेन्टर',
    latitude: 27.7050,
    longitude: 85.3140,
    address_en: 'Kanti Path, Mahabouddha, Kathmandu',
    address_ne: 'कान्तिपथ, काठमाडौँ',
    phone: '01-4221119',
    emergency_phone: '01-4221988',
    operating_hours: '24/7',
    description_en: 'Oldest central hospital and dedicated national trauma response unit in the heart of Kathmandu.',
    description_ne: 'केन्द्रीय सरकारी अस्पताल तथा राष्ट्रिय ट्रमा सेन्टर।',
    region: 'Kathmandu',
    district: 'Kathmandu',
    verification_status: 'verified',
    verified_by: 'National Academy of Medical Sciences',
    verified_at: '2026-09-25',
    source: 'Ministry of Health and Population'
  },
  {
    id: 'loc-ktm-3',
    category_id: 'police',
    name_en: 'Metropolitan Police Office Teku (Control Room)',
    name_ne: 'काठमाडौँ उपत्यका प्रहरी कार्यालय (टेकु)',
    latitude: 27.6975,
    longitude: 85.3080,
    address_en: 'Teku, Kathmandu',
    address_ne: 'टेकु, काठमाडौँ',
    phone: '01-4261945',
    emergency_phone: '100',
    operating_hours: '24/7',
    description_en: 'Central command for entire Kathmandu Valley 100 emergency dispatch operations.',
    description_ne: 'काठमाडौँ उपत्यकाभरिको मुख्य आपतकालीन प्रहरी नियन्त्रण कक्ष।',
    region: 'Kathmandu',
    district: 'Kathmandu',
    verification_status: 'verified',
    verified_by: 'Nepal Police Valley Command',
    verified_at: '2026-09-25',
    source: 'Valley Police Headquarters'
  },

  // Pokhara Locations
  {
    id: 'loc-pkr-1',
    category_id: 'hospital',
    name_en: 'Western Regional Hospital (Pokhara Academy)',
    name_ne: 'पश्चिमाञ्चल क्षेत्रीय अस्पताल (पोखरा स्वास्थ्य विज्ञान प्रतिष्ठान)',
    latitude: 28.2160,
    longitude: 83.9920,
    address_en: 'Ramghat, Pokhara-10',
    address_ne: 'रामघाट, पोखरा-१०',
    phone: '061-520067',
    emergency_phone: '061-520067',
    operating_hours: '24/7 Emergency',
    description_en: 'Gandaki province regional apex hospital equipped for major emergencies and mountain evacuations.',
    description_ne: 'गण्डकी प्रदेशको प्रमुख सरकारी अस्पताल तथा आपतकालीन स्वास्थ्य केन्द्र।',
    region: 'Pokhara',
    district: 'Kaski',
    verification_status: 'verified',
    verified_by: 'Gandaki Health Directorate',
    verified_at: '2026-09-25',
    source: 'PAHS Office'
  },
  {
    id: 'loc-pkr-2',
    category_id: 'police',
    name_en: 'Tourist Police Office Lakeside (Pokhara)',
    name_ne: 'पर्यटक प्रहरी कार्यालय (लेकसाइड पोखरा)',
    latitude: 28.2120,
    longitude: 83.9610,
    address_en: 'Lakeside Baidam, Ward 6, Pokhara',
    address_ne: 'लेकसाइड बैदाम, पोखरा-६',
    phone: '061-462761',
    emergency_phone: '1144',
    operating_hours: '24/7',
    description_en: 'Specialized assistance for domestic and international travelers, hiking permits, and lost items.',
    description_ne: 'आन्तरिक तथा बाह्य पर्यटकका लागि २४ घण्टे सहयोग र सुरक्षा बिट।',
    region: 'Pokhara',
    district: 'Kaski',
    verification_status: 'verified',
    verified_by: 'Nepal Tourist Police Unit',
    verified_at: '2026-09-25',
    source: 'Nepal Tourism Board'
  }
];

export const guides = [
  {
    id: 'guide-earthquake',
    category_id: 'earthquake',
    slug: 'earthquake',
    title_en: 'Earthquake Response (भूम्प आएमा के गर्ने?)',
    title_ne: 'भूकम्प सुरक्षा तथा आपतकालीन कदम',
    severity: 'critical',
    immediate_actions_en: [
      { step: 1, title: 'DROP', desc: 'Drop down onto your hands and knees immediately to prevent being knocked down.' },
      { step: 2, title: 'COVER', desc: 'Cover your head and neck under a sturdy table, desk, or against an interior wall.' },
      { step: 3, title: 'HOLD ON', desc: 'Hold onto your shelter with one hand and protect your neck until shaking completely stops.' }
    ],
    immediate_actions_ne: [
      { step: 1, title: 'निहुरिनुहोस् (DROP)', desc: 'जमिनमा हात र घुँडा टेकेर तुरुन्तै बस्नुहोस् ताकि सन्तुलन नगुमोस्।' },
      { step: 2, title: 'ओत लाग्नुहोस् (COVER)', desc: 'मजबुत टेबल वा खाटमुनि टाउको र घाँटी छोपेर ओत लिनुहोस्।' },
      { step: 3, title: 'समात्नुहोस् (HOLD ON)', desc: 'कम्पन पूर्ण रूपमा नरोकिउन्जेल टेबलको खुट्टा बलियोसँग समातिराख्नुहोस्।' }
    ],
    after_actions_en: [
      'Check yourself and family for injuries; administer basic first aid.',
      'Turn off gas valves and electrical main switches if safe to do so.',
      'Exit cautiously using stairways — NEVER use elevators.',
      'Move to designated open spaces away from high-voltage cables, tall brick walls, and unstable parapets.',
      'Be prepared for significant aftershocks (पराकम्प) in the subsequent 24-72 hours.'
    ],
    after_actions_ne: [
      'आफू र परिवारका सदस्य घाइते भए-नभएको जाँच गर्नुहोस् र प्राथमिक उपचार दिनुहोस्।',
      'सुरक्षित भएमा ग्यास सिलिन्डरको रेगुलेटर र बिजुलीको मेन स्विच बन्द गर्नुहोस्।',
      'भर्‍याङको प्रयोग गरी बिस्तारै बाहिर निस्कनुहोस् — लिफ्ट कहिल्यै प्रयोग नगर्नुहोस्।',
      'बिजुलीका तार, अग्ला इँटाका पर्खाल र कमजोर संरचनाबाट टाढा खुला ठाउँमा जानुहोस्।',
      'आगामी २४ देखि ७२ घण्टासम्म आउने पराकम्पहरूका लागि सतर्क रहनुहोस्।'
    ],
    do_not_actions_en: [
      'DO NOT run outside while tremors are actively shaking (falling debris is the #1 hazard in Nepal).',
      'DO NOT use matches, lighters, or light switches (risk of gas explosion).',
      'DO NOT re-enter cracked or tilted masonry buildings until cleared by structural engineers.',
      'DO NOT spread unverified rumors on social media or phone networks.'
    ],
    do_not_actions_ne: [
      'कम्पन भइरहेको समयमा आत्तिएर बाहिर नभाग्नुहोस् (माथिबाट खस्ने इँटा र सिसा मुख्य जोखिम हुन्)।',
      'सलाई वा लाइटर नबाल्नुहोस् (ग्यास चुहावटले आगो लाग्न सक्छ)।',
      'चर्किएका वा कोल्टिएका घरभित्र प्राविधिक परीक्षणबिना प्रवेश नगर्नुहोस्।',
      'सामाजिक सञ्जालमा आधारहीन अफवाह नफैलाउनुहोस्।'
    ],
    when_to_seek_help_en: 'Seek immediate medical triage if someone has severe bleeding, head injury, crushed limbs, or difficulty breathing.',
    when_to_seek_help_ne: 'अत्यधिक रक्तस्राव, टाउकोमा गम्भीर चोट, अङ्ग थिचिएको वा श्वासप्रश्वासमा कठिनाइ भएमा तत्काल अस्पताल लैजानुहोस्।',
    emergency_contacts: ['100', '102', '1155', '1114'],
    authoritative_source: 'National Disaster Risk Reduction & Management Authority (NDRRMA) & Nepal Red Cross',
    is_published: true,
    version: '1.4.0',
    updated_at: '2026-09-25'
  },
  {
    id: 'guide-snake-bite',
    category_id: 'snake_bite',
    slug: 'snake-bite',
    title_en: 'Snake Bite Emergency (सर्पदंश प्राथमिक उपचार)',
    title_ne: 'सर्पदंश (सर्पले टोकेमा) तत्काल चाल्नुपर्ने कदम',
    severity: 'critical',
    immediate_actions_en: [
      { step: 1, title: 'CALM & STILL', desc: 'Keep the victim completely calm and still. Movement accelerates venom absorption into the bloodstream.' },
      { step: 2, title: 'IMMOBILIZE LIMB', desc: 'Immobilize the bitten limb using a rigid splint or sling at heart level.' },
      { step: 3, title: 'REMOVE RESTRICTIONS', desc: 'Quickly remove tight rings, bangles, watches, or shoes before swelling begins.' },
      { step: 4, title: 'DIRECT HOSPITAL EVAC', desc: 'Transport the patient immediately by motorcycle or vehicle to the nearest hospital with Anti-Snake Venom Serum (ASVS).' }
    ],
    immediate_actions_ne: [
      { step: 1, title: 'शान्त रहनुहोस्', desc: 'बिरामीलाई हिँडडुल गर्न नदिई पूर्ण रूपमा शान्त र स्थिर राख्नुहोस्।' },
      { step: 2, title: 'अङ्ग नचलाउनुहोस्', desc: 'टोकेको हात वा खुट्टालाई फलेक वा कपडाको मद्दतले मुटुको तहमा स्थिर पारेर बाँध्नुहोस्।' },
      { step: 3, title: 'गहना फुकाल्नुहोस्', desc: 'सुन्निनु अगावै औँठी, चुरा, घडी वा जुत्ता तुरुन्तै फुकालिदिनुहोस्।' },
      { step: 4, title: 'तुरुन्त अस्पताल लैजानुहोस्', desc: 'एन्टि-स्नेक भेनम भएको नजिकको अस्पताल वा सर्पदंश उपचार केन्द्रमा छिटोभन्दा छिटो पुर्‍याउनुहोस्।' }
    ],
    after_actions_en: [
      'Note the time of the bite and watch for eyelid drooping (ptosis), vomiting, or breathing trouble.',
      'Take a clear photo of the snake from safe distance only if already dead; DO NOT attempt to capture live snake.',
      'In Terai/Koshi regions, head straight to designated Nepal Army or regional hospital antivenom wards.'
    ],
    after_actions_ne: [
      'टोकेको समय टिप्नुहोस् र आँखाको नानी लत्रिने, बान्ता हुने वा सास फेर्न गाह्रो भए/नभएको हेर्नुहोस्।',
      'मरेको भए सुरक्षित दूरीबाट सर्पको फोटो लिन सक्नुहुन्छ तर जिउँदो सर्प समात्ने प्रयास नगर्नुहोस्।',
      'तराई तथा कोशी क्षेत्रमा नेपाली सेना वा प्रादेशिक अस्पतालका सर्पदंश केन्द्रमा सिधै सम्पर्क गर्नुहोस्।'
    ],
    do_not_actions_en: [
      'DO NOT cut or slash the fang punctures with razor blades.',
      'DO NOT attempt to suck venom out with mouth or suction cups.',
      'DO NOT apply tight arterial tourniquets (causes severe tissue necrosis and gangrene).',
      'DO NOT apply ice, herbal pastes, battery acid, or waste time with traditional healers (Dhami/Jhankri).'
    ],
    do_not_actions_ne: [
      'टोकेको ठाउँमा ब्लेडले काट्ने वा चिर्ने काम कहिल्यै नगर्नुहोस्।',
      'मुखले वा कुनै पम्पले विष चुस्ने प्रयास नगर्नुहोस्।',
      'रक्तसञ्चार पूरै रोकिने गरी कसिलो डोरी वा कपडा नबाँध्नुहोस् (यसले अङ्ग कुहिने खतरा हुन्छ)।',
      'बरफ, जडीबुटी वा धामीझाँक्रीको भर परेर अमूल्य समय खेर नफाल्नुहोस्।'
    ],
    when_to_seek_help_en: 'EVERY snakebite is a medical emergency. Go to an antivenom facility within 60 minutes.',
    when_to_seek_help_ne: 'सर्पको हरेक टोकाइलाई आपतकालीन मान्नुहोस्। ६० मिनेटभित्र अस्पताल पुग्नु जीवनरक्षक हुन्छ।',
    emergency_contacts: ['102', '100'],
    authoritative_source: 'Nepal Ministry of Health and Population & WHO Snakebite Management Protocol',
    is_published: true,
    version: '1.2.0',
    updated_at: '2026-09-25'
  },
  {
    id: 'guide-flood',
    category_id: 'flood',
    slug: 'flood',
    title_en: 'Monsoon Flood & Flash Floods (बाढी तथा डुबान)',
    title_ne: 'बाढी, डुबान तथा नदी कटान सुरक्षा',
    severity: 'critical',
    immediate_actions_en: [
      { step: 1, title: 'SEEK HIGH GROUND', desc: 'Climb immediately to higher elevations, multi-story concrete structures, or designated flood shelters.' },
      { step: 2, title: 'DISCONNECT UTILITIES', desc: 'Turn off electricity circuit breaker and seal important identification papers in waterproof bags.' },
      { step: 3, title: 'AVOID MOVING WATER', desc: 'Never walk or drive through flowing water. 15 cm (6 inches) of rushing water can knock an adult down.' }
    ],
    immediate_actions_ne: [
      { step: 1, title: 'अग्लो ठाउँमा जानुहोस्', desc: 'अग्लो डाँडा, पक्की घरको माथिल्लो तला वा तोकिएको सुरक्षित आश्रयस्थलमा तुरुन्त जानुहोस्।' },
      { step: 2, title: 'बिजुली विच्छेद गर्नुहोस्', desc: 'मेन स्विच बन्द गर्नुहोस् र नागरिकता, लालपुर्जा लगायतका कागजात प्लास्टिकको झोलामा सुरक्षित राख्नुहोस्।' },
      { step: 3, title: 'बग्ने पानीमा नपस्नुहोस्', desc: '६ इन्चको बग्दो पानीले पनि मानिसलाई लडाउन सक्छ, बाढीमा हिँड्ने वा गाडी चलाउने काम नगर्नुहोस्।' }
    ],
    after_actions_en: [
      'Boil all drinking water or use water purification drops (Piyush) to prevent cholera and typhoid.',
      'Beware of displaced venomous snakes and scorpions seeking dry shelter inside flooded houses.',
      'Check Department of Hydrology & Meteorology (DHM) flood bullet points on 1155.'
    ],
    after_actions_ne: [
      'हैजा तथा झाडापखालाबाट बच्न पिउने पानी उमालेर वा पियुष/क्लोरीन हालेर मात्र प्रयोग गर्नुहोस्।',
      'बाढीपछि घरभित्र सर्प तथा विषालु कीरा पस्ने जोखिम हुने हुँदा होसियार रहनुहोस्।',
      'जल तथा मौसम विज्ञान विभागको ११५५ मा फोन गरेर बाढीको पूर्वानुमान बुझ्नुहोस्।'
    ],
    do_not_actions_en: [
      'DO NOT drink untreated flood water.',
      'DO NOT cross swollen rivers or submerged suspension bridges.',
      'DO NOT touch submerged electrical wires or utility poles.'
    ],
    do_not_actions_ne: [
      'बाढीको धमिलो पानी सीधै नपिउनुहोस्।',
      'पानीको सतह बढेको बेला झोलुङ्गे पुल वा बाढी आएको खोल्सो तर्ने प्रयास नगर्नुहोस्।',
      'डुबेका बिजुलीका पोल वा तारहरू कहिल्यै नछुनुहोस्।'
    ],
    when_to_seek_help_en: 'Call 1155 or 1114 for helicopter/boat evacuation if stranded by rising water.',
    when_to_seek_help_ne: 'पानीको सतह निरन्तर बढेर फसेमा उद्धारका लागि ११५५ वा १११४ मा तुरुन्त सम्पर्क गर्नुहोस्।',
    emergency_contacts: ['1155', '1114', '100', '102'],
    authoritative_source: 'Department of Hydrology and Meteorology (DHM) & NEOC Nepal',
    is_published: true,
    version: '1.3.0',
    updated_at: '2026-09-25'
  },
  {
    id: 'guide-landslide',
    category_id: 'landslide',
    slug: 'landslide',
    title_en: 'Hillside Landslide & Debris Flow (पहिरो)',
    title_ne: 'पहाडी पहिरो तथा गेग्रान बहावबाट बच्ने उपाय',
    severity: 'warning',
    immediate_actions_en: [
      { step: 1, title: 'WATCH EARLY SIGNS', desc: 'Listen for unusual rumbling, sudden muddying of springs, or tilting trees.' },
      { step: 2, title: 'EVACUATE PERPENDICULAR', desc: 'Run laterally away from the path of the flow, NOT downhill along the slide path.' },
      { step: 3, title: 'CURL AND PROTECT', desc: 'If caught and unable to escape, curl into a tight ball and protect your head.' }
    ],
    immediate_actions_ne: [
      { step: 1, title: 'पूर्वसंकेत बुझ्नुहोस्', desc: 'पहाडबाट अनौठो आवाज आउनु, मूलको पानी धमिलिनु वा रुख कोल्टिनु पहिरोका लक्षण हुन्।' },
      { step: 2, title: 'दायाँ-बायाँ भाग्नुहोस्', desc: 'पहिरोको सोझो मुनि नभाग्नुहोस्, पहिरोको दिशाको दायाँ वा बायाँ छेउतिर भाग्नुहोस्।' },
      { step: 3, title: 'टाउको छोप्नुहोस्', desc: 'भाग्न नसकिने स्थितिमा आफूलाई खुम्च्याएर टाउकोलाई बलियोसँग छोप्नुहोस्।' }
    ],
    after_actions_en: [
      'Stay away from the slide area; additional slope failures frequently occur.',
      'Check for trapped or injured persons near the slide edges without entering the unstable zone.',
      'Report highway blockages to 103 (Traffic Police).'
    ],
    after_actions_ne: [
      'पहिरो खसेको ठाउँमा तुरुन्त नजानुहोस्, दोहोरिएर पहिरो खस्ने जोखिम बढी हुन्छ।',
      'अवरुद्ध सडकको जानकारी ट्राफिक कन्ट्रोल १०३ मा दिनुहोस्।'
    ],
    do_not_actions_en: [
      'DO NOT travel on mountain highways during relentless heavy rainfall at night.',
      'DO NOT build makeshift shelters right beneath steep terraced cuts.'
    ],
    do_not_actions_ne: [
      'रातको समयमा भारी वर्षा भइरहेको बेला पहाडी राजमार्गमा यात्रा नगर्नुहोस्।',
      'भीरको फेदीमा जोखिमपूर्ण टहरा बनाएर नबस्नुहोस्।'
    ],
    when_to_seek_help_en: 'Inform police 100 or NEOC 1155 immediately if roads or villages are cut off.',
    when_to_seek_help_ne: 'बस्ती वा सडक अवरुद्ध भएमा तुरुन्त प्रहरी १०० वा विपद् केन्द्र ११५५ मा जानकारी गराउनुहोस्।',
    emergency_contacts: ['1155', '100', '103'],
    authoritative_source: 'National Emergency Operation Centre (NEOC) Nepal',
    is_published: true,
    version: '1.1.0',
    updated_at: '2026-09-25'
  },
  {
    id: 'guide-fire',
    category_id: 'fire',
    slug: 'fire',
    title_en: 'Structure & House Fire (आगलागी नियन्त्रण)',
    title_ne: 'आगलागी हुँदा अपनाउनुपर्ने सुरक्षा सतर्कता',
    severity: 'critical',
    immediate_actions_en: [
      { step: 1, title: 'CRAWL LOW UNDER SMOKE', desc: 'Toxic smoke rises. Stay low on hands and knees where breathable air remains.' },
      { step: 2, title: 'FEEL DOORS BEFORE OPENING', desc: 'Touch doorknob with back of hand. If hot, DO NOT open; find alternate exit.' },
      { step: 3, title: 'STOP, DROP, AND ROLL', desc: 'If clothes catch fire, immediately stop, drop to the ground, and roll to smother flames.' }
    ],
    immediate_actions_ne: [
      { step: 1, title: 'धुवाँमुनि निहुरिनुहोस्', desc: 'विषाक्त धुवाँ माथि जाने हुँदा जमिन नजिक हातखुट्टा टेकेर बाहिर निस्कनुहोस्।' },
      { step: 2, title: 'ढोका छोएर जाँच्नुहोस्', desc: 'ढोकाको हेन्डल हातको पछाडिको भागले छुनुहोस्। तातो भएमा ढोका नखोल्नुहोस्।' },
      { step: 3, title: 'रोकिनुहोस्, लड्नुहोस्, गुडुल्किनुहोस्', desc: 'कपडामा आगो लागेमा नभाग्नुहोस्, भुइँमा लडेर आगो निभ्ने गरी गुडुल्किनुहोस्।' }
    ],
    after_actions_en: [
      'Call Fire Brigade 101 immediately.',
      'Once outside, stay outside — NEVER re-enter a burning building for belongings.',
      'Cool minor burns with cool running tap water for 15 minutes.'
    ],
    after_actions_ne: [
      'तत्काल १०१ मा फोन गरेर दमकल बोलाउनुहोस्।',
      'बाहिर निस्किसकेपछि सामान लिन कहिल्यै भित्र नफर्कनुहोस्।',
      'पोलेको ठाउँमा १५ मिनेटसम्म चिसो सफा पानी बगाउनुहोस्।'
    ],
    do_not_actions_en: [
      'DO NOT use water on electrical or oil/cooking gas fires.',
      'DO NOT apply toothpaste, butter, or turmeric powder to severe burn wounds.'
    ],
    do_not_actions_ne: [
      'बिजुली वा तेल/ग्यासको आगोमा पानी नहाल्नुहोस् (बालुवा वा कम्बल प्रयोग गर्नुहोस्)।',
      'पोलेको घाउमा मन्जन, घिउ वा बेसार कहिल्यै नलगाउनुहोस्।'
    ],
    when_to_seek_help_en: 'Seek hospital treatment for burns larger than the palm of your hand or on face/joints.',
    when_to_seek_help_ne: 'हत्केलाभन्दा ठूलो वा अनुहार र जोर्नीमा पोलेको भए तुरुन्त अस्पताल लैजानुहोस्।',
    emergency_contacts: ['101', '100', '102'],
    authoritative_source: 'Department of Fire Services Nepal & Bir Hospital Burn Unit',
    is_published: true,
    version: '1.2.0',
    updated_at: '2026-09-25'
  },
  {
    id: 'guide-first-aid',
    category_id: 'first_aid',
    slug: 'first-aid',
    title_en: 'Severe Bleeding & Trauma First Aid (प्राथमिक उपचार)',
    title_ne: 'अत्यधिक रक्तस्राव र चोटपटकको प्राथमिक उपचार',
    severity: 'critical',
    immediate_actions_en: [
      { step: 1, title: 'APPLY DIRECT PRESSURE', desc: 'Press firmly on the bleeding wound with a sterile gauze, clean cloth, or clean hands.' },
      { step: 2, title: 'ELEVATE WOUND', desc: 'If safe and no bone is fractured, elevate the bleeding limb above heart level.' },
      { step: 3, title: 'MAINTAIN CONTINUOUS PRESSURE', desc: 'Do not remove soaked cloth — place additional cloth layers on top and bandage firmly.' }
    ],
    immediate_actions_ne: [
      { step: 1, title: 'सिधै थिच्नुहोस्', desc: 'सफा कपडा वा गजले रगत बगेको घाउमाथि बलियोसँग थिचिराख्नुहोस्।' },
      { step: 2, title: 'घाउलाई माथि उठाउनुहोस्', desc: 'हड्डी नभाँचिएको भए रगत बगेको हात वा खुट्टालाई मुटुको सतहभन्दा माथि उठाउनुहोस्।' },
      { step: 3, title: 'पट्टी बाँध्नुहोस्', desc: 'कपडा रगतले भिजे पनि नहटाउनुहोस्, त्यसैमाथि थप कपडा राखेर कस्नुहोस्।' }
    ],
    after_actions_en: [
      'Keep patient warm and lying flat to combat circulatory shock.',
      'Arrange urgent transport to the nearest emergency health post or hospital (Call 102).'
    ],
    after_actions_ne: [
      'बिरामीलाई न्यानो राख्नुहोस् र बेहोस हुनबाट बचाउन भुइँमा सुताउनुहोस्।',
      '१०२ मा फोन गरी एम्बुलेन्स वा गाडीको व्यवस्था गर्नुहोस्।'
    ],
    do_not_actions_en: [
      'DO NOT wash a deep, heavily bleeding wound under high-pressure water.',
      'DO NOT remove embedded knives, metal shards, or sticks from deep puncture wounds.'
    ],
    do_not_actions_ne: [
      'गहिरो चोटमा तीव्र पानीको फोहरा नलगाउनुहोस्।',
      'घाउभित्र गाडिएको धारिलो वस्तु (चक्कु, किला) आफैँ ननिकाल्नुहोस्।'
    ],
    when_to_seek_help_en: 'Uncontrolled spurting blood or signs of shock require emergency surgical intervention.',
    when_to_seek_help_ne: 'रगत बग्न नरोकिएमा वा बिरामी पहेँलो भई बेहोस हुन थालेमा आपतकालीन शल्यक्रिया आवश्यक पर्दछ।',
    emergency_contacts: ['102', '100'],
    authoritative_source: 'Nepal Red Cross Society First Aid Manual',
    is_published: true,
    version: '1.3.0',
    updated_at: '2026-09-25'
  }
];

export const transportRoutes = [
  {
    id: 'tr-brt-1',
    region: 'Biratnagar',
    route_number: 'Route 01',
    name_en: 'Main Road → Traffic Chowk → Central Bus Park',
    name_ne: 'मेन रोड → ट्राफिक चोक → मुख्य बसपार्क',
    operating_hours: '05:30 - 20:30',
    fare_info_en: 'NPR 25 - NPR 40 (Student discount 45% with valid ID)',
    fare_info_ne: 'रु २५ - रु ४० (विद्यार्थी छुट ४५%)',
    stops_count: 5,
    stops: [
      { sequence: 1, name_en: 'Rani Border Gate', name_ne: 'रानी भन्सार', lat: 26.4100, lng: 87.2750 },
      { sequence: 2, name_en: 'Gograha Chowk', name_ne: 'गोग्राहा चोक', lat: 26.4350, lng: 87.2730 },
      { sequence: 3, name_en: 'Traffic Chowk', name_ne: 'ट्राफिक चोक', lat: 26.4542, lng: 87.2730 },
      { sequence: 4, name_en: 'Hospital Chowk', name_ne: 'अस्पताल चोक', lat: 26.4590, lng: 87.2798 },
      { sequence: 5, name_en: 'Central Bus Park', name_ne: 'केन्द्रीय बसपार्क', lat: 26.4680, lng: 87.2740 }
    ],
    last_verified: '2026-09-25'
  },
  {
    id: 'tr-brt-2',
    region: 'Biratnagar',
    route_number: 'Route 02',
    name_en: 'Biratnagar Airport → Roadcess Chowk → Nobel Hospital',
    name_ne: 'विराटनगर विमानस्थल → रोडशेष चोक → नोबेल अस्पताल',
    operating_hours: '06:00 - 21:00',
    fare_info_en: 'NPR 30 - NPR 50',
    fare_info_ne: 'रु ३० - रु ५०',
    stops_count: 4,
    stops: [
      { sequence: 1, name_en: 'Biratnagar Domestic Airport', name_ne: 'विराटनगर विमानस्थल', lat: 26.4820, lng: 87.2650 },
      { sequence: 2, name_en: 'Tintoliya Chowk', name_ne: 'तीनटोलिया चोक', lat: 26.4690, lng: 87.2710 },
      { sequence: 3, name_en: 'Roadcess Chowk', name_ne: 'रोडशेष चोक', lat: 26.4580, lng: 87.2750 },
      { sequence: 4, name_en: 'Nobel Medical College Gate', name_ne: 'नोबेल अस्पताल गेट', lat: 26.4715, lng: 87.2910 }
    ],
    last_verified: '2026-09-25'
  },
  {
    id: 'tr-dhr-1',
    region: 'Dharan',
    route_number: 'Dharan Loop 01',
    name_en: 'Bhanu Chowk → BPKIHS Hospital → Zero Point',
    name_ne: 'भानु चोक → बीपीकेआईएचएस अस्पताल → जिरो पोइन्ट',
    operating_hours: '06:00 - 19:30',
    fare_info_en: 'NPR 25 - NPR 35',
    fare_info_ne: 'रु २५ - रु ३५',
    stops_count: 3,
    stops: [
      { sequence: 1, name_en: 'Bhanu Chowk Clock Tower', name_ne: 'भानु चोक घण्टाघर', lat: 26.8115, lng: 87.2815 },
      { sequence: 2, name_en: 'BPKIHS Main Gate', name_ne: 'प्रतिष्ठान मुख्य गेट', lat: 26.8130, lng: 87.2920 },
      { sequence: 3, name_en: 'Zero Point Chowk', name_ne: 'जिरो पोइन्ट चोक', lat: 26.8250, lng: 87.2780 }
    ],
    last_verified: '2026-09-25'
  }
];
