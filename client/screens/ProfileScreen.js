import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

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
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("token");
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          },
        },
      ]
    );
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
        <Text style={styles.subheading}>Manage your account and app preferences</Text>

        <View style={styles.profileBox}>
          <Text style={styles.name}>{user?.full_name || "Unknown User"}</Text>
          <Text style={styles.email}>{user?.email || "No email"}</Text>
        </View>

        <View style={styles.options}>
          {/* Navigation Options */}
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Ionicons name="home" size={20} color={Colors.primary} />
            <Text style={styles.optionText}>Go to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => navigation.navigate("Task")}
          >
            <MaterialCommunityIcons name="format-list-checks" size={20} color={Colors.primary} />
            <Text style={styles.optionText}>View My Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => navigation.navigate("AddTask")}
          >
            <Ionicons name="add-circle" size={20} color={Colors.primary} />
            <Text style={styles.optionText}>Add New Task</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => navigation.navigate("Calendar")}
          >
            <Ionicons name="calendar" size={20} color={Colors.primary} />
            <Text style={styles.optionText}>Calendar View</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <PrimaryButton 
              title="Logout" 
              onPress={handleLogout} 
              width={160} 
              height={50} 
            />
          </View>
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
    marginBottom: 10,
    textAlign: "center",
  },
  subheading: {
    fontSize: 16,
    color: "#666",
    fontFamily: Fonts.subheading,
    marginBottom: 30,
    textAlign: "center",
  },
profileBox: {
 alignItems: "center",
 marginBottom: 40,
 backgroundColor: "#ffffff",
 paddingVertical: 20,
 paddingHorizontal: 25,
 borderRadius: 20,
 shadowColor: "#000",
 shadowOffset: { width: 0, height: 4 },
 shadowOpacity: 0.1,
 shadowRadius: 12,
 elevation: 8,
 borderWidth: 1,
 borderColor: "#f0f0f0",
 width: "100%",
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
    justifyContent: "flex-start",
  },
  optionText: {
    fontSize: 16,
    color: Colors.primary,
    fontFamily: Fonts.subheading,
    fontWeight: "600",
    marginLeft: 12,
  },
  logoutContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});