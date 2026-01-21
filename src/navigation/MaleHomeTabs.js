// src/navigation/MaleHomeTabs.js
import React from "react";
import { TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import HomeScreen from "../screens/HomeScreen";
import MessagesScreen from "../screens/MessagesScreen";
import TrainersCallpage from "../screens/TrainersCallpage";
import RecentsCallHistoryScreen from "../screens/RecentsCallHistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

/* 🔥 CENTER CALL BUTTON */
const CallTabButton = ({ children, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      top: -20,
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: "#ff00ff",
      justifyContent: "center",
      alignItems: "center",
      elevation: 8,
    }}
  >
    {children}
  </TouchableOpacity>
);

const MaleHomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 64,
          backgroundColor: "#120020",
          borderTopColor: "#2e0040",
        },
      }}
    >
      {/* 🏠 HOME */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="home-outline"
              size={26}
              color={focused ? "#ff2fd2" : "#aaa"}
            />
          ),
        }}
      />

      {/* 💬 MESSAGES */}
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="chatbubble-outline"
              size={26}
              color={focused ? "#ff2fd2" : "#aaa"}
            />
          ),
        }}
      />

      {/* 📞 CENTER CALL */}
      <Tab.Screen
        name="Call"
        component={TrainersCallpage}
        options={{
          tabBarButton: (props) => (
            <CallTabButton {...props}>
              <Ionicons name="call" size={30} color="#fff" />
            </CallTabButton>
          ),
        }}
      />

      {/* 🕒 RECENTS (ONLY ONCE ✅) */}
      <Tab.Screen
        name="Recents"
        component={RecentsCallHistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="time-outline"
              size={26}
              color={focused ? "#ff2fd2" : "#aaa"}
            />
          ),
        }}
      />

      {/* 👤 PROFILE */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="person-outline"
              size={26}
              color={focused ? "#ff2fd2" : "#aaa"}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MaleHomeTabs;
