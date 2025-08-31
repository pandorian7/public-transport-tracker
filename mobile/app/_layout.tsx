import { Stack } from "expo-router";
import { RoutesProvider } from "./RoutesContext";

export default function RootLayout() {
  return (
    <RoutesProvider>
      <Stack />
    </RoutesProvider>
  );
}
