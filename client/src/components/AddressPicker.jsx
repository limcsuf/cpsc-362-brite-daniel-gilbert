// client/src/components/AddressPicker.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "0.375rem",
};

// Map options to disable all user interaction
const mapOptions = {
  zoomControl: true, // Explicitly enable the zoom control
  streetViewControl: false, // Keep street view control disabled
  mapTypeControl: false, // Keep map type control disabled
  fullscreenControl: false, // Keep fullscreen control disabled
  clickableIcons: false,
  gestureHandling: "cooperative", // Allow users to zoom and pan the map safely
  keyboardShortcuts: true, // Re-enable keyboard shortcuts for navigation
};

const center = { lat: 33.8704, lng: -117.9242 }; // Centered on Fullerton, CA

export default function AddressPicker({ defaultValue, onAddressSelect }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(null); // State to hold the map instance
  const [marker, setMarker] = useState(null);

  const suggestionClicked = useRef(false);
  const inputRef = useRef();

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    defaultValue: defaultValue || "",
    debounce: 300,
  });

  const updateAddress = async (address) => {
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);

      setMarker({ lat, lng });
      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(14);
      }
      // Report the final, validated address to the parent form
      onAddressSelect(address);
    } catch (error) {
      console.error("Error geocoding address:", error);
    }
  };

  const handleSelect = (address) => {
    setValue(address, false);
    clearSuggestions();
    updateAddress(address);
  };

  const onLoad = useCallback(
    function callback(mapInstance) {
      setMap(mapInstance);
      // Set the initial marker when the map loads
      if (defaultValue) {
        updateAddress(defaultValue);
      }
    },
    [defaultValue],
  );

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps...";

  return (
    <div>
      <div className="relative">
        <input
          onChange={(e) => setValue(e.target.value)}
          value={value}
          disabled={!ready}
          placeholder="Search for an address"
          className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 mb-2"
        />
        {status === "OK" && (
          <ul className="absolute z-10 w-full bg-white dark:bg-gray-600 rounded-md shadow-lg">
            {data.map(({ place_id, description }) => (
              <li key={place_id} onClick={() => handleSelect(description)}>
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
        options={mapOptions}
        onLoad={onLoad}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </div>
  );
}
