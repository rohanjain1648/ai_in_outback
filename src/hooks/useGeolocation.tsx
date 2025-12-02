import { useState, useEffect, useCallback } from 'react';
import { Coordinates, GeolocationError, GeolocationOptions } from '../types/location';
import { GeolocationUtils } from '../utils/geolocation';

interface UseGeolocationReturn {
  coordinates: Coordinates | null;
  error: GeolocationError | null;
  loading: boolean;
  accuracy: number | null;
  source: 'gps' | 'ip' | null;
  getCurrentLocation: () => Promise<void>;
  watchLocation: () => void;
  stopWatching: () => void;
  isWatching: boolean;
  permissionState: PermissionState | null;
}

interface UseGeolocationOptions extends GeolocationOptions {
  immediate?: boolean;
  watch?: boolean;
  fallbackToIP?: boolean;
}

export const useGeolocation = (options: UseGeolocationOptions = {}): UseGeolocationReturn => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [source, setSource] = useState<'gps' | 'ip' | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);

  const {
    immediate = false,
    watch = false,
    fallbackToIP = true,
    ...geolocationOptions
  } = options;

  // Check permission state
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const state = await GeolocationUtils.requestPermission();
        setPermissionState(state);
      } catch (error) {
        console.warn('Could not check geolocation permission:', error);
      }
    };

    checkPermission();
  }, []);

  const getCurrentLocation = useCallback(async () => {
    if (!GeolocationUtils.isGeolocationAvailable() && !fallbackToIP) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (fallbackToIP) {
        const result = await GeolocationUtils.getLocationWithFallback(geolocationOptions);
        setCoordinates(result.coordinates);
        setSource(result.source);
        setAccuracy(result.accuracy || null);
      } else {
        const coords = await GeolocationUtils.getCurrentPosition(geolocationOptions);
        setCoordinates(coords);
        setSource('gps');
        setAccuracy(10); // Assume good accuracy for GPS
      }
    } catch (err) {
      const geolocationError = err as GeolocationError;
      setError(geolocationError);
      setCoordinates(null);
      setSource(null);
      setAccuracy(null);
    } finally {
      setLoading(false);
    }
  }, [geolocationOptions, fallbackToIP]);

  const watchLocation = useCallback(() => {
    if (!GeolocationUtils.isGeolocationAvailable()) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
      return;
    }

    if (isWatching) {
      return; // Already watching
    }

    setError(null);
    setIsWatching(true);

    const id = GeolocationUtils.watchPosition(
      (coords) => {
        setCoordinates(coords);
        setSource('gps');
        setAccuracy(10);
        setError(null);
      },
      (err) => {
        setError(err);
        setIsWatching(false);
        setWatchId(null);
      },
      geolocationOptions
    );

    if (id !== null) {
      setWatchId(id);
    } else {
      setIsWatching(false);
    }
  }, [geolocationOptions, isWatching]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      GeolocationUtils.clearWatch(watchId);
      setWatchId(null);
      setIsWatching(false);
    }
  }, [watchId]);

  // Auto-start location detection if immediate is true
  useEffect(() => {
    if (immediate) {
      getCurrentLocation();
    }
  }, [immediate, getCurrentLocation]);

  // Auto-start watching if watch is true
  useEffect(() => {
    if (watch) {
      watchLocation();
    }

    return () => {
      if (watch && watchId !== null) {
        GeolocationUtils.clearWatch(watchId);
      }
    };
  }, [watch, watchLocation, watchId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        GeolocationUtils.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    coordinates,
    error,
    loading,
    accuracy,
    source,
    getCurrentLocation,
    watchLocation,
    stopWatching,
    isWatching,
    permissionState
  };
};

export default useGeolocation;