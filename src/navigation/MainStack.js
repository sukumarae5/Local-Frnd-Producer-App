import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MaleHomeTabs from "./MaleHomeTabs";
import PlanScreen from "../screens/PlanScreen";

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      {/* Tabs (Bottom bar always visible) */}
      <Stack.Screen name="Tabs" component={MaleHomeTabs} />

      {/* Plan screen (NO TAB ICON, BUT TAB BAR VISIBLE) */}
      <Stack.Screen name="PlanScreen" component={PlanScreen} />

    </Stack.Navigator>
  );
};

export default MainStack;