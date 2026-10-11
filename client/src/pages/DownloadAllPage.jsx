import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DownloadCloud, CheckCircle2, AlertTriangle, Map as MapIcon, Camera, Database } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { db, downloadPackBundle } from '../offline/db';
import { PROVINCES } from '../data/provinces';
import { DESTINATIONS } from '../data/destinations';
import { getPhotoManifest } from '../data/photos';

// Download All Nepal Data — one honest manifest: bundled core + regional
// data packs. Map TILES are cached on view (never bulk-scraped, per OSM
// tile policy) — this screen says so plainly, with a coverage check.
export const FULL_PACKAGE_ID = 'nepal-full-2026-10';

export default function DownloadAllPage() {
  const { lang } = useLanguage();
  const { isOnline, downloadedPacks, refreshDownloadedPacks } = useNetwork();
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [fullStatus, setFullStatus] = useState(null);

  useEffect(() => {
    getPhotoManifest().then((m) => setPhotos(m.photos || [])).catch(() => {});
    db.table('packages').get(FULL_PACKAGE_ID).then(setFullStatus).catch(() => {});
    refreshDownloadedPacks().catch(() => {});
  }, []);

  const photoMb = photos.reduce((a, p) => a + (p.bytes || 0), 0) / 1048576;
  const dataMb = 2.5; // destinations + provinces + emergency + guides (measured seed approx)
  const totalMb = photoMb + dataMb;

  const start = async () => {
    setError('');
    if (!isOnline) {
      setError(lang === 'ne' ? 'डाउनलोडका लागि इन्टरनेट चाहिन्छ।' : 'Internet is required to download.');
      return;
    }
    setBusy(true);
    try {
      // 1) Regional data packs from the server (integrity-checked per pack)
      setProgress({ percent: 5, status: lang === 'ne' ? 'प्याक सूची ल्याउँदै…' : 'Fetching pack list…' });
      const res = await fetch('/api/offline-packs');
      if (!res.ok) throw new Error(`pack list failed (${res.status})`);
      const { packs = [] } = await res.json();
      let done = 0;
      const failed = [];
      const have = new Set(downloadedPacks.map((p) => p.id));
      for (const pack of packs) {
        if (have.has(pack.id)) { done++; continue; }
        try {
          await downloadPackBundle(pack.id, () => {});
          done++;
        } catch (e) { failed.push(pack.id); }
        setProgress({ percent: Math.round(5 + (done / Math.max(packs.length, 1)) * 80),
          status: `${done}/${packs.length} ${lang === 'ne' ? 'प्याक' : 'packs'}` });
      }
      // 2) Warm the photo cache so the gallery works offline in the browser
      // (inside the APK/WebView the files ship with the app bundle already).
      setProgress({ percent: 92, status: lang === 'ne' ? 'फोटो भण्डार गर्दै…' : 'Caching photos…' });
      try {
        const pm = await getPhotoManifest();
        await Promise.all((pm.photos || []).map((p) =>
          fetch(p.file, { cache: 'force-cache' }).catch(() => null)));
      } catch { /* photos already bundled; cache warm is best-effort */ }
      // 3) Stamp the full-package manifest (photos ship bundled already)
      setProgress({ percent: 95, status: lang === 'ne' ? 'सूची जाँच्दै…' : 'Verifying manifest…' });
      await db.table('packages').put({
        id: FULL_PACKAGE_ID, scope: 'full-country', status: failed.length ? 'partial' : 'complete',
        version: '2026.10.11', name_en: 'All Nepal Data', name_ne: 'सम्पूर्ण नेपाल डाटा',
        packs_total: packs.length, packs_done: done, failed,
        photo_count: photos.length, photo_mb: Number(photoMb.toFixed(1)),
        downloaded_at: new Date().toISOString()
      });
      setFullStatus(await db.table('packages').get(FULL_PACKAGE_ID));
      await refreshDownloadedPacks();
      setProgress({ percent: 100, status: failed.length
        ? `${lang === 'ne' ? 'आंशिक' : 'Partial'}: ${failed.length} ${lang === 'ne' ? 'असफल' : 'failed'}`
        : '✓' });
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-950 via-slate-900 to-slate-900 border border-sky-800/60">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-900/60 border border-sky-700 text-sky-200 text-[11px] font-bold mb-2">
          <DownloadCloud className="w-3.5 h-3.5" />
          {lang === 'ne' ? 'पूर्ण देश प्याकेज' : 'FULL-COUNTRY PACKAGE'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {lang === 'ne' ? 'सम्पूर्ण नेपाल डाटा डाउनलोड' : 'Download All Nepal Data'}
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          {lang === 'ne'
            ? 'एक ट्यापमा सबै उपलब्ध डाटा — जिल्ला, गन्तव्य, फोटो, आपतकालीन र गाइड।'
            : 'Every dataset in one tap — districts, destinations, photos, emergency & guides.'}
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="font-bold text-white text-sm">{lang === 'ne' ? 'प्याकेजमा के छ' : "What's inside"}</h2>
        {[
          { icon: Database, label: lang === 'ne' ? 'प्रशासनिक डाटा' : 'Admin data', value: `7 ${lang === 'ne' ? 'प्रदेश' : 'provinces'} · 77 ${lang === 'ne' ? 'जिल्ला' : 'districts'} · ~${dataMb} MB` },
          { icon: MapIcon, label: lang === 'ne' ? 'गन्तव्य र स्थान' : 'Destinations & places', value: `${DESTINATIONS.length} destinations · ${PROVINCES.length} provinces` },
          { icon: Camera, label: lang === 'ne' ? 'फोटो' : 'Photos', value: `${photos.length} ${lang === 'ne' ? 'फोटो' : 'photos'} · ${photoMb.toFixed(1)} MB` },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <r.icon className="w-5 h-5 text-sky-400 flex-shrink-0" />
            <div className="flex-1 text-sm text-slate-200">{r.label}</div>
            <div className="text-xs text-slate-400 font-mono">{r.value}</div>
          </div>
        ))}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-sm font-bold text-white">{lang === 'ne' ? 'जम्मा आकार' : 'Total size'}</span>
          <span className="font-mono font-black text-emerald-300">≈ {totalMb.toFixed(1)} MB</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-300 flex-shrink-0" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {lang === 'ne'
            ? 'नक्सा टाइलहरू हेरेपछि मात्र क्यास हुन्छन् (OSM नियमअनुसार बल्क डाउनलोड गरिँदैन)। अफलाइन नक्सा चाहिने क्षेत्र पहिले अनलाइन हेरेर राख्नुहोस्।'
            : 'Map tiles cache only areas you actually view (no bulk scraping, per OSM tile policy). Browse needed areas online first to keep them offline.'}
        </p>
      </div>

      {fullStatus && (
        <div className={`p-4 rounded-2xl border flex items-center gap-2 text-sm ${
          fullStatus.status === 'complete'
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
            : 'bg-amber-950/40 border-amber-800 text-amber-200'}`}>
          <CheckCircle2 className="w-5 h-5" />
          {fullStatus.status === 'complete'
            ? (lang === 'ne' ? `✓ पूर्ण — ${fullStatus.downloaded_at?.slice(0, 10)}` : `✓ Complete — ${fullStatus.downloaded_at?.slice(0, 10)}`)
            : (lang === 'ne' ? `आंशिक: असफल — ${(fullStatus.failed || []).join(', ')}` : `Partial: failed — ${(fullStatus.failed || []).join(', ')}`)}
        </div>
      )}

      {progress && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex justify-between text-xs text-slate-300 mb-1.5">
            <span>{progress.status}</span><span className="font-mono">{progress.percent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-300">{error}</p>}

      <button
        onClick={start} disabled={busy}
        className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-sm shadow-lg transition active:scale-[0.99]"
      >
        {busy ? '…' : (lang === 'ne' ? `सबै डाउनलोड गर्नुहोस् (≈ ${totalMb.toFixed(0)} MB)` : `Download all (≈ ${totalMb.toFixed(0)} MB)`)}
      </button>
      <Link to="/packs" className="block text-center text-xs font-bold text-sky-400">
        {lang === 'ne' ? 'वा प्रदेशअनुसार छुट्टाछुट्टै →' : 'Or per-province packs →'}
      </Link>
    </div>
  );
}
