import React from "react";
import { View } from "react-native";
import { useAppFonts } from "./hooks/useFonts";
import Navigation from "./navigation";

export default function App() {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }}>
      <Navigation />
    </View>
  );
}
