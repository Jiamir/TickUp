import React, { useEffect } from "react";
import { View, StyleSheet, StatusBar, Text } from "react-native"; // ✅ Added Text here
import TickupLogo from "../components/TickupLogo";
import { Colors } from "../utils/colors";
import { Fonts } from "../utils/fonts";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace("Welcome");
    }, 6000); // 6 seconds splash

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TickupLogo size={180} />
      <Text style={styles.heading}>TickUp.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 38,
    color: Colors.primary,
    fontFamily: Fonts.heading,
    marginTop: 0,
  },
});
