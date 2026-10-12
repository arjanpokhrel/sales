import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  Database,
  Users,
  MapPin,
  Layers,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Lock
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, token, isAdmin } = useAuth();
  const { isOnline } = useNetwork();

  const [metrics, setMetrics] = useState(null);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('locations'); // 'locations' | 'builder' | 'overview'

  // Location form state
  const [showLocModal, setShowLocModal] = useState(false);
  const [locNameEn, setLocNameEn] = useState('');
  const [locNameNe, setLocNameNe] = useState('');
  const [locCat, setLocCat] = useState('hospital');
  const [locRegion, setLocRegion] = useState('Biratnagar');
  const [locLat, setLocLat] = useState('26.4525');
  const [locLng, setLocLng] = useState('87.2718');
  const [locPhone, setLocPhone] = useState('');
  const [locAddressEn, setLocAddressEn] = useState('');
  const [locSource, setLocSource] = useState('Nepal Red Cross Authority');

  // Pack builder state
  const [packName, setPackName] = useState('');
  const [packRegion, setPackRegion] = useState('');
  const [packProvince, setPackProvince] = useState('Koshi Province');
  const [packSize, setPackSize] = useState('45');
  const [builderSuccess, setBuilderSuccess] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      if (!token) return;
      try {
        const res = await fetch('/api/admin/metrics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
        }

        const locRes = await fetch('/api/locations');
        const locData = await locRes.json();
        setLocations(locData.locations || []);

        const catRes = await fetch('/api/locations/categories');
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      } catch (err) {
        console.warn('Failed to load admin metrics:', err);
      }
    }

    loadAdminData();
  }, [token]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Lock className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-sm text-slate-400">
          You must be logged in as an administrator to manage verified emergency data.
        </p>
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-left">
          <strong>Demo Admin Account:</strong>
          <br />
          Email: <code className="text-sky-400">admin@nepready.org.np</code>
          <br />
          Password: <code className="text-sky-400">Admin@NepaReady2026</code>
        </div>
      </div>
    );
  }

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name_en: locNameEn,
          name_ne: locNameNe || locNameEn,
          category_id: locCat,
          region: locRegion,
          latitude: parseFloat(locLat),
          longitude: parseFloat(locLng),
          phone: locPhone,
          address_en: locAddressEn,
          source: locSource
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLocations(prev => [data.location, ...prev]);
        setShowLocModal(false);
        setLocNameEn('');
        setLocNameNe('');
        setLocPhone('');
        setLocAddressEn('');
      }
    } catch (err) {
      alert('Failed to save location');
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!confirm('Are you sure you want to delete this verified location?')) return;
    try {
      const res = await fetch(`/api/admin/locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setLocations(prev => prev.filter(l => l.id !== id));
      }
    } catch (err) {
      alert('Failed to delete location');
    }
  };

  const handleBuildPack = async (e) => {
    e.preventDefault();
    if (!packName || !packRegion) return;
    try {
      const res = await fetch('/api/admin/offline-packs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: `${packName.toLowerCase()}-${packRegion.toLowerCase()}`,
          name_en: packName,
          name_ne: packName,
          region: packRegion,
          province: packProvince,
          size_mb: parseFloat(packSize),
          version: 'v1.0',
          center_latitude: 26.4525,
          center_longitude: 87.2718
        })
      });

      if (res.ok) {
        setBuilderSuccess(true);
        setPackName('');
        setPackRegion('');
      }
    } catch (err) {
      alert('Pack build failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-600/30 text-red-300 text-xs font-bold uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AUTHORITATIVE VERIFICATION CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Nepal Navigator Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Logged in as {user.name} ({user.email})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'locations' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Locations ({locations.length})
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'builder' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Pack Builder
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold mb-1">Total Users</div>
            <div className="text-2xl font-black text-white">{metrics.totalUsers}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold mb-1">Verified Locations</div>
            <div className="text-2xl font-black text-emerald-400">{metrics.verifiedLocations}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold mb-1">Active Offline Packs</div>
            <div className="text-2xl font-black text-sky-400">{metrics.activePacks}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold mb-1">Emergency Protocols</div>
            <div className="text-2xl font-black text-amber-400">{metrics.totalGuides}</div>
          </div>
        </div>
      )}

      {/* Tab 1: Locations Management */}
      {activeTab === 'locations' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Emergency & Public Location Directory</h2>
            <button
              onClick={() => setShowLocModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Verified Location</span>
            </button>
          </div>

          {/* Modal for adding new location */}
          {showLocModal && (
            <form onSubmit={handleCreateLocation} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white mb-2">New Verified Emergency Facility</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Location Name (English)"
                  value={locNameEn}
                  onChange={(e) => setLocNameEn(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Location Name (नेपाली)"
                  value={locNameNe}
                  onChange={(e) => setLocNameNe(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
                <select
                  value={locCat}
                  onChange={(e) => setLocCat(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="hospital">Hospital & Trauma</option>
                  <option value="police">Police Station</option>
                  <option value="fire">Fire Brigade</option>
                  <option value="pharmacy">24/7 Pharmacy</option>
                  <option value="transport">Bus Terminal</option>
                  <option value="government">Government Office</option>
                </select>
                <input
                  type="text"
                  placeholder="Region (e.g. Biratnagar)"
                  value={locRegion}
                  onChange={(e) => setLocRegion(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Latitude (e.g. 26.4590)"
                  value={locLat}
                  onChange={(e) => setLocLat(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Longitude (e.g. 87.2798)"
                  value={locLng}
                  onChange={(e) => setLocLng(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  required
                />
                <input
                  type="tel"
                  placeholder="Emergency Phone / Desk"
                  value={locPhone}
                  onChange={(e) => setLocPhone(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={locAddressEn}
                  onChange={(e) => setLocAddressEn(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLocModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          )}

          {/* Locations Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Facility Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Region</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-850">
                    <td className="p-3 font-bold text-white">
                      <div>{loc.name_en}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{loc.address_en}</div>
                    </td>
                    <td className="p-3 uppercase text-slate-300 font-mono">{loc.category_id}</td>
                    <td className="p-3 text-slate-300">{loc.region}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Offline Pack Builder */}
      {activeTab === 'builder' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 max-w-xl">
          <h2 className="text-lg font-bold text-white">Build & Publish New Offline Pack</h2>
          <p className="text-xs text-slate-400">
            Generates bundled offline packages containing vector geometries, verified emergency facilities, and guides for client download.
          </p>

          {builderSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 font-semibold">
              ✓ New Offline Pack published successfully!
            </div>
          )}

          <form onSubmit={handleBuildPack} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Pack Name</label>
              <input
                type="text"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                placeholder="e.g. Butwal Metro Pack"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Region</label>
              <input
                type="text"
                value={packRegion}
                onChange={(e) => setPackRegion(e.target.value)}
                placeholder="e.g. Butwal"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Province</label>
              <select
                value={packProvince}
                onChange={(e) => setPackProvince(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
              >
                <option value="Koshi Province">Koshi Province</option>
                <option value="Madhesh Province">Madhesh Province</option>
                <option value="Bagmati Province">Bagmati Province</option>
                <option value="Gandaki Province">Gandaki Province</option>
                <option value="Lumbini Province">Lumbini Province</option>
                <option value="Karnali Province">Karnali Province</option>
                <option value="Sudurpashchim Province">Sudurpashchim Province</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Estimated Size (MB)</label>
              <input
                type="number"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow transition"
              >
                Build Pack v1.0
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
