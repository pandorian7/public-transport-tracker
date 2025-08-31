"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { useEffect, useState } from "react";
import polyline from "@mapbox/polyline";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { TransportOption } from "@/lib/types";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for different marker types
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

const userLocationIcon = createCustomIcon("#3b82f6");
const startIcon = createCustomIcon("#10b981");
const endIcon = createCustomIcon("#ef4444");

type Props = {
  position: [number, number];
  selectedRoute?: TransportOption | null;
};

export default function Map({ position, selectedRoute }: Props) {
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    []
  );

  useEffect(() => {
    if (selectedRoute?.polyline) {
      try {
        const decoded = polyline.decode(selectedRoute.polyline);
        setRouteCoordinates(decoded as [number, number][]);
      } catch (error) {
        console.error("Error decoding polyline:", error);
        setRouteCoordinates([]);
      }
    } else {
      setRouteCoordinates([]);
    }
  }, [selectedRoute]);

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "700px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position} icon={userLocationIcon}>
        <Popup>Your location</Popup>
      </Marker>

      {routeCoordinates.length > 0 && (
        <Polyline
          positions={routeCoordinates}
          color="blue"
          weight={4}
          opacity={0.7}
        />
      )}

      {selectedRoute && (
        <>
          <Marker
            position={[
              selectedRoute.coordinates.start.lat,
              selectedRoute.coordinates.start.lng,
            ]}
            icon={startIcon}
          >
            <Popup>Start: {selectedRoute.route.split(" → ")[0]}</Popup>
          </Marker>
          <Marker
            position={[
              selectedRoute.coordinates.end.lat,
              selectedRoute.coordinates.end.lng,
            ]}
            icon={endIcon}
          >
            <Popup>End: {selectedRoute.route.split(" → ")[1]}</Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  );
}
