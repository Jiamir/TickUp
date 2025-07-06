import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import TaskCard from "../components/TaskCard";
import Footer from "../components/Footer";
import TaskDashboard from "../components/TaskDashboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../utils/colors";
import { Fonts } from "../utils/fonts";
import { BASE_URL } from "../utils/config";

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

const HomeScreen = () => {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState({
    completed: 0,
    pending: 0,
    overdue: 0,
    today: 0,
    total: 0,
  });
  const [nearestTask, setNearestTask] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) throw new Error("Missing token");

        const decoded = decodeJWT(token);
        const userId = decoded?.userId;
        if (!userId) throw new Error("Invalid user");

        const userRes = await fetch(`${BASE_URL}/api/auth/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        setUserName(userData.user?.full_name || "User");

        const taskRes = await fetch(`${BASE_URL}/api/tasks/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const taskData = await taskRes.json();

        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];

        const stats = {
          completed: 0,
          pending: 0,
          overdue: 0,
          today: 0,
          total: taskData.tasks.length,
        };

        const upcoming = [];

        taskData.tasks.forEach((task) => {
          const dueDate = new Date(task.due_date);
          const dueStr = task.due_date.split("T")[0];

          if (task.status === "Done") stats.completed += 1;
          else stats.pending += 1;

          if (dueStr === todayStr) stats.today += 1;
          if (dueDate < now && task.status !== "Done") stats.overdue += 1;

          if (dueDate > now && task.status !== "Done") {
            upcoming.push({ ...task, dueDate });
          }
        });

        const nextTask = upcoming.sort((a, b) => a.dueDate - b.dueDate)[0];
        if (nextTask) setNearestTask(nextTask);

        setTaskStats(stats);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load home data. Please login again.");
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

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

  const completionPercent =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

  const taskCards = [
    {
      title: "Tasks Completed",
      value: taskStats.completed,
    },
    { title: "Pending Tasks", value: taskStats.pending },
    { title: "Overdue Tasks", value: taskStats.overdue },
    { title: "New Tasks Today", value: taskStats.today },
  ];

  return (
    <View style={styles.wrapper}>
      <Image
        source={require("../assets/images/Circle.png")}
        style={styles.backgroundCircle}
      />

      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Welcome, {userName.split(" ")[0]}</Text>
        <Text style={styles.subtext}>Let’s make today productive.</Text>

        <View style={styles.progressCard}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Task Completion</Text>
            <Text style={styles.progressPercent}>{completionPercent}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${completionPercent}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Overview</Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.subheading,
              color: "#555",
              marginTop: -6,
              marginBottom: 20,
              marginLeft: 2,
            }}
          >
            Make purpose and clarity in your day
          </Text>
          <View style={styles.cardsContainer}>
            {taskCards.map((item, index) => (
              <TaskDashboard
                key={index}
                title={item.title}
                value={item.value}
              />
            ))}
          </View>
        </View>

        {nearestTask && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Focus</Text>
            <TaskCard
              title={nearestTask.title}
              description={nearestTask.description}
              dueDate={nearestTask.due_date}
              priority={nearestTask.priority}
              status={nearestTask.status}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today’s Tip</Text>
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              “Small consistent efforts lead to big results. Plan, prioritize,
              and execute.”
            </Text>
          </View>
        </View>
      </ScrollView>
      <Footer activeTab="home" />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  backgroundCircle: {
    position: "absolute",
    width: 300,
    height: 450,
    top: 30,
    right: -10,
  },

  scrollContent: {
    paddingTop: 90,
    paddingHorizontal: 40,
    paddingBottom: 10,
  },
  heading: {
    fontSize: 24,
    fontFamily: Fonts.heading,
    color: Colors.primary,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
    fontFamily: Fonts.subheading,
    color: "#666",
    marginBottom: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.heading,
    color: Colors.primary,
    marginBottom: 10,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  highlightBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  focusTitle: {
    fontSize: 16,
    fontFamily: Fonts.heading,
    color: Colors.primary,
    marginBottom: 6,
  },
  focusDesc: {
    fontSize: 13,
    fontFamily: Fonts.subheading,
    color: "#555",
    marginBottom: 6,
  },
  focusMeta: {
    fontSize: 12,
    color: "#777",
  },
  tipBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  tipText: {
    fontSize: 13,
    fontFamily: Fonts.subheading,
    color: "#555",
  },

  progressContainer: {
    marginBottom: 24,
    marginTop: 18,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 16,
    fontFamily: Fonts.heading,
    color: Colors.primary,
  },
  progressPercent: {
    fontSize: 14,
    fontFamily: Fonts.subheading,
    color: Colors.primary,
  },
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 18,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  progressBarBackground: {
    height: 15,
    backgroundColor: "#eee",
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#C0C5CC",
  },
  progressBarFill: {
    height: 15,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
});

export default HomeScreen;
