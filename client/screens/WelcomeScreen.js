import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { Colors } from "../utils/colors";
import { Fonts } from "../utils/fonts";
import PrimaryButton from "../components/PrimaryButton";
import WelcomeSvg from "../assets/images/welcome2.svg";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.heading}>TickUp.</Text>
      <Text style={styles.subtext}>
        Your Smart Task Manager Keeps Your Day On Track
      </Text>
      <WelcomeSvg width={250} height={250} style={styles.svg} />
      <PrimaryButton
        title="Get Started"
        onPress={() => navigation.navigate("Register")}
        width={160}
        height={50}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  svg: {
    marginTop: 5,
    marginBottom: 35,
  },
  heading: {
    fontSize: 28,
    color: Colors.primary,
    fontFamily: Fonts.heading,
    marginTop: 12,
    marginBottom: 8,
    lineHeight: 34,
    textAlign: "center",
  },

  subtext: {
    fontSize: 16,
    color: "#022b4f",
    fontFamily: Fonts.subheading,
    marginTop: 10,
    marginBottom: 12,
    lineHeight: 24,
    textAlign: "center",
  },
});
