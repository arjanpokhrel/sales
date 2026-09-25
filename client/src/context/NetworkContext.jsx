import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../offline/db';

const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  // Real network state
  const [isBrowserOnline, setIsBrowserOnline] = useState(navigator.onLine);
  const [isServerReachable, setIsServerReachable] = useState(true);

  // Presentation / Demo simulated offline switch
  const [simulateOffline, setSimulateOffline] = useState(false);

  // Downloaded packs tracker for "Offline Ready" state
  const [downloadedPacks, setDownloadedPacks] = useState([]);
  const [activePack, setActivePack] = useState(null);

  // GPS state
  const [gpsStatus, setGpsStatus] = useState('requesting'); // 'available', 'unavailable', 'requesting'
  const [coordinates, setCoordinates] = useState({
    latitude: 26.4525, // Biratnagar default center
    longitude: 87.2718,
    accuracy: 15,
    altitude: null,
    isRealGps: false
  });

  // Check health endpoint for real network egress
  const checkServerReachability = useCallback(async () => {
    if (simulateOffline) {
      setIsServerReachable(false);
      return false;
    }
    if (!navigator.onLine) {
      setIsServerReachable(false);
      return false;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('/api/health', { signal: controller.signal });
      clearTimeout(timeoutId);
      const reachable = res.ok;
      setIsServerReachable(reachable);
      return reachable;
    } catch (e) {
      setIsServerReachable(false);
      return false;
    }
  }, [simulateOffline]);

  // Load downloaded packs from Dexie IndexedDB
  const refreshDownloadedPacks = useCallback(async () => {
    try {
      const packs = await db.offline_packs.toArray();
      setDownloadedPacks(packs);
      if (packs.length > 0) {
        setActivePack(packs[0]);
      } else {
        setActivePack(null);
      }
    } catch (err) {
      console.warn('Failed to read downloaded packs from IndexedDB:', err);
    }
  }, []);

  // Watch network events
  useEffect(() => {
    const handleOnline = () => {
      setIsBrowserOnline(true);
      checkServerReachability();
    };
    const handleOffline = () => {
      setIsBrowserOnline(false);
      setIsServerReachable(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkServerReachability();
    refreshDownloadedPacks();

    // Periodic heartbeat every 20 seconds
    const interval = setInterval(() => {
      checkServerReachability();
    }, 20000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkServerReachability, refreshDownloadedPacks]);

  // Track GPS Geolocation
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('unavailable');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy || 10),
          altitude: position.coords.altitude ? Math.round(position.coords.altitude) : null,
          isRealGps: true
        });
        setGpsStatus('available');
      },
      (error) => {
        console.warn('GPS location access notice:', error.message);
        setGpsStatus('unavailable');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Compute composite connection state: 'online' | 'offline-ready' | 'offline'
  const isOnline = !simulateOffline && isBrowserOnline && isServerReachable;
  const hasOfflinePacks = downloadedPacks.length > 0;

  let connectionStatus = 'offline';
  if (isOnline) {
    connectionStatus = 'online';
  } else if (hasOfflinePacks) {
    connectionStatus = 'offline-ready';
  }

  // Toggle simulated offline for demo purposes
  const toggleSimulateOffline = () => {
    setSimulateOffline(prev => {
      const next = !prev;
      if (next) {
        setIsServerReachable(false);
      } else {
        setTimeout(checkServerReachability, 200);
      }
      return next;
    });
  };

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        connectionStatus, // 'online' | 'offline' | 'offline-ready'
        gpsStatus, // 'available' | 'unavailable' | 'requesting'
        coordinates,
        simulateOffline,
        toggleSimulateOffline,
        downloadedPacks,
        activePack,
        refreshDownloadedPacks
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider');
  return ctx;
}
