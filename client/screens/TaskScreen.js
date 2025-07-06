import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentSort, setCurrentSort] = useState("deadline"); // deadline, priority, category, status
  const [currentFilter, setCurrentFilter] = useState("all"); // all, work, personal, learning, etc.

  // Get unique categories from tasks
  const getUniqueCategories = () => {
    const categories = tasks.map(task => task.category || "General").filter(Boolean);
    return [...new Set(categories)];
  };

  // Sort tasks based on selected criteria
  const sortTasks = (taskList, sortBy) => {
    const sorted = [...taskList];
    switch (sortBy) {
      case "deadline":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.due_date);
          const dateB = new Date(b.due_date);
          return dateA - dateB;
        });
      case "priority":
        const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
        return sorted.sort((a, b) => {
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        });
      case "category":
        return sorted.sort((a, b) => {
          const catA = a.category || "General";
          const catB = b.category || "General";
          return catA.localeCompare(catB);
        });
      case "status":
        return sorted.sort((a, b) => {
          const statusOrder = { "To Do": 1, "In Progress": 2, "Done": 3 };
          return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        });
      default:
        return sorted;
    }
  };

  // Filter tasks based on selected criteria
  const filterTasks = (taskList, filterBy) => {
    if (filterBy === "all") return taskList;
    if (filterBy === "overdue") {
      const now = new Date();
      return taskList.filter(task => {
        const dueDate = new Date(task.due_date);
        return dueDate < now && task.status !== "Done";
      });
    }
    if (filterBy === "today") {
      const today = new Date().toISOString().split('T')[0];
      return taskList.filter(task => {
        const taskDate = task.due_date.split('T')[0];
        return taskDate === today;
      });
    }
    if (filterBy === "pending") {
      return taskList.filter(task => task.status !== "Done");
    }
    if (filterBy === "completed") {
      return taskList.filter(task => task.status === "Done");
    }
    // Filter by category
    return taskList.filter(task => 
      (task.category || "General").toLowerCase() === filterBy.toLowerCase()
    );
  };

  // Apply sorting and filtering
  const applyFiltersAndSort = () => {
    let result = filterTasks(tasks, currentFilter);
    result = sortTasks(result, currentSort);
    setFilteredTasks(result);
  };

  // Update filtered tasks when tasks, sort, or filter changes
  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, currentSort, currentFilter]);

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

  const getSortDisplayText = () => {
    switch (currentSort) {
      case "deadline": return "Deadline";
      case "priority": return "Priority";
      case "category": return "Category";
      case "status": return "Status";
      default: return "Deadline";
    }
  };

  const getFilterDisplayText = () => {
    switch (currentFilter) {
      case "all": return "All Tasks";
      case "overdue": return "Overdue";
      case "today": return "Due Today";
      case "pending": return "Pending";
      case "completed": return "Completed";
      default: return currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);
    }
  };

  const sortOptions = [
    { value: "deadline", label: "Sort by Deadline", icon: "calendar-outline" },
    { value: "priority", label: "Sort by Priority", icon: "flag-outline" },
    { value: "category", label: "Sort by Category", icon: "folder-outline" },
    { value: "status", label: "Sort by Status", icon: "checkmark-circle-outline" },
  ];

  const filterOptions = [
    { value: "all", label: "All Tasks", icon: "list-outline" },
    { value: "overdue", label: "Overdue", icon: "warning-outline" },
    { value: "today", label: "Due Today", icon: "today-outline" },
    { value: "pending", label: "Pending", icon: "time-outline" },
    { value: "completed", label: "Completed", icon: "checkmark-done-outline" },
    ...getUniqueCategories().map(cat => ({
      value: cat,
      label: cat,
      icon: "folder-outline"
    }))
  ];

  return (
    <View style={styles.wrapper}>
      <Image
        source={require("../assets/images/Circle.png")}
        style={styles.backgroundCircle}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>My Tasks</Text>
        
        {/* Sort and Filter Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setSortModalVisible(true)}
          >
            <Text style={styles.sortText}>Sort by</Text>
            <View style={styles.sortValueContainer}>
              <Text style={styles.sortValue}>{getSortDisplayText()}</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.primary} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <MaterialCommunityIcons 
              name="filter-variant" 
              size={24} 
              color={Colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {/* Current Filter Display */}
        {currentFilter !== "all" && (
          <View style={styles.activeFilterContainer}>
            <Text style={styles.activeFilterText}>
              Showing: {getFilterDisplayText()}
            </Text>
            <TouchableOpacity onPress={() => setCurrentFilter("all")}>
              <Ionicons name="close-circle" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Text style={styles.noTasksText}>
            {currentFilter === "all" ? "No tasks found." : `No ${getFilterDisplayText().toLowerCase()} found.`}
          </Text>
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

      {/* Sort Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sortModalVisible}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort Tasks</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  currentSort === option.value && styles.selectedOption
                ]}
                onPress={() => {
                  setCurrentSort(option.value);
                  setSortModalVisible(false);
                }}
              >
                <Ionicons name={option.icon} size={20} color={Colors.primary} />
                <Text style={styles.modalOptionText}>{option.label}</Text>
                {currentSort === option.value && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSortModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Tasks</Text>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  currentFilter === option.value && styles.selectedOption
                ]}
                onPress={() => {
                  setCurrentFilter(option.value);
                  setFilterModalVisible(false);
                }}
              >
                <Ionicons name={option.icon} size={20} color={Colors.primary} />
                <Text style={styles.modalOptionText}>{option.label}</Text>
                {currentFilter === option.value && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Footer activeTab="task" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  backgroundCircle: {
    position: "absolute",
    width: 300,
    height: 450,
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
    marginBottom: 20,
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sortText: {
    fontSize: 14,
    color: "#666",
    fontFamily: Fonts.subheading,
    marginRight: 8,
  },
  sortValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortValue: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: Fonts.subheading,
    marginRight: 4,
  },
  filterButton: {
    padding: 8,
  },
  activeFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
    width: "100%",
  },
  activeFilterText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: Fonts.subheading,
  },
  noTasksText: {
    fontSize: 18,
    color: "#888",
    fontFamily: Fonts.subheading,
    marginTop: 50,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.heading,
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedOption: {
    backgroundColor: "#f0f0f0",
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: Fonts.subheading,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  modalCloseButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  modalCloseText: {
    fontSize: 16,
    fontFamily: Fonts.subheading,
    color: "white",
    textAlign: "center",
  },
});