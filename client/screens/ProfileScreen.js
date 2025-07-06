import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import Footer from "../components/Footer";
import { Colors } from "../utils/colors";
import { Fonts } from "../utils/fonts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../utils/config";

// Helper function to decode JWT and get payload (userId)
const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export default function ProfileScreen() {
  const navigation = useNavigation();

  const [user, setUser] = useState(null); // { full_name, email }
  const [avatar, setAvatar] = useState(null); // You can adjust to get avatar URL from backend if available
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          return;
        }
        const decoded = decodeJWT(token);
        if (!decoded || !decoded.userId) {
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          return;
        }

        // Fetch user profile from backend by ID
        const response = await fetch(`${BASE_URL}/api/auth/user/${decoded.userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        setUser(data.user);

        // You can set avatar here if backend provides it, else fallback image
        setAvatar("https://i.pravatar.cc/150?img=12");

        setLoading(false);
      } catch (error) {
        Alert.alert("Error", "Session expired or failed to load profile. Please login again.");
        await AsyncStorage.removeItem("token");
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }
    };

    loadUserProfile();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  if (loading) {
    return (
      <View style={[styles.wrapper, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>My Profile</Text>

        <View style={styles.profileBox}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <Text style={styles.name}>{user?.full_name || "Unknown User"}</Text>
          <Text style={styles.email}>{user?.email || "No email"}</Text>
        </View>

        <View style={styles.options}>
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>Change Password</Text>
          </TouchableOpacity>

          <PrimaryButton title="Logout" onPress={handleLogout} width={160} height={50} />
        </View>
      </ScrollView>

      <Footer activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 35,
    paddingTop: 80,
    paddingBottom: 40,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 26,
    color: Colors.primary,
    fontFamily: Fonts.heading,
    marginBottom: 30,
    textAlign: "center",
  },
  profileBox: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
    fontFamily: Fonts.heading,
  },
  email: {
    fontSize: 14,
    color: "#555",
    fontFamily: Fonts.subheading,
    marginTop: 4,
  },
  options: {
    width: "100%",
    alignItems: "center",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    width: "100%",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 16,
    color: Colors.primary,
    fontFamily: Fonts.subheading,
  },
});
