import React, { useState, useEffect } from 'react';
import { MapPin, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import {
  getCurrentLocation,
  isWithinDeliveryRadius,
  calculateDistance,
  getAddressFromLocation,
  storeUserLocation,
  getStoredUserLocation,
  RESTAURANT_LOCATION,
  DELIVERY_RADIUS_KM,
  type Location,
  type LocationPermissionResult
} from '../services/locationService';

interface LocationPermissionProps {
  onLocationVerified: (location: Location, distance: number) => void;
  onLocationDenied: (error: string) => void;
}

const LocationPermission: React.FC<LocationPermissionProps> = ({
  onLocationVerified,
  onLocationDenied
}) => {
  const [status, setStatus] = useState<'checking' | 'requesting' | 'success' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');
  const [distance, setDistance] = useState<number>(0);

  useEffect(() => {
    checkStoredLocation();
  }, []);

  const checkStoredLocation = async () => {
    const stored = getStoredUserLocation();
    if (stored) {
      const dist = calculateDistance(stored, RESTAURANT_LOCATION);
      if (isWithinDeliveryRadius(stored)) {
        setDistance(dist);
        setStatus('success');
        onLocationVerified(stored, dist);
        
        // Get address for display
        try {
          const addr = await getAddressFromLocation(stored);
          setAddress(addr);
        } catch (error) {
          console.error('Error getting address:', error);
        }
      } else {
        // Stored location is outside radius, request new location
        requestLocation();
      }
    } else {
      requestLocation();
    }
  };

  const requestLocation = async () => {
    setStatus('requesting');
    setError('');

    try {
      const result: LocationPermissionResult = await getCurrentLocation();
      
      if (!result.granted || !result.location) {
        setStatus('error');
        setError(result.error || 'Location access denied');
        onLocationDenied(result.error || 'Location access denied');
        return;
      }

      const userLoc = result.location;
      const dist = calculateDistance(userLoc, RESTAURANT_LOCATION);
      
      setDistance(dist);

      if (isWithinDeliveryRadius(userLoc)) {
        setStatus('success');
        storeUserLocation(userLoc);
        onLocationVerified(userLoc, dist);
        
        // Get address for display
        try {
          const addr = await getAddressFromLocation(userLoc);
          setAddress(addr);
        } catch (error) {
          console.error('Error getting address:', error);
        }
      } else {
        setStatus('error');
        const errorMsg = `Sorry, we only deliver within ${DELIVERY_RADIUS_KM}km of our restaurant. You are ${dist.toFixed(1)}km away.`;
        setError(errorMsg);
        onLocationDenied(errorMsg);
      }
    } catch (err) {
      setStatus('error');
      const errorMsg = 'Failed to get your location. Please try again.';
      setError(errorMsg);
      onLocationDenied(errorMsg);
    }
  };

  const handleRetry = () => {
    requestLocation();
  };

  if (status === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Checking Location</h2>
          <p className="text-gray-600">Please wait while we verify your delivery area...</p>
        </div>
      </div>
    );
  }

  if (status === 'requesting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Location Required</h2>
          <p className="text-gray-600 mb-4">
            We need your location to check if you're within our {DELIVERY_RADIUS_KM}km delivery radius.
          </p>
          <p className="text-sm text-gray-500">
            Please allow location access when prompted by your browser.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Location Verified!</h2>
          <p className="text-gray-600 mb-4">
            Great! You're within our delivery area.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">Your location:</p>
            <p className="text-sm font-medium text-gray-800">{address || 'Getting address...'}</p>
            <p className="text-xs text-gray-500 mt-1">
              Distance: {distance.toFixed(1)}km from restaurant
            </p>
          </div>
          <p className="text-sm text-green-600">
            Redirecting to menu...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Location Access Required</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          
          {error?.includes('deliver within') ? (
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">
                We currently serve customers within {DELIVERY_RADIUS_KM}km of our restaurant in Colombo.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
              <p className="text-xs text-gray-500">
                Make sure to allow location access in your browser settings.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default LocationPermission;