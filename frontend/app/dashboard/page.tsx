"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, Bus, Train, Zap } from "lucide-react";
import { Location, TransportOption } from "@/lib/types";
import { SpinnerLoader } from "@/components/loader";

const Map = dynamic(() => import("@/components/dashboard.tsx/map"), {
  ssr: false,
  loading: () => <SpinnerLoader />,
});

export default function TransportDashboard() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([
    {
      id: "1",
      type: "bus",
      route: "Bus 42",
      arrival: "5 min",
      duration: "25 min",
      stops: 8,
    },
    {
      id: "2",
      type: "train",
      route: "Metro Line 1",
      arrival: "8 min",
      duration: "18 min",
      stops: 5,
    },
    {
      id: "3",
      type: "bus",
      route: "Bus 156",
      arrival: "12 min",
      duration: "32 min",
      stops: 12,
    },
  ]);

  useEffect(() => {
    // Ensure we're on the client side before accessing navigator
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Current Location",
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
        }
      );
    } else {
      setIsLoadingLocation(false);
    }
  }, []);

  const getTransportIcon = (type: string) => {
    switch (type) {
      case "bus":
        return <Bus className="h-4 w-4" />;
      case "train":
        return <Train className="h-4 w-4" />;
      case "metro":
        return <Zap className="h-4 w-4" />;
      default:
        return <Bus className="h-4 w-4" />;
    }
  };

  const getTransportColor = (type: string) => {
    switch (type) {
      case "bus":
        return "bg-foreground text-background";
      case "train":
        return "bg-muted text-muted-foreground";
      case "metro":
        return "bg-border text-foreground";
      default:
        return "bg-foreground text-background";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Transport Tracker
          </h1>
          <p className="text-muted-foreground">
            Find the best routes for your journey
          </p>
        </div>

        {/* Location Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Current Location */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-foreground" />
                Current Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLocation ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                  Getting your location...
                </div>
              ) : currentLocation ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Lat: {currentLocation.lat.toFixed(6)}, Lng:{" "}
                    {currentLocation.lng.toFixed(6)}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Location detected
                  </Badge>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Unable to get location. Please enable location services.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Destination Picker */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Navigation className="h-5 w-5 text-foreground" />
                Destination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Enter destination address..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full"
              />
              <Button className="w-full" disabled={!destination.trim()}>
                Find Routes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Map Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Route Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
              {currentLocation && (
                <Map position={[currentLocation?.lat, currentLocation.lng]} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transport Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Available Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transportOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={getTransportColor(option.type)}>
                      {getTransportIcon(option.type)}
                    </Badge>
                    <div>
                      <p className="font-medium">{option.route}</p>
                      <p className="text-sm text-muted-foreground">
                        {option.stops} stops • {option.duration}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {option.arrival}
                    </p>
                    <p className="text-xs text-muted-foreground">arrival</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-sm text-muted-foreground">
                  Routes Available
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">5 min</p>
                <p className="text-sm text-muted-foreground">Next Departure</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">18 min</p>
                <p className="text-sm text-muted-foreground">Fastest Route</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
