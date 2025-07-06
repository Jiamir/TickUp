// UpdateTaskScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  StyleSheet,
  Switch,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import Footer from "../components/Footer";
import { Colors } from "../utils/colors";
import { Fonts } from "../utils/fonts";
import axios from "axios";
import { BASE_URL } from "../utils/config";

export default function UpdateScreen({ route, navigation }) {
  const { task } = route.params;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [date, setDate] = useState(
    task.due_date ? new Date(task.due_date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [category, setCategory] = useState(task.category || "Work");
  const [isCompleted, setIsCompleted] = useState(
    task.isCompleted ?? task.is_completed ?? false
  );
  // ✅ Add this here
  useEffect(() => {
    console.log("Task received:", task);
  }, []);
  const handleUpdateTask = async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/tasks/update/${task.id}`,
        {
          title,
          description,
          dueDate: date.toLocaleDateString("en-CA"), // returns YYYY-MM-DD in local timezone
          priority,
          status,
          category,
          isCompleted,
        }
      );

      alert("Task updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error(
        "Update task error:",
        error.response?.data || error.message
      );
      alert("Failed to update task");
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Update Task</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Title</Text>
          <InputField
            placeholder="Update Title"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Description</Text>
          <InputField
            placeholder="Update Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerButton}
          >
            <Ionicons name="calendar-outline" size={20} color="#555" />
            <Text style={styles.dateText}>{date.toDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          <Text style={styles.label}>Priority</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={priority}
              onValueChange={setPriority}
              style={styles.picker}
            >
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="High" value="High" />
            </Picker>
          </View>

          <Text style={styles.label}>Status</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={status}
              onValueChange={setStatus}
              style={styles.picker}
            >
              <Picker.Item label="To Do" value="To Do" />
              <Picker.Item label="In Progress" value="In Progress" />
              <Picker.Item label="Done" value="Done" />
            </Picker>
          </View>

          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
            >
              <Picker.Item label="Work" value="Work" />
              <Picker.Item label="Personal" value="Personal" />
              <Picker.Item label="Learning" value="Learning" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Mark as Completed</Text>
            <Switch value={isCompleted} onValueChange={setIsCompleted} />
          </View>

          <PrimaryButton
            title="Update Task"
            onPress={handleUpdateTask}
            width={180}
            height={50}
            style={{ marginTop: -10 }}
          />
        </View>
      </ScrollView>
      <Footer activeTab="plus" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    paddingHorizontal: 35,
    backgroundColor: Colors.bg,
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 26,
    color: Colors.primary,
    fontFamily: Fonts.heading,
    marginTop: 70,
    marginBottom: 30,
    lineHeight: 20,
    textAlign: "center",
  },
  form: {
    width: "100%",
    alignItems: "center",
  },
  label: {
    alignSelf: "flex-start",
    marginLeft: 5,
    marginTop: 3,
    marginBottom: 5,
    fontSize: 13,
    color: "#444",
    fontFamily: Fonts.subheading,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  dateText: {
    marginLeft: 10,
    color: "#333",
    fontSize: 14,
  },
  pickerWrapper: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 5,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 54,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    paddingVertical: 10,
  },
});
