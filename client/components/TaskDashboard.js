import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../utils/colors";
import { Fonts } from "../utils/fonts";

const TaskDashboard = ({ title, value }) => {
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.colorBar} />
      <View style={styles.cardContent}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "47%",
    backgroundColor: "#fdfdfd",
    borderRadius: 16,
    padding: 16,
    marginBottom: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  colorBar: {
    width: 5,
    height: "100%",
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  value: {
    fontSize: 22,
    fontFamily: Fonts.heading,
    color: Colors.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    color: "#666",
    fontFamily: Fonts.subheading,
  },
});

export default TaskDashboard;
