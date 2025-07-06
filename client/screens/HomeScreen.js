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

// Helper function to calculate days until deadline
const getDaysUntilDeadline = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper function to get reminder text based on deadline proximity
const getDeadlineReminderText = (daysUntil) => {
  if (daysUntil < 0) return "Overdue";
  if (daysUntil === 0) return "Due Today";
  if (daysUntil === 1) return "Due Tomorrow";
  if (daysUntil <= 3) return `Due in ${daysUntil} days`;
  if (daysUntil <= 7) return `Due in ${daysUntil} days`;
  return `Due in ${daysUntil} days`;
};

// Helper function to get urgency level
const getUrgencyLevel = (daysUntil) => {
  if (daysUntil < 0) return "overdue";
  if (daysUntil === 0) return "critical";
  if (daysUntil <= 1) return "urgent";
  if (daysUntil <= 3) return "important";
  return "normal";
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
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [reminderAlerts, setReminderAlerts] = useState([]);

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
        const alerts = [];

        taskData.tasks.forEach((task) => {
          const dueDate = new Date(task.due_date);
          const dueStr = task.due_date.split("T")[0];
          const daysUntil = getDaysUntilDeadline(task.due_date);

          if (task.status === "Done") stats.completed += 1;
          else stats.pending += 1;

          if (dueStr === todayStr) stats.today += 1;
          if (dueDate < now && task.status !== "Done") stats.overdue += 1;

          // Add to upcoming tasks if not completed
          if (task.status !== "Done") {
            upcoming.push({ 
              ...task, 
              dueDate, 
              daysUntil,
              urgencyLevel: getUrgencyLevel(daysUntil),
              reminderText: getDeadlineReminderText(daysUntil)
            });

            // Create reminder alerts for urgent tasks
            if (daysUntil <= 1 && daysUntil >= 0) {
              alerts.push({
                taskTitle: task.title,
                reminderText: getDeadlineReminderText(daysUntil),
                urgencyLevel: getUrgencyLevel(daysUntil)
              });
            }
          }
        });

        // Sort upcoming tasks by deadline (nearest first)
        const sortedUpcoming = upcoming.sort((a, b) => a.dueDate - b.dueDate);
        setUpcomingTasks(sortedUpcoming.slice(0, 5)); // Show top 5 upcoming tasks
        
        const nextTask = sortedUpcoming[0];
        if (nextTask) setNearestTask(nextTask);

        setTaskStats(stats);
        setReminderAlerts(alerts);
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
        <Text style={styles.subtext}>Let's make today productive.</Text>

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

 {/* Reminder Alerts Section */}
        {reminderAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deadline Reminders</Text>
            {reminderAlerts.map((alert, index) => (
              <View key={index} style={[styles.reminderAlert, styles[alert.urgencyLevel]]}>
                <Text style={styles.reminderText}>
                  {alert.reminderText}: {alert.taskTitle}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Enhanced Upcoming Focus Section */}
        {upcomingTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Focus</Text>
            <Text style={styles.sectionSubtitle}>
              Your next {upcomingTasks.length} tasks by deadline
            </Text>
            {upcomingTasks.map((task, index) => (
              <View key={task.id} style={styles.upcomingTaskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={[styles.deadlineTag, styles[task.urgencyLevel]]}>
                    <Text style={styles.deadlineText}>
                      {task.reminderText}
                    </Text>
                  </View>
                </View>
                {task.description && (
                  <Text style={styles.taskDescription}>
                    {task.description.length > 60 
                      ? task.description.substring(0, 60) + "..." 
                      : task.description}
                  </Text>
                )}
                <View style={styles.taskMeta}>
                  <Text style={styles.taskCategory}>
                    {task.category || "General"}
                  </Text>
                  <Text style={styles.taskPriority}>
                    {task.priority} Priority
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Tip</Text>
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              "Small consistent efforts lead to big results. Plan, prioritize,
              and execute."
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
    top: 0,
    right: -10,
  },
  scrollContent: {
    paddingTop: 50,
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
    marginTop:0,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.subheading,
    color: "#666",
    marginBottom: 12,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  
  // Reminder Alert Styles
  reminderAlert: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  reminderText: {
    fontSize: 14,
    fontFamily: Fonts.subheading,
    fontWeight: "600",
  },
  
  // Urgency Level Styles
  overdue: {
    backgroundColor: "#ffebee",
    borderLeftColor: "#f44336",
  },
  critical: {
    backgroundColor: "#ffebee",
    borderLeftColor: "#f44336",
  },
  urgent: {
    backgroundColor: "#fff3e0",
    borderLeftColor: "#ff9800",
  },
  important: {
    backgroundColor: "#fff8e1",
    borderLeftColor: "#ffc107",
  },
  normal: {
    backgroundColor: "#e8f5e8",
    borderLeftColor: "#4caf50",
  },
  
  // Upcoming Task Card Styles
  upcomingTaskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: Fonts.heading,
    color: Colors.primary,
    flex: 1,
    marginRight: 12,
  },
  deadlineTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: "center",
  },
  deadlineText: {
    fontSize: 12,
    fontFamily: Fonts.subheading,
    fontWeight: "600",
    color: "#333",
  },
  taskDescription: {
    fontSize: 14,
    fontFamily: Fonts.subheading,
    color: "#666",
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskCategory: {
    fontSize: 12,
    fontFamily: Fonts.subheading,
    color: "#777",
  },
  taskPriority: {
    fontSize: 12,
    fontFamily: Fonts.subheading,
    color: "#777",
  },
  
  // Existing styles
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
    marginTop: 0,
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