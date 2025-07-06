import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import TaskCard from "../components/TaskCard"; // your task card component
import { Colors } from "../utils/colors";
import { Fonts } from "../utils/fonts";
import { BASE_URL } from "../utils/config";
import Footer from "../components/Footer";

// JWT decode helper (same as before)
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

export default function TaskScreen() {
  const navigation = useNavigation();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

useFocusEffect(
  React.useCallback(() => {
    const loadUserTasks = async () => {
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

        setLoading(true); // Reset loading state
        const response = await fetch(
          `${BASE_URL}/api/tasks/user/${decoded.userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();
        setTasks(data.tasks || []);
      } catch (error) {
        Alert.alert("Error", "Failed to load tasks. Please login again.");
        await AsyncStorage.removeItem("token");
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      } finally {
        setLoading(false);
      }
    };

    loadUserTasks();
  }, [])
);


  if (loading) {
    return (
      <View
        style={[
          styles.wrapper,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  const handleDelete = (taskId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${BASE_URL}/api/tasks/delete/${taskId}`,
                {
                  method: "DELETE",
                }
              );

              if (!response.ok) throw new Error("Failed to delete task");

              // Remove from state
              setTasks((prevTasks) =>
                prevTasks.filter((task) => task.id !== taskId)
              );
              Alert.alert("Deleted", "Task deleted successfully!");
            } catch (error) {
              console.error("Delete task error:", error);
              Alert.alert("Error", "Failed to delete the task.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>My Tasks</Text>

        {tasks.length === 0 ? (
          <Text style={styles.noTasksText}>No tasks found.</Text>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              description={task.description}
              dueDate={task.due_date}
              priority={task.priority}
              status={task.status}
              onEdit={() => navigation.navigate("Update", { task })}
              onDelete={() => handleDelete(task.id)}
            />
          ))
        )}
      </ScrollView>
      <Footer activeTab="task" />
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
  },
  heading: {
    fontSize: 26,
    color: Colors.primary,
    fontFamily: Fonts.heading,
    marginBottom: 30,
    textAlign: "center",
  },
  noTasksText: {
    fontSize: 18,
    color: "#888",
    fontFamily: Fonts.subheading,
    marginTop: 50,
    textAlign: "center",
  },
});
