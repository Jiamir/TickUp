import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const InputField = ({
  placeholder,
  value,
  onChangeText,
  error,
  secure = false,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{ marginBottom: 10 }}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="gray"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure && !showPassword}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          focused ? styles.activeInput : styles.inactiveInput,
          error && styles.errorInput,
        ]}
      />

      {/* Password Eye Icon */}
      {secure && (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <MaterialCommunityIcons
            name={showPassword ? "eye-off" : "eye"}
            size={22}
            color="gray"
          />
        </TouchableOpacity>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    width: width - 80,
    height: 50,
    paddingHorizontal: 13,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    alignSelf: "center",
    fontSize: 15,
  },
  activeInput: {
    borderWidth: 2,
    borderColor: "#0557A0", // ✅ Confirmed Blue, not green
  },
  inactiveInput: {
    borderWidth: 1,
    borderColor: "gray",
  },
  errorInput: {
    borderColor: "red",
    borderWidth: 1.5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginLeft: 10,
  },
  eyeIcon: {
    position: "absolute",
    right: 20,
    top: 15,
  },
});

export default InputField;
