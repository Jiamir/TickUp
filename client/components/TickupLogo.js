import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";
import { Colors } from "../utils/colors"; // for background color

export default function TickupLogo({ size = 200 }) {
  return (
    <View style={[styles.container, { backgroundColor: Colors.bg }]}>
      <LottieView
        source={require("../assets/images/logo.json")}
        autoPlay
        loop={false}          // play only once
        speed={0.65}          // slow down animation
        style={{ width: size, height: size }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    padding: 10,
  },
});
