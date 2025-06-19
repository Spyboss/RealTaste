import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { deliveryApi } from '../services/api';
import { ApiResponse } from '../types/shared';

interface DeliveryAddressInputProps {
  address: string;
  onAddressChange: (address: string) => void;
  coordinates: { lat: number; lng: number } | null;
  onCoordinatesChange: (coords: { lat: number; lng: number } | null) => void;
  gpsLocation: string;
  onGpsLocationChange: (location: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  customerGpsLocation: string;
  onCustomerGpsLocationChange: (location: string) => void;
  deliveryFee: number;
  isWithinRange: boolean;
  onDeliveryFeeChange: (fee: number) => void;
  onRangeStatusChange: (isWithinRange: boolean) => void;
}

interface DeliveryCalculation {
  isWithinRange: boolean;
  distance: number;
  deliveryFee: number;
  estimatedTime: number;
}

const DeliveryAddressInput: React.FC<DeliveryAddressInputProps> = ({
  address,
  onAddressChange,
  coordinates,
  onCoordinatesChange,
  gpsLocation,
  onGpsLocationChange,
  notes,
  onNotesChange,
  customerGpsLocation,
  onCustomerGpsLocationChange,
  onDeliveryFeeChange,
  onRangeStatusChange
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [deliveryCalculation, setDeliveryCalculation] = useState<DeliveryCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate delivery fee when coordinates change or address is entered
  useEffect(() => {
    if (coordinates && coordinates.lat && coordinates.lng) {
      calculateDeliveryFee(coordinates.lat, coordinates.lng);
    } else if (address.trim()) {
      // If address is entered but no GPS coordinates, get standard fee
      getStandardDeliveryFee();
    } else {
      setDeliveryCalculation(null);
    }
  }, [coordinates, address]);

  const calculateDeliveryFee = async (lat: number, lng: number) => {
    setIsCalculating(true);
    try {
      const response = await deliveryApi.calculateFee(lat, lng) as ApiResponse<DeliveryCalculation>;
      if (response.success && response.data) {
        setDeliveryCalculation(response.data);
        onDeliveryFeeChange(response.data.deliveryFee);
        onRangeStatusChange(response.data.isWithinRange);
      } else {
        console.error('Failed to calculate delivery fee');
        setDeliveryCalculation(null);
      }
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      setDeliveryCalculation(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const getStandardDeliveryFee = async () => {
    setIsCalculating(true);
    try {
      const response = await deliveryApi.getStandardFee() as ApiResponse<{ deliveryFee: number; estimatedTime: number }>;
      if (response.success && response.data) {
        const standardCalculation = {
          isWithinRange: true,
          distance: 0, // No specific distance for standard fee
          deliveryFee: response.data.deliveryFee,
          estimatedTime: response.data.estimatedTime
        };
        setDeliveryCalculation(standardCalculation);
        onDeliveryFeeChange(standardCalculation.deliveryFee);
        onRangeStatusChange(standardCalculation.isWithinRange);
      }
    } catch (error) {
      console.error('Error getting standard delivery fee:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${(import.meta as any).env.VITE_OPENCAGE_API_KEY}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const formattedAddress = data.results[0].formatted;
              onAddressChange(formattedAddress);
            }
          }
        } catch (error) {
          console.error('Error getting address:', error);
          // Still set coordinates even if address lookup fails
        }

        onCoordinatesChange({ lat: latitude, lng: longitude });
        const gpsLocationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        onGpsLocationChange(gpsLocationString);
        onCustomerGpsLocationChange(gpsLocationString);
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred while getting location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased to 15 seconds
        maximumAge: 600000 // 10 minutes cache
      }
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
      
      {/* Address Input */}
      <div className="mb-4">
        <label htmlFor="delivery-address" className="block text-sm font-medium text-gray-700 mb-2">
          Street Address *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            id="delivery-address"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Enter your complete delivery address..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
            rows={3}
            required
          />
        </div>
      </div>

      {/* GPS Location Button */}
      <div className="mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Share Location for Accurate Delivery Fee</span>
          </div>
          <p className="text-xs text-blue-700 mb-3">
            Optional: Share your GPS location to get precise delivery fees based on distance. 
            You can still place an order without sharing location.
          </p>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGettingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>
              {isGettingLocation ? 'Getting Location...' : 'Share Current Location'}
            </span>
          </button>
        </div>
        
        {locationError && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Location sharing failed</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              {locationError} Don't worry - you can still place your order! 
              Standard delivery fees will apply.
            </p>
          </div>
        )}
      </div>

      {/* GPS Coordinates Display */}
      {gpsLocation && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">
              <strong>GPS Location:</strong> {gpsLocation}
            </span>
          </div>
          {customerGpsLocation && customerGpsLocation !== gpsLocation && (
            <div className="mt-2 text-xs text-gray-600">
              <strong>Customer GPS:</strong> {customerGpsLocation}
            </div>
          )}
        </div>
      )}

      {/* Delivery Calculation */}
      {isCalculating && (
        <div className="mb-4 flex items-center space-x-2 text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Calculating delivery fee...</span>
        </div>
      )}

      {deliveryCalculation ? (
        <div className={`mb-4 p-3 rounded-lg border ${
          deliveryCalculation.isWithinRange
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          {deliveryCalculation.isWithinRange ? (
            <div className="text-green-700">
              <div className="font-medium mb-2">✓ Delivery Available</div>
              <div className="text-sm space-y-1">
                {deliveryCalculation.distance > 0 ? (
                  <>
                    <div>Distance: {deliveryCalculation.distance.toFixed(2)} km</div>
                    <div>Delivery Fee: LKR {deliveryCalculation.deliveryFee.toFixed(2)}</div>
                    <div>Estimated Time: {deliveryCalculation.estimatedTime} minutes</div>
                  </>
                ) : (
                  <>
                    <div>Standard Delivery Fee: LKR {deliveryCalculation.deliveryFee.toFixed(2)}</div>
                    <div>Estimated Time: {deliveryCalculation.estimatedTime} minutes</div>
                    <div className="text-blue-600 text-xs mt-2">
                      💡 Share your location for precise distance-based pricing
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-red-700">
              <div className="font-medium mb-2">✗ Outside Delivery Range</div>
              <div className="text-sm">
                Distance: {deliveryCalculation.distance.toFixed(2)} km (Maximum: 5 km)
              </div>
            </div>
          )}
        </div>
      ) : (
        !coordinates && address.trim() && (
          <div className="mb-4 p-3 rounded-lg border bg-blue-50 border-blue-200">
            <div className="text-blue-700">
              <div className="font-medium mb-2">📍 Delivery Available</div>
              <div className="text-sm space-y-1">
                <div>Standard delivery fee will apply</div>
                <div className="text-xs text-blue-600 mt-1">
                  Share your location above for precise distance-based pricing
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Delivery Notes */}
      <div>
        <label htmlFor="delivery-notes" className="block text-sm font-medium text-gray-700 mb-2">
          Delivery Instructions (Optional)
        </label>
        <textarea
          id="delivery-notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Any special instructions for delivery (e.g., building number, landmarks, etc.)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          rows={2}
        />
      </div>
    </div>
  );
};

export default DeliveryAddressInput;