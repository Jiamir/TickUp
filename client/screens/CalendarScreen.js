import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Footer from "../components/Footer";
import TaskCard from "../components/TaskCard"; // ✅ Full display card
import { Colors } from "../utils/colors";
import { Fonts } from "../utils/fonts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../utils/config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
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

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const decoded = decodeJWT(token);
      const response = await fetch(
        `${BASE_URL}/api/tasks/user/${decoded.userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getMarkedDates = () => {
    const marked = {};
    tasks.forEach((task) => {
      const dateStr = dayjs.utc(task.due_date).local().format("YYYY-MM-DD");
      if (dateStr) {
        marked[dateStr] = {
          selected: true,
          selectedColor: Colors.primary,
        };
      }
    });
    if (selectedDate) {
      marked[selectedDate] = {
        ...(marked[selectedDate] || {}),
        selected: true,
        selectedColor: Colors.primary,
      };
    }
    return marked;
  };

  const filteredTasks = tasks.filter(
  (task) =>
    dayjs.utc(task.due_date).local().format("YYYY-MM-DD") === selectedDate
);

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
        <Text style={styles.heading}>Calendar</Text>

        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={getMarkedDates()}
          theme={{
            selectedDayTextColor: "#fff",
            todayTextColor: Colors.primary,
          }}
        />

        <Text style={styles.subHeading}>Tasks on {selectedDate || "..."}</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : filteredTasks.length === 0 ? (
          <Text style={styles.noTaskText}>No tasks for this date.</Text>
        ) : (
          filteredTasks.map((task) => (
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

      <Footer activeTab="calendar" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    paddingHorizontal: 35,
    paddingTop: 120,
    backgroundColor: Colors.bg,
  },
  listContainer: {
    paddingHorizontal: 35,
    paddingBottom: 20,
    backgroundColor: Colors.bg,
  },
  heading: {
    fontSize: 26,
    fontFamily: Fonts.heading,
    color: Colors.primary,
    marginBottom: 30,
    textAlign: "center",
  },
  subHeading: {
    fontSize: 16,
    fontFamily: Fonts.subheading,
    marginTop: 55,
    marginBottom: 10,
    color: Colors.primary,
  },
  calendar: {
    borderRadius: 22,
    elevation: 2,
    backgroundColor: "#fff",
    padding: 50,
  },
  taskCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 15,
  },
  taskTitle: {
    fontSize: 15,
    fontFamily: Fonts.subheading,
    color: "#333",
  },
  noTaskText: {
    fontSize: 14,
    fontFamily: Fonts.subheading,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
});
