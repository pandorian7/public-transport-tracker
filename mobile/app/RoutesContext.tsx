import React, { createContext, useContext, useState } from "react";

export type Route = {
  start: string;
  destination: string;
};

interface RoutesContextType {
  routes: Route[];
  addRoute: (route: Route) => void;
  swapRoute: (index: number) => void;
  deleteRoute: (index: number) => void;
}

const RoutesContext = createContext<RoutesContextType | undefined>(undefined);
export function RoutesProvider({ children }: { children: React.ReactNode }) {

  const [routes, setRoutes] = useState<Route[]>([]);
  const addRoute = (route: Route) => setRoutes((prev) => [...prev, route]);
  const swapRoute = (index: number) => {
    setRoutes((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const newRoutes = [...prev];
      const route = newRoutes[index];
      newRoutes[index] = { start: route.destination, destination: route.start };
      return newRoutes;
    });
  };

  const deleteRoute = (index: number) => {
    setRoutes((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const newRoutes = [...prev];
      newRoutes.splice(index, 1);
      return newRoutes;
    });
  };

  return (
    <RoutesContext.Provider value={{ routes, addRoute, swapRoute, deleteRoute }}>
      {children}
    </RoutesContext.Provider>
  );
}

export function useRoutes() {
  const ctx = useContext(RoutesContext);
  if (!ctx) throw new Error("useRoutes must be used within a RoutesProvider");
  return ctx;
}
