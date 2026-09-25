import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { db } from '../offline/db';
import {
  User,
  Star,
  MapPin,
  PhoneCall,
  Plus,
  Trash2,
  HardDrive,
  LogOut,
  LogIn,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function ProfilePage() {
  const { user, login, register, logout, loading: authLoading } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { downloadedPacks, coordinates } = useNetwork();

  // Auth form modal state
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  // Saved places
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [newPlaceLabel, setNewPlaceLabel] = useState('Home');
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');

  // Personal contacts
  const [contacts, setContacts] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    async function loadLocalProfileData() {
      const places = await db.saved_places.toArray();
      setSavedPlaces(places);
      const con = await db.personal_contacts.toArray();
      setContacts(con);
    }
    loadLocalProfileData();
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLoginMode) {
        await login(authEmail, authPassword);
      } else {
        await register(authName, authEmail, authPassword);
      }
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleAddPlace = async (e) => {
    e.preventDefault();
    if (!newPlaceName.trim()) return;

    const place = {
      id: `sp-${Date.now()}`,
      label: newPlaceLabel,
      custom_name: newPlaceName,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      address: newPlaceAddress || 'Current GPS coordinates',
      created_at: new Date().toISOString()
    };

    await db.saved_places.put(place);
    setSavedPlaces(prev => [...prev, place]);
    setNewPlaceName('');
    setNewPlaceAddress('');
    setShowAddPlace(false);
  };

  const handleDeletePlace = async (id) => {
    await db.saved_places.delete(id);
    setSavedPlaces(prev => prev.filter(p => p.id !== id));
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    const contact = {
      id: `pc-${Date.now()}`,
      name: contactName,
      phone: contactPhone,
      relationship: 'Family',
      created_at: new Date().toISOString()
    };

    await db.personal_contacts.put(contact);
    setContacts(prev => [...prev, contact]);
    setContactName('');
    setContactPhone('');
    setShowAddContact(false);
  };

  const handleDeleteContact = async (id) => {
    await db.personal_contacts.delete(id);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Account Profile Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-xl font-bold text-white border border-slate-700">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{user.name}</h2>
                  {user.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                <p className="text-xs text-slate-400 mt-0.5">Preferred Region: {user.preferred_region || 'Koshi'}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('profile.logout')}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                {isLoginMode ? 'Sign In to NepaReady' : 'Create an Account'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Emergency offline features work without an account. Sign in to synchronize your saved family locations across devices.
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3 max-w-md">
              {authError && (
                <div className="text-xs text-red-400 p-2.5 rounded-lg bg-red-950/40 border border-red-800">
                  {authError}
                </div>
              )}

              {!isLoginMode && (
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white outline-none focus:border-sky-500"
                  required
                />
              )}

              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white outline-none focus:border-sky-500"
                required
              />

              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white outline-none focus:border-sky-500"
                required
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-xs text-sky-400 hover:text-sky-300"
                >
                  {isLoginMode ? "Don't have an account? Register" : "Already have an account? Sign In"}
                </button>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow transition"
                >
                  {authLoading ? 'Working...' : (isLoginMode ? 'Sign In' : 'Register')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Saved Places (Section 25) */}
      <section className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">{t('profile.savedPlaces')}</h3>
          </div>
          <button
            onClick={() => setShowAddPlace(!showAddPlace)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-400 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('profile.addPlace')}</span>
          </button>
        </div>

        {showAddPlace && (
          <form onSubmit={handleAddPlace} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={newPlaceLabel}
                onChange={(e) => setNewPlaceLabel(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              >
                <option value="Home">⭐ Home (घर)</option>
                <option value="Family">⭐ Family (आफन्त)</option>
                <option value="Work">⭐ Work (कार्यालय)</option>
                <option value="Hospital">⭐ Hospital (अस्पताल)</option>
                <option value="School">⭐ School (विद्यालय)</option>
              </select>

              <input
                type="text"
                value={newPlaceName}
                onChange={(e) => setNewPlaceName(e.target.value)}
                placeholder="Place Name (e.g. My Residence)"
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                required
              />

              <input
                type="text"
                value={newPlaceAddress}
                onChange={(e) => setNewPlaceAddress(e.target.value)}
                placeholder="Address / Chowk"
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddPlace(false)}
                className="px-3 py-1.5 text-xs text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold"
              >
                Save Location
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {savedPlaces.map((place) => (
            <div
              key={place.id}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-sm">⭐</span>
                  <h4 className="text-sm font-bold text-white">{place.label}</h4>
                  <span className="text-xs text-slate-400">({place.custom_name})</span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{place.address}</span>
                </p>
              </div>
              <button
                onClick={() => handleDeletePlace(place.id)}
                className="p-2 text-slate-500 hover:text-red-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {savedPlaces.length === 0 && !showAddPlace && (
            <p className="text-xs text-slate-500 py-4 col-span-2 text-center">
              No saved places yet. Save your Home or Family address for instant offline compass directions.
            </p>
          )}
        </div>
      </section>

      {/* Personal Emergency Contacts (Section 26) */}
      <section className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">{t('profile.personalContacts')}</h3>
          </div>
          <button
            onClick={() => setShowAddContact(!showAddContact)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('profile.addContact')}</span>
          </button>
        </div>

        {showAddContact && (
          <form onSubmit={handleAddContact} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Name (e.g. Mother, Brother)"
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                required
              />
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Phone (e.g. 9842xxxxxx)"
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddContact(false)}
                className="px-3 py-1.5 text-xs text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Save Contact
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-bold text-white">{c.name}</h4>
                <p className="text-xs text-slate-400 font-mono">{c.phone}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${c.phone}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <button
                  onClick={() => handleDeleteContact(c.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {contacts.length === 0 && !showAddContact && (
            <p className="text-xs text-slate-500 py-3 text-center">
              No personal contacts added. Add trusted phone numbers to call in one tap.
            </p>
          )}
        </div>
      </section>

      {/* Installed Packs on this device */}
      <section className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-sky-400" />
          <h3 className="text-lg font-bold text-white">Downloaded Offline Packs</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {downloadedPacks.map((pack) => (
            <div
              key={pack.id}
              className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{pack.name_en}</span>
                  <span className="text-emerald-400 text-xs">✓ Downloaded</span>
                </div>
                <div className="text-xs text-slate-400">
                  {pack.region} • {pack.size_mb} MB • {pack.version}
                </div>
              </div>
            </div>
          ))}

          {downloadedPacks.length === 0 && (
            <p className="text-xs text-slate-500 py-3 col-span-2 text-center">
              No offline packs currently installed. Download Biratnagar or Kathmandu from the Offline Packs page.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
