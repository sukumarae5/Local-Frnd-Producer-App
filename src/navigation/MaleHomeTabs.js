import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";

import HomeScreen from "../screens/HomeScreen";
import MessagesScreen from "../screens/MessagesScreen";
import TrainersCallpage from "../screens/TrainersCallpage";
import RecentsCallHistoryScreen from "../screens/RecentsCallHistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const TabIcon = ({ focused, name }) => {
  // -------- initial (like your screenshot) --------
  if (!focused) {
    return (
      <Ionicons
        name={name}     // outline icon
        size={30}
        color="#D51BF9"
      />
    );
  }

  // -------- active (gradient ring + gradient bg) --------
  return (
    <LinearGradient
      colors={["#D51BF9", "#8C37F8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#ffffff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LinearGradient
          colors={["#D51BF9", "#8C37F8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name={name} size={20} color="#fff" />
        </LinearGradient>
      </View>
    </LinearGradient>
  );
};

const MaleHomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

       tabBarStyle: {
  position: "absolute",
  left: 40,
  right: 40,
  bottom: 20,
  height: 60,
  borderRadius: 30,
  backgroundColor: "#ffffff",
  borderTopWidth: 0,
  elevation: 8,
},

tabBarItemStyle: {
  justifyContent: "center",
  alignItems: "center",
  paddingTop: 10,
},


      }}
    >
      {/* HOME */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="home-outline" />
          ),
        }}
      />

      {/* MESSAGES */}
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="chatbubble-ellipses-outline" />
          ),
        }}
      />

      {/* CALL */}
      <Tab.Screen
        name="Call"
        component={TrainersCallpage}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="call-outline" />
          ),
        }}
      />

      {/* RECENTS */}
      <Tab.Screen
        name="Recents"
        component={RecentsCallHistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="time-outline" />
          ),
        }}
      />

      {/* PROFILE */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name="person-outline" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MaleHomeTabs;
