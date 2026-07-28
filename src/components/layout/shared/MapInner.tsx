"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LocationSelector({
  setPosition,
}: {
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e: any) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function MapInner({
  position,
  setPosition,
  customIcon,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  customIcon: any;
}) {
  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={true}
      className="absolute inset-0 w-full h-full z-[1]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
      />
      <Marker position={position} icon={customIcon} />
      <LocationSelector setPosition={setPosition} />
    </MapContainer>
  );
}
