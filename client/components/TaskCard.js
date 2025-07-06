import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../utils/colors";
import { Fonts } from "../utils/fonts";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";

export default function TaskCard({
  title,
  description,
  dueDate,
  priority,
  status,
  onEdit,
  onDelete,
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        onPress={() => setShowActions((prev) => !prev)}
        activeOpacity={0.85}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={[styles.status, statusStyles[status]]}>{status}</Text>
          </View>

          <Text style={styles.description}>{description}</Text>

          <View style={styles.footer}>
            <Text style={styles.dueDate}>
              Due: {dayjs(dueDate).format("DD-MM-YYYY")}
            </Text>

            <View style={[styles.priorityBadge, priorityStyles[priority]]}>
              <Text style={styles.priorityText}>{priority}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
            <Ionicons name="pencil" size={18} color="#0557A0" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
            <Ionicons name="trash" size={18} color="#0557A0" />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const statusStyles = {
  "To Do": { color: "#FF6F61" },
  "In Progress": { color: "#007AFF" },
  Done: { color: "#4CAF50" },
};

const priorityStyles = {
  Low: { backgroundColor: "#d3f9d8" },
  Medium: { backgroundColor: "#fff3cd" },
  High: { backgroundColor: "#f8d7da" },
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: "100%",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.heading,
    color: Colors.primary,
    flexShrink: 1,
  },
  status: {
    fontSize: 12,
    fontFamily: Fonts.subheading,
    fontWeight: "600",
    alignSelf: "center",
  },
  description: {
    fontSize: 12,
    fontFamily: Fonts.subheading,
    color: "#666",
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dueDate: {
    fontSize: 12,
    fontFamily: Fonts.subheading,
    color: "#999",
  },
  priorityBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
  },
    actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    gap: 12,
  },
  actionBtn: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  paddingHorizontal: 10,
  paddingVertical: 6,
  backgroundColor: "#FFFFFF",
  borderRadius: 8,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3, // for Android
},
  actionText: {
    fontSize: 13,
    fontFamily: Fonts.subheading,
    color: Colors.primary, // deep blue for text to match brand
  },

});
