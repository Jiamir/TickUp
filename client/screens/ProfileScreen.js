import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  Modal,
  TextInput,
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
import * as Notifications from 'expo-notifications';
import { Picker } from "@react-native-picker/picker";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

// Helper function to validate time format (HH:MM AM/PM)
const validateTimeFormat = (time) => {
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
  return timeRegex.test(time);
};

// Helper function to convert 12-hour format to 24-hour format
const convertTo24Hour = (time12h) => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = '00';
  }
  
  if (modifier.toUpperCase() === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

// Helper function to convert 24-hour format to 12-hour format
const convertTo12Hour = (time24h) => {
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours, 10);
  
  if (hour === 0) {
    return `12:${minutes} AM`;
  } else if (hour < 12) {
    return `${hour}:${minutes} AM`;
  } else if (hour === 12) {
    return `12:${minutes} PM`;
  } else {
    return `${hour - 12}:${minutes} PM`;
  }
};

export default function ProfileScreen() {
  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [timeInputValue, setTimeInputValue] = useState("");
  const [timeInputError, setTimeInputError] = useState("");
  
  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    enabled: true,
    reminderTime: 30, // minutes before due date
    dailyReminder: true,
    dailyReminderTime: "09:00",
    weeklySummary: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });

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

        // Load notification preferences
        await loadNotificationPreferences();

        setLoading(false);
      } catch (error) {
        Alert.alert("Error", "Session expired or failed to load profile. Please login again.");
        await AsyncStorage.removeItem("token");
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }
    };

    loadUserProfile();
    requestNotificationPermissions();
  }, []);

  // Initialize time input when modal opens
  useEffect(() => {
    if (showNotificationModal) {
      const time12h = convertTo12Hour(notificationPreferences.dailyReminderTime);
      setTimeInputValue(time12h);
      setTimeInputError("");
    }
  }, [showNotificationModal, notificationPreferences.dailyReminderTime]);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable notifications to receive task reminders.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadNotificationPreferences = async () => {
    try {
      const savedPreferences = await AsyncStorage.getItem('notificationPreferences');
      if (savedPreferences) {
        setNotificationPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const handleTimeInputChange = (text) => {
    setTimeInputValue(text);
    setTimeInputError("");
  };

  const handleTimeInputBlur = () => {
    if (timeInputValue.trim() === "") return;
    
    if (validateTimeFormat(timeInputValue)) {
      const time24h = convertTo24Hour(timeInputValue);
      setNotificationPreferences(prev => ({ 
        ...prev, 
        dailyReminderTime: time24h 
      }));
      setTimeInputError("");
    } else {
      setTimeInputError("Please enter time in format: HH:MM AM/PM (e.g., 9:30 AM)");
    }
  };

  const saveNotificationPreferences = async (preferences) => {
    // Validate time input before saving
    if (preferences.dailyReminder && timeInputValue.trim() !== "") {
      if (!validateTimeFormat(timeInputValue)) {
        setTimeInputError("Please enter a valid time format: HH:MM AM/PM");
        return;
      }
    }

    try {
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      setNotificationPreferences(preferences);
      
      // Schedule notifications based on new preferences
      if (preferences.enabled) {
        await scheduleNotifications(preferences);
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
      
      Alert.alert('Success', 'Notification preferences saved!');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      Alert.alert('Error', 'Failed to save notification preferences');
    }
  };

  const scheduleNotifications = async (preferences) => {
    try {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      if (!preferences.enabled) return;

      // Schedule daily reminder
      if (preferences.dailyReminder) {
        const [hour, minute] = preferences.dailyReminderTime.split(':');
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'TickUp Daily Reminder',
            body: 'Don\'t forget to check your tasks for today!',
            sound: preferences.soundEnabled,
          },
          trigger: {
            hour: parseInt(hour),
            minute: parseInt(minute),
            repeats: true,
          },
        });
      }

      // Schedule task deadline reminders
      await scheduleTaskDeadlineReminders(preferences);
      
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };

  const scheduleTaskDeadlineReminders = async (preferences) => {
    try {
      // Get tasks from local storage
      const localTasks = await AsyncStorage.getItem('localTasks');
      if (!localTasks) return;

      const tasks = JSON.parse(localTasks);
      const currentDate = new Date();

      for (const task of tasks) {
        if (task.isCompleted) continue;

        const dueDate = new Date(task.dueDate);
        const reminderDate = new Date(dueDate.getTime() - (preferences.reminderTime * 60 * 1000));

        // Only schedule if reminder time is in the future
        if (reminderDate > currentDate) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Task Reminder',
              body: `Task "${task.title}" is due in ${preferences.reminderTime} minutes!`,
              sound: preferences.soundEnabled,
              data: { taskId: task.id },
            },
            trigger: {
              date: reminderDate,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error scheduling task reminders:', error);
    }
  };

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
            await Notifications.cancelAllScheduledNotificationsAsync();
            await AsyncStorage.removeItem("token");
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          },
        },
      ]
    );
  };

  const renderNotificationModal = () => (
    <Modal
      visible={showNotificationModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowNotificationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Notification Preferences</Text>
            
            {/* Enable Notifications */}
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceLabel}>Enable Notifications</Text>
              <Switch
                value={notificationPreferences.enabled}
                onValueChange={(value) => 
                  setNotificationPreferences(prev => ({ ...prev, enabled: value }))
                }
              />
            </View>

            {notificationPreferences.enabled && (
              <>
                {/* Reminder Time */}
                <View style={styles.preferenceSection}>
                  <Text style={styles.preferenceLabel}>Remind me before due date</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={notificationPreferences.reminderTime}
                      onValueChange={(value) => 
                        setNotificationPreferences(prev => ({ ...prev, reminderTime: value }))
                      }
                    >
                      <Picker.Item label="5 minutes" value={5} />
                      <Picker.Item label="15 minutes" value={15} />
                      <Picker.Item label="30 minutes" value={30} />
                      <Picker.Item label="1 hour" value={60} />
                      <Picker.Item label="2 hours" value={120} />
                      <Picker.Item label="1 day" value={1440} />
                    </Picker>
                  </View>
                </View>

                {/* Daily Reminder */}
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Daily Reminder</Text>
                  <Switch
                    value={notificationPreferences.dailyReminder}
                    onValueChange={(value) => 
                      setNotificationPreferences(prev => ({ ...prev, dailyReminder: value }))
                    }
                  />
                </View>

                {notificationPreferences.dailyReminder && (
                  <View style={styles.preferenceSection}>
                    <Text style={styles.preferenceLabel}>Daily Reminder Time</Text>
                    <Text style={styles.timeInputHint}>Enter time in format: HH:MM AM/PM (e.g., 9:30 AM)</Text>
                    <TextInput
                      style={[styles.timeInput, timeInputError ? styles.timeInputError : null]}
                      value={timeInputValue}
                      onChangeText={handleTimeInputChange}
                      onBlur={handleTimeInputBlur}
                      placeholder="9:00 AM"
                      placeholderTextColor="#999"
                      autoCapitalize="characters"
                    />
                    {timeInputError ? (
                      <Text style={styles.errorText}>{timeInputError}</Text>
                    ) : null}
                  </View>
                )}

                {/* Weekly Summary */}
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Weekly Summary</Text>
                  <Switch
                    value={notificationPreferences.weeklySummary}
                    onValueChange={(value) => 
                      setNotificationPreferences(prev => ({ ...prev, weeklySummary: value }))
                    }
                  />
                </View>

                {/* Sound */}
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Sound</Text>
                  <Switch
                    value={notificationPreferences.soundEnabled}
                    onValueChange={(value) => 
                      setNotificationPreferences(prev => ({ ...prev, soundEnabled: value }))
                    }
                  />
                </View>

                {/* Vibration */}
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Vibration</Text>
                  <Switch
                    value={notificationPreferences.vibrationEnabled}
                    onValueChange={(value) => 
                      setNotificationPreferences(prev => ({ ...prev, vibrationEnabled: value }))
                    }
                  />
                </View>
              </>
            )}

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowNotificationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  saveNotificationPreferences(notificationPreferences);
                  setShowNotificationModal(false);
                }}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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

          {/* Notification Preferences */}
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={() => setShowNotificationModal(true)}
          >
            <Ionicons name="notifications" size={20} color={Colors.primary} />
            <Text style={styles.optionText}>Notification Settings</Text>
            <View style={styles.notificationStatus}>
              <View style={[
                styles.statusDot, 
                { backgroundColor: notificationPreferences.enabled ? '#4CAF50' : '#FF5722' }
              ]} />
            </View>
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
      {renderNotificationModal()}
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
    flex: 1,
  },
  notificationStatus: {
    marginLeft: 'auto',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  logoutContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 25,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#333',
    fontFamily: Fonts.subheading,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 8,
  },
  timeInputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  timeInputError: {
    borderColor: '#FF5722',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF5722',
    fontSize: 12,
    marginTop: 5,
    fontFamily: Fonts.subheading,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});