import React, { useEffect } from "react";
import { View, StyleSheet, StatusBar, Text, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TickupLogo from "../components/TickupLogo";
import { Colors } from "../utils/colors";
import { Fonts } from "../utils/fonts";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        setTimeout(() => {
          if (token) {
            navigation.replace("Home");
          } else {
            navigation.replace("Welcome");
          }
        }, 2000); // You can keep 6s if you prefer long splash
      } catch (error) {
        console.error("Error checking token:", error);
        navigation.replace("Welcome");
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TickupLogo size={180} />
      <Text style={styles.heading}>TickUp.</Text>
      <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 20 }} />
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
