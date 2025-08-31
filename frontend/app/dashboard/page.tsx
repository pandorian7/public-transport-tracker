"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Navigation,
  Clock,
  Route as RouteIcon,
  Plus,
  Search,
  Loader2,
} from "lucide-react";
import {
  Location,
  Route,
  Status,
  TransportOption,
  Place,
  Trip,
} from "@/lib/types";
import { SpinnerLoader } from "@/components/loader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllRoutes,
  searchPlaces,
  createRouteSegment,
  saveCurrentLocationAsPlace,
  getAllTrips,
  getTripById,
} from "@/lib/actions";

const Map = dynamic(() => import("@/components/dashboard/map"), {
  ssr: false,
  loading: () => <SpinnerLoader />,
});

export default function TransportDashboard() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<TransportOption | null>(
    null
  );

  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [pointA, setPointA] = useState<Place | null>(null);
  const [pointB, setPointB] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [activePointSelection, setActivePointSelection] = useState<
    "A" | "B" | null
  >(null);

  const [selectedTrips, setSelectedTrips] = useState<Trip[]>([]);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<Status | undefined>({
    queryKey: ["routes"],
    queryFn: () => getAllRoutes(),
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: tripsData, isLoading: isLoadingTrips } = useQuery<
    Status | undefined
  >({
    queryKey: ["trips"],
    queryFn: () => getAllTrips(),
    refetchInterval: 5 * 1000,
  });

  const routes = (data?.data as Route[]) ?? [];
  const trips = (tripsData?.data as Trip[]) ?? [];
  console.log(trips);

  const transformRouteToTransportOption = (route: Route) => {
    return {
      id: route.id.toString(),
      route: `${route.A_Name} → ${route.B_Name}`,
      distance: route.distance.toFixed(1),
      polyline: route.polyline,
      coordinates: {
        start: { lat: route.A_LAT, lng: route.A_LON },
        end: { lat: route.B_LAT, lng: route.B_LON },
      },
    };
  };

  const transportOptions = routes.map(transformRouteToTransportOption);

  console.log(routes);
  console.log(data);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      try {
        const result = await searchPlaces(query);
        if (result?.status === "success") {
          setSearchResults(result.data as Place[]);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectPlace = (place: Place) => {
    if (activePointSelection === "A") {
      setPointA(place);
    } else if (activePointSelection === "B") {
      setPointB(place);
    }
    setSearchQuery("");
    setSearchResults([]);
    setActivePointSelection(null);
  };

  const useCurrentLocationAsPointA = () => {
    if (currentLocation) {
      const currentPlace: Place = {
        place_id: 0, // just to identify current location
        lat: currentLocation.lat,
        lon: currentLocation.lng,
        name: `Current Location (${currentLocation.lat.toFixed(
          4
        )}, ${currentLocation.lng.toFixed(4)})`,
      };
      setPointA(currentPlace);
    }
  };

  const handleCreateRoute = async () => {
    if (!pointA || !pointB) return;

    setIsCreatingRoute(true);
    try {
      let pointAId: number;
      let pointBId: number;

      // Save Point A if it's current location (place_id = 0)
      if (pointA.place_id === 0) {
        const saveResult = await saveCurrentLocationAsPlace(
          pointA.lat,
          pointA.lon,
          pointA.name
        );
        if (saveResult?.status === "success") {
          const places = saveResult.data as Place[];
          pointAId = places[0]?.place_id || 1;
        } else {
          throw new Error("Failed to save Point A");
        }
      } else {
        pointAId = pointA.place_id;
      }

      pointBId = pointB.place_id;

      const result = await createRouteSegment(pointAId, pointBId);

      if (result?.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["routes"] });

        setIsRouteModalOpen(false);
        setPointA(null);
        setPointB(null);
        setSearchQuery("");
        setSearchResults([]);
      } else {
        throw new Error(result?.message || "Failed to create route");
      }
    } catch (error) {
      console.error("Route creation error:", error);
    } finally {
      setIsCreatingRoute(false);
    }
  };

  // Trip selection handler
  const handleTripClick = (trip: Trip) => {
    setSelectedTrips((prev) => {
      const isSelected = prev.some((t) => t.id === trip.id);
      if (isSelected) {
        // Remove trip if already selected
        return prev.filter((t) => t.id !== trip.id);
      } else {
        // Add trip to selection
        return [...prev, trip];
      }
    });
  };

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Transport Tracker
          </h1>
          <p className="text-muted-foreground">
            Find the best routes for your journey
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <RouteIcon className="h-5 w-5 text-foreground" />
                Plan Route
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium min-w-[60px]">From:</span>
                  <span className="text-muted-foreground truncate">
                    {pointA ? pointA.name : "Select starting point"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium min-w-[60px]">To:</span>
                  <span className="text-muted-foreground truncate">
                    {pointB ? pointB.name : "Select destination"}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => setIsRouteModalOpen(true)}
                size="sm"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Plan New Route
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Navigation className="h-5 w-5 text-foreground" />
                Trips Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {isLoadingTrips ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading trips...
                    </span>
                  ) : trips.length > 0 ? (
                    `${trips.length} active trip${
                      trips.length > 1 ? "s" : ""
                    } tracked by mobile app`
                  ) : (
                    "No active trips"
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Trips are created and managed through the mobile application
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  💡 Click on any trip below to show its location on the map
                </p>
              </div>
            </CardContent>
          </Card>

          <Dialog open={isRouteModalOpen} onOpenChange={setIsRouteModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Plan Your Route</DialogTitle>
                <DialogDescription>
                  Select your starting point and destination to create a new
                  route.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Starting Point (A)
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={useCurrentLocationAsPointA}
                      disabled={!currentLocation}
                      className="flex-1"
                    >
                      <MapPin className="mr-1 h-3 w-3" />
                      Current
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivePointSelection("A")}
                      className="flex-1"
                    >
                      <Search className="mr-1 h-3 w-3" />
                      Search
                    </Button>
                  </div>
                  {pointA && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                      ✓ {pointA.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination (B)</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActivePointSelection("B")}
                    className="w-full"
                  >
                    <Search className="mr-1 h-3 w-3" />
                    Search Destination
                  </Button>
                  {pointB && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                      ✓ {pointB.name}
                    </div>
                  )}
                </div>

                {activePointSelection && (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder={`Search for ${
                        activePointSelection === "A"
                          ? "starting point"
                          : "destination"
                      }...`}
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full"
                      autoFocus
                    />

                    {searchResults.length > 0 && (
                      <div className="max-h-32 overflow-y-auto border rounded-md">
                        {searchResults.map((place) => (
                          <button
                            key={place.place_id}
                            className="w-full text-left p-2 hover:bg-gray-100 text-sm border-b last:border-b-0"
                            onClick={() => selectPlace(place)}
                          >
                            {place.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRouteModalOpen(false);
                    setActivePointSelection(null);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRoute}
                  disabled={!pointA || !pointB || isCreatingRoute}
                >
                  {isCreatingRoute ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Route"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Available Routes
                {isLoading && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                )}
              </span>
              {selectedRoute && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRoute(null)}
                >
                  Clear Selection
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <SpinnerLoader />
              </div>
            ) : data?.status === "error" ? (
              <div className="text-center p-8">
                <p className="text-muted-foreground">
                  Failed to load routes: {data.message}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : transportOptions.length > 0 ? (
              <div className="space-y-3">
                {transportOptions.map((option) => {
                  const route = routes.find(
                    (r) => r.id.toString() === option.id
                  );
                  return (
                    <div
                      key={option.id}
                      className={`p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors ${
                        selectedRoute?.id === option.id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer mb-3"
                        onClick={() => setSelectedRoute(option)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{option.route}</p>
                            <p className="text-sm text-muted-foreground">
                              • {option.distance} km
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            Route #{option.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedRoute?.id === option.id
                              ? "viewing"
                              : "click to view"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No routes available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedRoute && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Route Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    Route Information
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">From:</span>{" "}
                      {selectedRoute.route.split(" → ")[0]}
                    </p>
                    <p>
                      <span className="text-muted-foreground">To:</span>{" "}
                      {selectedRoute.route.split(" → ")[1]}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Distance:</span>{" "}
                      {selectedRoute.distance} km
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Coordinates</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Start:</span>{" "}
                      {selectedRoute.coordinates.start.lat.toFixed(4)},{" "}
                      {selectedRoute.coordinates.start.lng.toFixed(4)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">End:</span>{" "}
                      {selectedRoute.coordinates.end.lat.toFixed(4)},{" "}
                      {selectedRoute.coordinates.end.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {trips.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Active Trips
                  {isLoadingTrips && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                  )}
                </span>
                {selectedTrips.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTrips([])}
                  >
                    Clear Selection ({selectedTrips.length})
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTrips.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    📍 {selectedTrips.length} trip
                    {selectedTrips.length > 1 ? "s" : ""} shown on map
                  </p>
                  <p className="text-xs text-blue-600">
                    Click on trip cards below to show/hide them on the map
                  </p>
                </div>
              )}
              <div className="space-y-3">
                {trips.map((trip) => {
                  const tripRoute = routes.find((r) => r.id === trip.Route_Id);
                  const isSelected = selectedTrips.some(
                    (t) => t.id === trip.id
                  );
                  return (
                    <div
                      key={trip.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500"
                          : "bg-card hover:bg-accent/5"
                      }`}
                      onClick={() => handleTripClick(trip)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            Trip #{trip.id}
                            {isSelected && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                📍 Shown on map
                              </span>
                            )}
                          </p>
                          {tripRoute && (
                            <p className="text-xs text-muted-foreground">
                              {tripRoute.A_Name} → {tripRoute.B_Name}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Direction: {trip.Direction} • Last update:{" "}
                            {new Date(trip.Loc_TimeStamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {trip.Loc_LAT.toFixed(4)}, {trip.Loc_LON.toFixed(4)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Progress: {(trip.Loc_Frac * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              Route Map
              {selectedRoute && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  - Showing: {selectedRoute.route}
                </span>
              )}
              {selectedTrips.length > 0 && (
                <span className="text-sm font-normal text-blue-600 ml-2">
                  - {selectedTrips.length} trip
                  {selectedTrips.length > 1 ? "s" : ""} 🚌
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
              {currentLocation && (
                <Map
                  position={[currentLocation?.lat, currentLocation.lng]}
                  selectedRoute={selectedRoute}
                  selectedTrips={selectedTrips}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? "..." : transportOptions.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Routes Available
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {isLoadingTrips ? "..." : trips.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Trips</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {isLoadingTrips ? "..." : trips.length}
                </p>
                <p className="text-sm text-muted-foreground">Active Trips</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {isLoading
                    ? "..."
                    : transportOptions.length > 0
                    ? `${Math.min(
                        ...transportOptions.map((option) =>
                          parseFloat(option.distance)
                        )
                      ).toFixed(1)} km`
                    : "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">Shortest Route</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
