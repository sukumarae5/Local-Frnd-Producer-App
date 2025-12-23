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
import GenderScreen from './src/screens/GenderScreen'
import UserScreen from './src/screens/UserScreen'
import DobGenderScreen from './src/screens/DateofBirth';
import LocationScreen from "./src/screens/LocationScreen"
import ProfileScreen from "./src/screens/ProfileScreen"
import PlanScreen from "./src/screens/PlansScreen"
import UplodePhotoScreen from './src/screens/UplodePhotoScreen';
import TrainersCallpage from './src/screens/TrainersCallpage';
import VideocallCsreen from './src/screens/VideocallCsreen';
import AudiocallScreen from './src/screens/AudiocallScreen';
import GirlsavatarScreen from './src/screens/GirlsavatarScreen';
import BoysavatarScreen from './src/screens/BoysavatarScreen';
import ChoosePlanScreen from './src/screens/ChoosePlanScreen';
import OnboardScreen from './src/screens/OnboardScreen'
import LanguageScreen from './src/screens/LanguageScreen'
import ReciverHomeScreen from './src/screens/ReciverHomeScreen'
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
          <Stack.Screen name="DateofBirth" component={DobGenderScreen} />
          <Stack.Screen name="GenderScreen" component={GenderScreen} />
          <Stack.Screen name="UserScreen" component={UserScreen} />
          <Stack.Screen name="LocationScreen" component={LocationScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="PlanScreen" component={PlanScreen} />
        <Stack.Screen name="UplodePhotoScreen" component={UplodePhotoScreen} />
 <Stack.Screen name="TrainersCallpage" component={TrainersCallpage} />    
  <Stack.Screen name="VideocallCsreen" component={VideocallCsreen} />    
    <Stack.Screen name="AudiocallScreen" component={AudiocallScreen} />    
<Stack.Screen name='OnboardScreen' component={OnboardScreen}/>
      <Stack.Screen name="GirlsavatarScreen" component={GirlsavatarScreen} />  
      <Stack.Screen name='BoysavatarScreen' component={BoysavatarScreen}/>
  <Stack.Screen name='ChoosePlanScreen' component={ChoosePlanScreen}/>
<Stack.Screen name='LanguageScreen' component={LanguageScreen}/>
<Stack.Screen name='ReciverHomeScreen' component={ReciverHomeScreen}/>

   </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
