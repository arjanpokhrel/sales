import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { NetworkProvider } from './context/NetworkContext';
import { AuthProvider } from './context/AuthContext';

import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';

import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import EmergencyPage from './pages/EmergencyPage';
import SOSPage from './pages/SOSPage';
import NearbyHelpPage from './pages/NearbyHelpPage';
import GuidesPage from './pages/GuidesPage';
import GuideDetailPage from './pages/GuideDetailPage';
import OfflinePacksPage from './pages/OfflinePacksPage';
import TransportPage from './pages/TransportPage';
import TravelModePage from './pages/TravelModePage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import WelcomePage from './pages/WelcomePage';
import ProvincesPage from './pages/ProvincesPage';
import ProvinceDetailPage from './pages/ProvinceDetailPage';
import SearchPage from './pages/SearchPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import DestinationsPage from './pages/DestinationsPage';
import DestinationDetailPage from './pages/DestinationDetailPage';
import GalleryPage from './pages/GalleryPage';
import StaysPage from './pages/StaysPage';
import BookmarksPage from './pages/BookmarksPage';
import DownloadAllPage from './pages/DownloadAllPage';
import SettingsPage from './pages/SettingsPage';
import StoragePage from './pages/StoragePage';
import AboutPage from './pages/AboutPage';
import AttributionPage from './pages/AttributionPage';
import HelpOfflinePage from './pages/HelpOfflinePage';
import { seedEssential } from './offline/db';
import { setupNative } from './native';

function FirstRunGate() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    try {
      if (!localStorage.getItem('nepready_welcomed') && location.pathname !== '/welcome') {
        navigate('/welcome', { replace: true });
      }
    } catch { /* private mode — skip gate */ }
  }, [location.pathname]);
  useEffect(() => {
    setupNative(
      () => location.pathname,
      () => navigate(-1)
    );
  }, []);
  return null;
}

export default function App() {
  useEffect(() => {
    seedEssential().catch((e) => console.warn('Essential seed failed:', e));
  }, []);

  return (
    <LanguageProvider>
      <NetworkProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-[#080E1A] text-slate-100 pb-20 lg:pb-0 font-sans">
              <FirstRunGate />
              <Header />

              <main className="flex-1">
                <Routes>
                  <Route path="/welcome" element={<WelcomePage />} />
                  <Route path="/" element={<HomePage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/places/:id" element={<PlaceDetailPage />} />
                  <Route path="/provinces" element={<ProvincesPage />} />
                  <Route path="/provinces/:id" element={<ProvinceDetailPage />} />
                  <Route path="/destinations" element={<DestinationsPage />} />
                  <Route path="/destinations/:id" element={<DestinationDetailPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/stays" element={<StaysPage />} />
                  <Route path="/bookmarks" element={<BookmarksPage />} />
                  <Route path="/download-all" element={<DownloadAllPage />} />
                  <Route path="/emergency" element={<EmergencyPage />} />
                  <Route path="/sos" element={<SOSPage />} />
                  <Route path="/help" element={<NearbyHelpPage />} />
                  <Route path="/guides" element={<GuidesPage />} />
                  <Route path="/guides/:slug" element={<GuideDetailPage />} />
                  <Route path="/packs" element={<OfflinePacksPage />} />
                  <Route path="/transport" element={<TransportPage />} />
                  <Route path="/travel" element={<TravelModePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/storage" element={<StoragePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/attribution" element={<AttributionPage />} />
                  <Route path="/help-offline" element={<HelpOfflinePage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <BottomNavigation />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </NetworkProvider>
    </LanguageProvider>
  );
}
