import React, { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl';
import { MapPin, Navigation, Loader2, AlertCircle, Search, X } from 'lucide-react';
import { deliveryApi } from '../services/api';
import { ApiResponse } from '../types/shared';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapLocationPickerProps {
  address: string;
  onAddressChange: (address: string) => void;
  coordinates: { lat: number; lng: number } | null;
  onCoordinatesChange: (coords: { lat: number; lng: number } | null) => void;
  deliveryFee: number;
  isWithinRange: boolean;
  onDeliveryFeeChange: (fee: number) => void;
  onRangeStatusChange: (isWithinRange: boolean) => void;
  className?: string;
}

interface DeliveryCalculation {
  isWithinRange: boolean;
  distance: number;
  deliveryFee: number;
  estimatedTime: number;
}

interface GeocodingResult {
  place_name: string;
  center: [number, number];
  geometry: {
    coordinates: [number, number];
  };
}

// Restaurant location (Colombo, Sri Lanka - default coordinates)
const RESTAURANT_LOCATION = {
  lat: parseFloat(import.meta.env.VITE_RESTAURANT_LAT || '6.261449'),
  lng: parseFloat(import.meta.env.VITE_RESTAURANT_LNG || '80.906462')
};

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY;

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  address,
  onAddressChange,
  coordinates,
  onCoordinatesChange,
  onDeliveryFeeChange,
  onRangeStatusChange,
  className = ''
}) => {
  const [viewState, setViewState] = useState({
    longitude: coordinates?.lng || RESTAURANT_LOCATION.lng,
    latitude: coordinates?.lat || RESTAURANT_LOCATION.lat,
    zoom: coordinates ? 14 : 12
  });
  

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [deliveryCalculation, setDeliveryCalculation] = useState<DeliveryCalculation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [draggedCoordinates, setDraggedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  
  const mapRef = useRef<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update view state when coordinates change externally
  useEffect(() => {
    if (coordinates) {
      setViewState(prev => ({
        ...prev,
        longitude: coordinates.lng,
        latitude: coordinates.lat,
        zoom: 14
      }));
    }
  }, [coordinates]);

  // Calculate delivery fee when coordinates change
  useEffect(() => {
    const coordsToUse = draggedCoordinates || coordinates;
    if (coordsToUse && coordsToUse.lat && coordsToUse.lng) {
      calculateDeliveryFee(coordsToUse.lat, coordsToUse.lng);
    } else {
      setDeliveryCalculation(null);
    }
  }, [coordinates, draggedCoordinates]);

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

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        
        // Update coordinates and view
        onCoordinatesChange(newCoords);
        setViewState(prev => ({
          ...prev,
          longitude,
          latitude,
          zoom: 14
        }));
        
        // Reverse geocode to get address
        try {
          await reverseGeocode(latitude, longitude);
        } catch (error) {
          console.error('Error getting address:', error);
        }
        
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
        timeout: 15000,
        maximumAge: 600000
      }
    );
  }, [onCoordinatesChange]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      if (OPENCAGE_API_KEY) {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${OPENCAGE_API_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            onAddressChange(data.results[0].formatted);
          }
        }
      } else if (MAPBOX_TOKEN) {
        // Fallback to Mapbox geocoding
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            onAddressChange(data.features[0].place_name);
          }
        }
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const searchPlaces = async (query: string) => {
    if (!query.trim() || !MAPBOX_TOKEN) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_TOKEN}&` +
        `country=LK&` +
        `proximity=${RESTAURANT_LOCATION.lng},${RESTAURANT_LOCATION.lat}&` +
        `limit=5`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.features || []);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchPlaces(query);
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchResultSelect = (result: GeocodingResult) => {
    const [lng, lat] = result.center;
    const newCoords = { lat, lng };
    
    onCoordinatesChange(newCoords);
    onAddressChange(result.place_name);
    setSearchQuery('');
    setShowSearchResults(false);
    
    setViewState(prev => ({
      ...prev,
      longitude: lng,
      latitude: lat,
      zoom: 14
    }));
  };

  const handleMapClick = useCallback((event: any) => {
    const { lng, lat } = event.lngLat;
    const newCoords = { lat, lng };
    
    onCoordinatesChange(newCoords);
    setDraggedCoordinates(null); // Clear any dragged state
    
    // Reverse geocode the clicked location
    reverseGeocode(lat, lng);
  }, [onCoordinatesChange]);

  const handleMarkerDragEnd = useCallback((event: any) => {
    const { lng, lat } = event.lngLat;
    const newCoords = { lat, lng };
    
    onCoordinatesChange(newCoords);
    setDraggedCoordinates(null);
    
    // Reverse geocode the dragged location
    reverseGeocode(lat, lng);
  }, [onCoordinatesChange]);

  const handleMarkerDrag = useCallback((event: any) => {
    const { lng, lat } = event.lngLat;
    setDraggedCoordinates({ lat, lng });
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 ${className}`}>
        <div className="flex items-center space-x-2 text-yellow-600 mb-4">
          <AlertCircle className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Map Configuration Required</h3>
        </div>
        <p className="text-gray-600 mb-4">
          To use the interactive map feature, please add your Mapbox access token to the environment variables.
        </p>
        <div className="bg-gray-50 p-3 rounded-lg">
          <code className="text-sm text-gray-700">
            VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
          </code>
        </div>
      </div>
    );
  }

  const displayCoordinates = draggedCoordinates || coordinates;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Delivery Location</h3>
      
      {/* Search Bar */}
      <div className="mb-4 relative">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            placeholder="Search for a location in Sri Lanka..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-3 top-3">
              <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            </div>
          )}
        </div>
        
        {/* Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSearchResultSelect(result)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-900 truncate">{result.place_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Location Controls */}
      <div className="mb-4 flex flex-wrap gap-2">
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
          <span className="text-sm">
            {isGettingLocation ? 'Getting Location...' : 'Use My Location'}
          </span>
        </button>
        
        {coordinates && (
          <button
            type="button"
            onClick={() => {
              setViewState(prev => ({
                ...prev,
                longitude: RESTAURANT_LOCATION.lng,
                latitude: RESTAURANT_LOCATION.lat,
                zoom: 12
              }));
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm">View Restaurant</span>
          </button>
        )}
      </div>

      {/* Error Display */}
      {locationError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Location Error</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            {locationError} You can still select a location by clicking on the map.
          </p>
        </div>
      )}

      {/* Map Container */}
      <div className="mb-4 h-80 rounded-lg overflow-hidden border border-gray-300">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}

          onClick={handleMapClick}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          attributionControl={false}
        >
          {/* Restaurant Marker */}
          <Marker
            longitude={RESTAURANT_LOCATION.lng}
            latitude={RESTAURANT_LOCATION.lat}
            anchor="bottom"
          >
            <div className="bg-orange-500 text-white p-2 rounded-full shadow-lg">
              <MapPin className="w-5 h-5" />
            </div>
          </Marker>

          {/* Delivery Location Marker */}
          {displayCoordinates && (
            <Marker
              longitude={displayCoordinates.lng}
              latitude={displayCoordinates.lat}
              anchor="bottom"
              draggable
              onDrag={handleMarkerDrag}
              onDragEnd={handleMarkerDragEnd}
            >
              <div className={`p-2 rounded-full shadow-lg cursor-move ${
                deliveryCalculation?.isWithinRange !== false ? 'bg-green-500' : 'bg-red-500'
              } text-white`}>
                <MapPin className="w-5 h-5" />
              </div>
            </Marker>
          )}

          {/* Map Controls */}
          <NavigationControl position="top-right" />
          <GeolocateControl
            position="top-right"
            trackUserLocation
            onGeolocate={(e) => {
              const { latitude, longitude } = e.coords;
              const newCoords = { lat: latitude, lng: longitude };
              onCoordinatesChange(newCoords);
              reverseGeocode(latitude, longitude);
            }}
          />
        </Map>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">How to select your delivery location:</p>
          <ul className="text-xs space-y-1 ml-4">
            <li>• Search for your location using the search bar above</li>
            <li>• Click "Use My Location" to auto-detect your current position</li>
            <li>• Click anywhere on the map to place a pin</li>
            <li>• Drag the green/red pin to fine-tune your exact location</li>
          </ul>
        </div>
      </div>

      {/* Address Display */}
      {address && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Address
          </label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-900">{address}</span>
            </div>
          </div>
        </div>
      )}

      {/* Coordinates Display */}
      {displayCoordinates && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">
              <strong>Coordinates:</strong> {displayCoordinates.lat.toFixed(6)}, {displayCoordinates.lng.toFixed(6)}
            </span>
          </div>
        </div>
      )}

      {/* Delivery Calculation */}
      {isCalculating && (
        <div className="mb-4 flex items-center space-x-2 text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Calculating delivery fee...</span>
        </div>
      )}

      {deliveryCalculation && (
        <div className={`mb-4 p-3 rounded-lg border ${
          deliveryCalculation.isWithinRange
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          {deliveryCalculation.isWithinRange ? (
            <div className="text-green-700">
              <div className="font-medium mb-2">✓ Delivery Available</div>
              <div className="text-sm space-y-1">
                <div>Distance: {deliveryCalculation.distance.toFixed(2)} km</div>
                <div>Delivery Fee: LKR {deliveryCalculation.deliveryFee.toFixed(2)}</div>
                <div>Estimated Time: {deliveryCalculation.estimatedTime} minutes</div>
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
      )}
    </div>
  );
};

export default MapLocationPicker;