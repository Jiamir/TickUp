import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

// SVG imports (adjust paths if needed)
import HomeIcon from "../assets/icons/home.svg";
import HomeActiveIcon from "../assets/icons/active_home.svg";
import CalendarIcon from "../assets/icons/calender.svg";
import CalendarActiveIcon from "../assets/icons/active_calender.svg";
import PlusIcon from "../assets/icons/plus.svg";
import PlusActiveIcon from "../assets/icons/active_plus.svg";
import BellIcon from "../assets/icons/task.svg";
import BellActiveIcon from "../assets/icons/active_task.svg";
import ProfileIcon from "../assets/icons/profile.svg";
import ProfileActiveIcon from "../assets/icons/active_profile.svg";

const Footer = ({ activeTab }) => {
  const navigation = useNavigation();

  const tabs = [
    {
      name: "home",
      screen: "Home",
      icon: HomeIcon,
      activeIcon: HomeActiveIcon,
    },
    {
      name: "calendar",
      screen: "Calendar",
      icon: CalendarIcon,
      activeIcon: CalendarActiveIcon,
    },
    {
      name: "plus",
      screen: "AddTask",
      icon: PlusIcon,
      activeIcon: PlusActiveIcon,
    },
    {
      name: "task",
      screen: "Task",
      icon: BellIcon,
      activeIcon: BellActiveIcon,
    },
    {
      name: "profile",
      screen: "Profile",
      icon: ProfileIcon,
      activeIcon: ProfileActiveIcon,
    },
  ];

  const handlePress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.footer}>
        {tabs.map(({ name, screen, icon, activeIcon }) => {
          const IconComponent = activeTab === name ? activeIcon : icon;
          return (
            <TouchableOpacity
              key={name}
              onPress={() => handlePress(screen)}
              style={styles.iconWrapper}
            >
              {React.createElement(IconComponent, { width: 26, height: 26 })}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F6F7FF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FfFfFF",
    paddingVertical: 12,
    borderColor: "#ccc",
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    bottom:-15,
  },
  iconWrapper: {
    padding: 6,
  },
});

export default Footer;
