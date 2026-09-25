import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
  return (
    <LanguageProvider>
      <NetworkProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-[#080E1A] text-slate-100 pb-20 lg:pb-0 font-sans">
              <Header />

              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/emergency" element={<EmergencyPage />} />
                  <Route path="/sos" element={<SOSPage />} />
                  <Route path="/help" element={<NearbyHelpPage />} />
                  <Route path="/guides" element={<GuidesPage />} />
                  <Route path="/guides/:slug" element={<GuideDetailPage />} />
                  <Route path="/packs" element={<OfflinePacksPage />} />
                  <Route path="/transport" element={<TransportPage />} />
                  <Route path="/travel" element={<TravelModePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
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
