import React, { useState, useEffect } from 'react';
import { MapPin, AlertCircle, CheckCircle, Loader, X } from 'lucide-react';
import {
  getCurrentLocation,
  isWithinDeliveryRadius,
  calculateDistance,
  getAddressFromLocation,
  storeUserLocation,
  getStoredUserLocation,
  type Location,
  type LocationPermissionResult
} from '../services/locationService';
import { getRestaurantCoordinates, getDeliveryRadius } from '../config/locationConfig';
import Button from './ui/Button';

interface LocationCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationVerified: (location: Location, distance: number, address: string) => void;
  onLocationDenied: (error: string) => void;
}

const LocationCheckModal: React.FC<LocationCheckModalProps> = ({
  isOpen,
  onClose,
  onLocationVerified,
  onLocationDenied
}) => {
  const [status, setStatus] = useState<'checking' | 'requesting' | 'success' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');
  const [distance, setDistance] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      checkStoredLocation();
    }
  }, [isOpen]);

  const checkStoredLocation = async () => {
    const stored = getStoredUserLocation();
    if (stored) {
      const dist = calculateDistance(stored, getRestaurantCoordinates());
      if (isWithinDeliveryRadius(stored)) {
        setDistance(dist);
        setStatus('success');
        
        // Get address for display
        try {
          const addr = await getAddressFromLocation(stored);
          setAddress(addr);
          onLocationVerified(stored, dist, addr);
        } catch (error) {
          console.error('Error getting address:', error);
          onLocationVerified(stored, dist, 'Address not available');
        }
      } else {
        const errorMsg = `Sorry, we only deliver within ${getDeliveryRadius()}km of our restaurant. You are ${dist.toFixed(1)}km away.`;
        setError(errorMsg);
        setStatus('error');
        onLocationDenied(errorMsg);
      }
    } else {
      setStatus('requesting');
    }
  };

  const requestLocation = async () => {
    setStatus('requesting');
    setError(null);

    try {
      const result: LocationPermissionResult = await getCurrentLocation();
      
      if (result.granted && result.location) {
        const dist = calculateDistance(result.location, getRestaurantCoordinates());
        
        if (isWithinDeliveryRadius(result.location)) {
          // Store the location for future use
          storeUserLocation(result.location);
          
          setDistance(dist);
          setStatus('success');
          
          // Get address
          try {
            const addr = await getAddressFromLocation(result.location);
            setAddress(addr);
            onLocationVerified(result.location, dist, addr);
          } catch (error) {
            console.error('Error getting address:', error);
            onLocationVerified(result.location, dist, 'Address not available');
          }
        } else {
          const errorMsg = `Sorry, we only deliver within ${getDeliveryRadius()}km of our restaurant. You are ${dist.toFixed(1)}km away.`;
          setError(errorMsg);
          setStatus('error');
          onLocationDenied(errorMsg);
        }
      } else {
        setError(result.error || 'Location access denied');
        setStatus('error');
        onLocationDenied(result.error || 'Location access denied');
      }
    } catch (error) {
      const errorMsg = 'Failed to get your location. Please try again.';
      setError(errorMsg);
      setStatus('error');
      onLocationDenied(errorMsg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Location Required for Delivery</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === 'checking' && (
          <div className="text-center py-8">
            <Loader className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Checking stored location...</p>
          </div>
        )}

        {status === 'requesting' && (
          <div className="text-center py-8">
            <div className="bg-orange-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Enable Location Access</h3>
            <p className="text-gray-600 mb-6">
              We need your location to calculate delivery fees and ensure we can deliver to your area.
            </p>
            <Button onClick={requestLocation} className="w-full mb-4">
              Allow Location Access
            </Button>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                Please allow location access when prompted by your browser.
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8">
            <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Location Verified!</h3>
            <p className="text-gray-600 mb-4">
              Great! We can deliver to your location.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Distance:</span>
                <span className="font-medium">{distance.toFixed(1)} km</span>
              </div>
              {address && (
                <div className="flex items-start justify-between text-sm mt-2">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium text-right ml-2">{address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-8">
            <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Location Access Required</h3>
            <p className="text-red-600 mb-6">{error}</p>
            
            {error?.includes('deliver within') ? (
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-700">
                  Consider pickup instead, or we're working to expand our delivery area!
                </p>
              </div>
            ) : (
              <>
                <Button onClick={requestLocation} className="w-full mb-4">
                  Try Again
                </Button>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    Make sure to allow location access in your browser settings.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationCheckModal;