import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, PhoneCall, ShieldCheck, AlertTriangle, Users, Plus, Radio } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { useAuth } from '../context/AuthContext';
import EmergencyDialCard from '../components/EmergencyDialCard';
import { db } from '../offline/db';

export default function EmergencyPage() {
  const { lang, t } = useLanguage();
  const { isOnline } = useNetwork();
  const { user } = useAuth();

  const [services, setServices] = useState([]);
  const [personalContacts, setPersonalContacts] = useState([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        if (isOnline) {
          const res = await fetch('/api/emergency');
          const data = await res.json();
          if (data.services) {
            setServices(data.services);
          }
        } else {
          // IndexedDB
          const localServices = await db.emergency_services.toArray();
          if (localServices.length > 0) {
            setServices(localServices);
          }
        }
      } catch (err) {
        const localServices = await db.emergency_services.toArray();
        setServices(localServices);
      }

      // Load personal contacts
      const localContacts = await db.personal_contacts.toArray();
      setPersonalContacts(localContacts);
    }

    loadData();
  }, [isOnline]);

  const handleAddPersonalContact = async (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact = {
      id: `pc-${Date.now()}`,
      name: newContactName,
      phone: newContactPhone,
      relationship: 'Family',
      created_at: new Date().toISOString()
    };

    await db.personal_contacts.put(newContact);
    setPersonalContacts(prev => [...prev, newContact]);
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContact(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header & Cellular Protocol Notice */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-red-950/80 via-slate-900 to-slate-900 border border-red-800/80 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 text-xs font-black tracking-wider uppercase mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Direct Emergency Dispatch</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {t('emergency.title')}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              {t('emergency.subtitle')}
            </p>
          </div>

          <Link
            to="/sos"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-red-950 transition active:scale-95 animate-sos-pulse"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>ACTIVATE SOS MODE</span>
          </Link>
        </div>

        {/* Clear Technological Distinction Notice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-red-900/40 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="font-bold text-emerald-400 mb-0.5">📞 Cellular Network (GSM)</div>
            <p className="text-slate-400">
              One-tap calls dial standard telephone towers. Direct calling works without internet data.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="font-bold text-sky-400 mb-0.5">🛰️ Satellite GPS</div>
            <p className="text-slate-400">
              Coordinates are calculated from space satellites and work offline with clear sky view.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="font-bold text-amber-400 mb-0.5">📦 Offline Data Storage</div>
            <p className="text-slate-400">
              Verified phone numbers, guides, and routes are stored on this device in IndexedDB.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Primary 4-Button Emergency Dial Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Rapid Response Toll-Free Services</h2>
          <span className="text-xs text-slate-400">Nepal National Helplines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <EmergencyDialCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* 3. Personal Emergency Contacts (Offline Stored) */}
      <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Personal Emergency Contacts</h2>
          </div>
          <button
            onClick={() => setShowAddContact(!showAddContact)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-400 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Trusted Contact</span>
          </button>
        </div>

        {showAddContact && (
          <form onSubmit={handleAddPersonalContact} className="p-4 mb-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="Contact Name (e.g. Mother, Brother)"
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white outline-none"
                required
              />
              <input
                type="tel"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                placeholder="Phone Number (e.g. 9841xxxxxx)"
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white outline-none"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddContact(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition"
              >
                Save Contact
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {personalContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition"
            >
              <div>
                <h4 className="text-sm font-bold text-white">{contact.name}</h4>
                <p className="text-xs text-slate-400 font-mono">{contact.phone}</p>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            </div>
          ))}

          {personalContacts.length === 0 && !showAddContact && (
            <p className="text-xs text-slate-500 text-center py-4">
              No personal contacts added yet. Add family or friends for 1-tap offline calling.
            </p>
          )}
        </div>
      </section>

      {/* 4. Verification Authority Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300">Authoritative Nepal Source Verification:</strong> All emergency dispatch phone numbers are verified national lines authorized by the Ministry of Home Affairs, Nepal Police Headquarters, and Nepal Red Cross Society.
        </div>
      </div>
    </div>
  );
}
