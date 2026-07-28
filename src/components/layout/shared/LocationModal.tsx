"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Search } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import "leaflet/dist/leaflet.css";

// Dynamic import for MapInner to avoid SSR issues with react-leaflet
const MapInner = dynamic(() => import("./MapInner"), { ssr: false });

export interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor?: string;
}

export function LocationModal({
  isOpen,
  onClose,
  themeColor = "emerald",
}: LocationModalProps) {
  const { settings, setSettings } = useSettingsStore();

  // Default to NYC or previous location
  const [position, setPosition] = useState<[number, number]>([
    settings.deliveryLat || 40.7128,
    settings.deliveryLng || -74.006,
  ]);
  const [addressInput, setAddressInput] = useState(
    settings.deliveryLocation || "",
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [L, setL] = useState<any>(null);

  // Load leaflet safely on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((leaflet) => {
        setL(leaflet);
      });
    }
  }, []);

  // Reverse Geocoding Effect
  useEffect(() => {
    let isMounted = true;

    // Skip initial render if position matches settings exactly
    if (
      position[0] === settings.deliveryLat &&
      position[1] === settings.deliveryLng
    ) {
      return;
    }

    const fetchAddress = async () => {
      try {
        setIsGeocoding(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`,
        );
        const data = await res.json();

        if (isMounted && data && data.display_name) {
          // Clean up the address slightly (Nominatim can be very verbose)
          const addressParts = data.display_name.split(", ");
          const shortAddress = addressParts.slice(0, 3).join(", ");
          setAddressInput(shortAddress);
        }
      } catch (error) {
        console.error("Geocoding failed:", error);
      } finally {
        if (isMounted) setIsGeocoding(false);
      }
    };

    // Debounce the fetch to prevent spamming the API
    const timeoutId = setTimeout(fetchAddress, 800);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [position, settings.deliveryLat, settings.deliveryLng]);

  const handleConfirm = () => {
    if (addressInput.trim()) {
      setSettings({
        deliveryLocation: addressInput,
        deliveryLat: position[0],
        deliveryLng: position[1],
      });
    } else {
      setSettings({
        deliveryLocation: "Selected Location",
        deliveryLat: position[0],
        deliveryLng: position[1],
      });
    }
    onClose();
  };

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
    red: "bg-pink-600 hover:bg-pink-700 focus:ring-pink-500",
  };
  const btnColor = colorMap[themeColor] || colorMap.emerald;

  // Custom Icon
  const customIcon = L
    ? L.divIcon({
        html: `<div style="background-color: white; border-radius: 50%; padding: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin" style="color: #ef4444; fill: #fee2e2;"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        className: "custom-leaflet-marker",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      })
    : null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
          className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="text-gray-500" size={20} /> Select Delivery
                Location
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                To see available items and exact pricing
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100 z-10 relative bg-white shadow-sm">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your street address or zip code..."
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:border-gray-400 focus:bg-white transition-all shadow-inner"
              />
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              {isGeocoding && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                </div>
              )}
            </div>
          </div>

          {/* Map Area */}
          <div className="flex-1 bg-gray-100 relative min-h-[300px]">
            {typeof window !== "undefined" && L && customIcon ? (
              <MapInner
                position={position}
                setPosition={setPosition}
                customIcon={customIcon}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}

            {/* Overlay instruction */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-xs font-bold text-gray-700 pointer-events-none z-[2]">
              Click on the map to pin your location
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`px-8 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-md active:scale-95 ${btnColor}`}
            >
              Confirm Location
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
