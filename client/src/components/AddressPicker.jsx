// client/src/components/AddressPicker.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
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

const mapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: "cooperative",
  keyboardShortcuts: true,
};

const center = { lat: 33.8704, lng: -117.9242 }; // Fullerton, CA

export default function AddressPicker({ defaultValue, onAddressSelect }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [inputReady, setInputReady] = useState(false);

  const inputRef = useRef();

  // Wait for Google Maps to load before initializing autocomplete
  useEffect(() => {
    if (isLoaded) setInputReady(true);
  }, [isLoaded]);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    defaultValue: defaultValue || "",
    debounce: 300,
    enabled: inputReady, // Only initialize after Maps API is loaded
  });

  // Update map and marker when an address is selected
  const updateAddress = async (address) => {
    try {
      const results = await getGeocode({ address });
      if (!results[0]) return;
      const { lat, lng } = await getLatLng(results[0]);
      setMarker({ lat, lng });
      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(14);
      }
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
    (mapInstance) => {
      setMap(mapInstance);
      if (defaultValue) {
        updateAddress(defaultValue);
        setValue(defaultValue, false);
      }
    },
    [defaultValue, setValue],
  );

  if (loadError) return <p className="text-red-500">Error loading maps</p>;
  if (!isLoaded) return <p>Loading Maps...</p>;

  return (
    <div>
      <div className="relative">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          placeholder="Search for an address"
          className="w-full p-3 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 mb-2"
        />
        {status === "OK" && (
          <ul className="absolute z-10 w-full bg-white dark:bg-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {data.map(({ place_id, description }) => (
              <li
                key={place_id}
                onClick={() => handleSelect(description)}
                className="px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              >
                {description}
              </li>
            ))}
          </ul>
        )}
      </div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={marker ? 14 : 10}
        center={marker || center}
        options={mapOptions}
        onLoad={onLoad}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </div>
  );
}
