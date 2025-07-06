import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Colors } from "../utils/colors";
import { Fonts } from "../utils/fonts";

const PrimaryButton = ({
  title,
  onPress,
  width = 200,
  height = 50,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, { width, height }, style]}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    marginTop: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.subheading,
  },
});

export default PrimaryButton;
