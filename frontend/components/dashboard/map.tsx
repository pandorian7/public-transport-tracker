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
import { TransportOption, Trip } from "@/lib/types";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

const createBusIcon = () => {
  return L.divIcon({
    className: "custom-bus-icon",
    html: `<div style="background-color: #f59e0b; width: 30px; height: 30px; border-radius: 6px; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">🚌</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const userLocationIcon = createCustomIcon("#3b82f6");
const startIcon = createCustomIcon("#10b981");
const endIcon = createCustomIcon("#ef4444");
const busIcon = createBusIcon();

// Component for trip markers that updates positions without disrupting map view
function TripMarkers({
  selectedTrips,
  formatTimestamp,
}: {
  selectedTrips: Trip[];
  formatTimestamp: (timestamp: Trip["Loc_TimeStamp"]) => string;
}) {
  return (
    <>
      {selectedTrips.map((trip) => {
        // Create a simpler key that still ensures updates but is less aggressive
        const locationKey = `${trip.Loc_LAT.toFixed(6)}-${trip.Loc_LON.toFixed(
          6
        )}`;
        const timeKey = `${trip.Loc_TimeStamp.hour}:${trip.Loc_TimeStamp.minute}:${trip.Loc_TimeStamp.second}`;

        return (
          <Marker
            key={`trip-${trip.id}-${locationKey}-${timeKey}`}
            position={[trip.Loc_LAT, trip.Loc_LON]}
            icon={busIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Trip #{trip.id}</strong>
                <br />
                Direction: {trip.Direction}
                <br />
                Progress: {(trip.Loc_Frac * 100).toFixed(1)}%
                <br />
                Last update: {formatTimestamp(trip.Loc_TimeStamp)}
                <br />
                <small>
                  Lat: {trip.Loc_LAT.toFixed(6)}, Lng: {trip.Loc_LON.toFixed(6)}
                </small>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

type Props = {
  position: [number, number];
  selectedRoute?: TransportOption | null;
  selectedTrips?: Trip[];
};

export default function Map({
  position,
  selectedRoute,
  selectedTrips = [],
}: Props) {
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    []
  );

  // Helper function to format the timestamp from backend
  const formatTimestamp = (timestamp: Trip["Loc_TimeStamp"]) => {
    const date = new Date(
      timestamp.year,
      timestamp.month - 1, // Month is 0-indexed in JavaScript Date
      timestamp.day,
      timestamp.hour,
      timestamp.minute,
      timestamp.second
    );
    return date.toLocaleTimeString();
  };

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

      <TripMarkers
        selectedTrips={selectedTrips}
        formatTimestamp={formatTimestamp}
      />
    </MapContainer>
  );
}
