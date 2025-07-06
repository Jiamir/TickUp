import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { Colors } from "../utils/colors";
import { Fonts } from "../utils/fonts";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../utils/config";

const LoginScreen = ({ navigation }) => {
  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required"),

    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const handleLogin = async (values) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, values);

      // Save token for future use
      await AsyncStorage.setItem("token", response.data.token);
      await AsyncStorage.setItem("userId", response.data.user.id.toString());
      const savedUserId = await AsyncStorage.getItem("userId");
      console.log("Saved userId:", savedUserId);
      // Navigate to Home
      navigation.replace("Home");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.heading}>Log In</Text>
      <Text style={styles.subtext}>Welcome back! Let’s get things done.</Text>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
        validateOnBlur={true}
        validateOnChange={true}
      >
        {({ handleChange, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
        
            <InputField
              placeholder="Email"
              value={values.email}
              onChangeText={handleChange("email")}
              error={touched.email && errors.email}
            />
            <InputField
              placeholder="Password"
              value={values.password}
              onChangeText={handleChange("password")}
              error={touched.password && errors.password}
              secure
            />

            <PrimaryButton
              title="Log In"
              onPress={handleSubmit}
              width={160}
              height={50}
            />

            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.signupLink}>
                Don’t have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 35,
    backgroundColor: Colors.bg,
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 28,
    color: Colors.primary,
    fontFamily: Fonts.heading,
    marginTop: 12,
    marginBottom: 8,
    lineHeight: 34,
    textAlign: "center",
  },
  subtext: {
    fontSize: 14,
    color: "#022b4f",
    fontFamily: Fonts.subheading,
    marginTop: 10,
    marginBottom: 30,
    lineHeight: 24,
    textAlign: "center",
  },
  form: {
    width: "100%",
    alignItems: "center",
  },
  signupLink: {
    color: "#6e6e6e",
    marginTop: 20,
    textAlign: "center",
    fontFamily: Fonts.subheading,
  },
});

export default LoginScreen;
