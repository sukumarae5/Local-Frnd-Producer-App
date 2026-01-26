// src/navigation/ReceiverHomeTabs.js
import React from "react";
import { TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import ReciverHomeScreen from "../screens/ReciverHomeScreen";
// import ChatScreen from "../screens/ChatScreen";
import RecentsCallHistoryScreen from "../screens/RecentsCallHistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const CallTabButton = ({ children, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    style={{
      top: -25,
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: "#ff2fd2",
      justifyContent: "center",
      alignItems: "center",
      elevation: 10,
      shadowColor: "#ff2fd2",
      shadowOpacity: 0.4,
      shadowRadius: 6,
    }}
  >
    {children}
  </TouchableOpacity>
);

const ReceiverBottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 68,
          backgroundColor: "#120020",
          borderTopColor: "#2e0040",
        },
      }}
    >
      {/* 🏠 HOME */}
      <Tab.Screen
        name="Home"
        component={ReciverHomeScreen}
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

      {/* 💬 CHAT */}
      {/* <Tab.Screen
        name="Chat"
        // component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={26}
              color={focused ? "#ff2fd2" : "#aaa"}
            />
          ),
        }}
      /> */}

      {/* 📞 CENTER CALL */}
      <Tab.Screen
        name="Call"
        component={ReciverHomeScreen}
        options={{
          tabBarButton: (props) => (
            <CallTabButton {...props}>
              <Ionicons name="call" size={30} color="#fff" />
            </CallTabButton>
          ),
        }}
      />

      {/* 🕘 RECENTS */}
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

      {/* 👩 PROFILE (Female Icon) */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="woman-outline"
              size={26}
              color={focused ? "#ff2fd2" : "#aaa"}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ReceiverBottomTabs;
