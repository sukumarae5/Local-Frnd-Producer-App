// src/App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';

// Store
import store from './src/reduxStore/store';

// Screens
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import PhoneScreen from './src/screens/PhoneScreen';
import OtpScreen from './src/screens/OtpScreen';
import HomeScreen from './src/screens/HomeScreen';
import DateofBirth from './src/screens/DateofBirth';
import GenderScreen from './src/screens/GenderScreen';
import UserScreen from './src/screens/UserScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Landing"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Phone" component={PhoneScreen} />
          <Stack.Screen name="Otp" component={OtpScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="DateofBirth" component={DateofBirth} />
          <Stack.Screen name="GenderScreen" component={GenderScreen} />
          <Stack.Screen name="UserScreen" component={UserScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
