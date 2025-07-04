import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { Colors } from "../utils/colors";
import { Fonts } from "../utils/fonts";

// Import your SVG as a React Component
import WelcomeSvg from "../assets/images/welcome2.svg";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <WelcomeSvg width={250} height={250} style={styles.svg} />
      <Text style={styles.heading}>TickUp.</Text>
      <Text style={styles.subtext}>Your Smart Task Manager</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  svg: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    color: Colors.primary,
    fontFamily: Fonts.heading,
    marginTop: 10,
  },
  subtext: {
    fontSize: 16,
    color: "#022b4f",
    fontFamily: Fonts.subheading,
    marginTop: 6,
  },
});
