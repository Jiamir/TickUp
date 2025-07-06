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
import { BASE_URL } from "../utils/config";

const RegisterScreen = ({ navigation }) => {
  const initialValues = {
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .matches(/^[A-Za-z\s]+$/, "Only letters and spaces are allowed")
      .required("Full name is required"),

    email: Yup.string()
      .email("Enter a valid email (e.g. example@mail.com)")
      .required("Email is required"),

    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords do not match")
      .required("Confirm your password"),
  });

  const handleRegister = async (values) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/register`,
        values
      );

      // If registration is successful
      console.log("Register Success:", response.data);
      navigation.replace("Home");
    } catch (error) {
      console.error("Register Error:", error.response?.data || error.message);
      alert("Registration failed. Try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.heading}>Sign Up</Text>
      <Text style={styles.subtext}>
        Create your account and manage your day the smart way.
      </Text>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleRegister}
      >
        {({ handleChange, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <InputField
              placeholder="Full Name"
              value={values.full_name}
              onChangeText={handleChange("full_name")}
              error={touched.full_name && errors.full_name}
            />
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
            <InputField
              placeholder="Confirm Password"
              value={values.confirmPassword}
              onChangeText={handleChange("confirmPassword")}
              error={touched.confirmPassword && errors.confirmPassword}
              secure
            />

            <PrimaryButton
              title="Register"
              onPress={handleSubmit}
              width={160}
              height={50}
            />

            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>
                Already have an account? Log In
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
  loginLink: {
    color: "#6e6e6e",
    marginTop: 20,
    textAlign: "center",
    fontFamily: Fonts.subheading,
  },
});

export default RegisterScreen;
