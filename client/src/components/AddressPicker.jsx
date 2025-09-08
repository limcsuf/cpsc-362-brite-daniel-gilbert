// client/src/components/AddressPicker.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.375rem',
};

// Map options to disable all user interaction
const mapOptions = {
  disableDefaultUI: true,
  clickableIcons: false,
  gestureHandling: 'none',
  keyboardShortcuts: false,
};

const center = { lat: 33.8704, lng: -117.9242 }; // Centered on Fullerton, CA

export default function AddressPicker({ initialAddress, onAddressSelect }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(null); // State to hold the map instance
  const [marker, setMarker] = useState(null);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    defaultValue: initialAddress,
    debounce: 300,
  });

  // useEffect to set the initial marker on load
  useEffect(() => {
    if (isLoaded && initialAddress) {
      getGeocode({ address: initialAddress })
        .then((results) => getLatLng(results[0]))
        .then(({ lat, lng }) => {
          setMarker({ lat, lng });
          // If the map is loaded, pan to the initial marker
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(14);
          }
        })
        .catch((error) => console.error('Error setting initial address:', error));
    }
  }, [isLoaded, initialAddress, map]);

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setMarker({ lat, lng });
      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(14);
      }
      onAddressSelect(address); // Update the parent form state
    } catch (error) {
      console.error('Error selecting address:', error);
    }
  };
  
  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance); // Save map instance to state
  }, []);

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps...";

  return (
    <div>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          placeholder="Search for an address"
          className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 mb-2"
        />
        {status === 'OK' && (
          <ul className="absolute z-10 w-full bg-white dark:bg-gray-600 rounded-md shadow-lg">
            {data.map(({ place_id, description }) => (
              <li key={place_id} onClick={() => handleSelect(description)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-500 cursor-pointer">
                {description}
              </li>
            ))}
          </ul>
        )}
      </div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={marker || center}
        options={mapOptions} // Apply the new non-interactive options
        onLoad={onLoad} // Use the onLoad callback
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </div>
  );
}