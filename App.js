// src/App.js
import React, { useEffect } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider, useSelector } from "react-redux";
import store from "./src/reduxStore/store";
import SocketProvider from "./src/socket/SocketProvider";
import LandingScreen from "./src/screens/LandingScreen";
import LoginScreen from "./src/screens/LoginScreen";
import PhoneScreen from "./src/screens/PhoneScreen";
import OtpScreen from "./src/screens/OtpScreen";
import HomeScreen from "./src/screens/HomeScreen";
import GenderScreen from "./src/screens/GenderScreen";
import UserScreen from "./src/screens/UserScreen";
import DobGenderScreen from "./src/screens/DateofBirth";
import LocationScreen from "./src/screens/LocationScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import PlanScreen from "./src/screens/PlansScreen";
import UplodePhotoScreen from "./src/screens/UplodePhotoScreen";
import VideocallScreen from "./src/screens/VideocallScreen";
import AudiocallScreen from "./src/screens/AudiocallScreen";
import GirlsavatarScreen from "./src/screens/GirlsavatarScreen";
import BoysavatarScreen from "./src/screens/BoysavatarScreen";
import ChoosePlanScreen from "./src/screens/ChoosePlanScreen";
import OnboardScreen from "./src/screens/OnboardScreen";
import LanguageScreen from "./src/screens/LanguageScreen";
import ReciverHomeScreen from "./src/screens/ReciverHomeScreen";
import WelcomeScreen02 from "./src/screens/WelcomeScreen02";
import WelcomeScreen03 from "./src/screens/WelcomeScreen03";
import SelectYourCountryScreen from "./src/screens/SelectYourCountryScreen";
import InterestScreen from "./src/screens/InterestScreen";
import SelectYourIdealMatchScreen from "./src/screens/SelectYourIdealMatchScreen";
import FillYourProfileScreen from "./src/screens/FillYourProfileScreen";
import LifeStyleScreen from "./src/screens/LifeStyleScreen";
import AddYourPhotosScreen from "./src/screens/AddYourPhotosScreen";
import RecentsCallHistoryScreen from "./src/screens/RecentsCallHistoryScreen";
import MaleHomeTabs from "./src/navigation/MaleHomeTabs";
import MessagesScreen from "./src/screens/MessagesScreen";
import ReceiverBottomTabs from "./src/navigation/ReceiverBottomTabs";
import FriendRequestsScreen from "./src/screens/FriendRequestsScreen";
import AboutScreen from "./src/screens/AboutScreen";
import ChatScreen from "./src/screens/ChatScreen";
import StoriesScreen from "./src/screens/StoriesScreen";
import CallStatusScreen from "./src/screens/CallStatusScreen";
import PerfectMatchScreen from "./src/screens/PerfectMatchScreen";
import SettingScreen from "./src/screens/SettingScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import EditUserInterestScreen from "./src/screens/EditUserInterestScreen";
import EditUserLifestyleScreen from "./src/screens/EditUserLifestyleScreen";
import EditUserGeneralInfoScreen from "./src/screens/EditUserGeneralInfoScreen";
import EndCallConfirmModal from "./src/screens/EndCallConfirmationScreen";
import NotificationScreen from "./src/screens/NotificationScreen";
import HelpCenterScreen from"./src/screens/HelpCenterScreen"
/* 
IMPORTANT
If you really navigate to IncomingCallScreen,
import it here also.
*/
 import IncomingCallScreen from "./src/screens/IncomingCallScreen";

const Stack = createNativeStackNavigator();

function MainNavigator() {
  const navigation = useNavigation();

  const call = useSelector((state) => state.calls?.call);

useEffect(() => {
  if (!call) return;

  // ✅ only chat calls can open accept / reject screen
  if (
    call.direction === "INCOMING" &&
    call.status === "RINGING" &&
    call.is_friend === true

  ) {
    navigation.navigate("IncomingCallScreen", {
      session_id: call.session_id,
      call_type: call.call_type,
      fromUser: call.from_user
    });
  }
}, [call]);


  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{ headerShown: false }} >
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
      <Stack.Screen name="VideocallScreen" component={VideocallScreen} />
      <Stack.Screen name="AudiocallScreen" component={AudiocallScreen} />
      <Stack.Screen name="OnboardScreen" component={OnboardScreen} />
      <Stack.Screen name="GirlsavatarScreen" component={GirlsavatarScreen} />
      <Stack.Screen name="BoysavatarScreen" component={BoysavatarScreen} />
      <Stack.Screen name="ChoosePlanScreen" component={ChoosePlanScreen} />
      <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
      <Stack.Screen name="ReciverHomeScreen" component={ReciverHomeScreen} />
      <Stack.Screen name="WelcomeScreen02" component={WelcomeScreen02} />
      <Stack.Screen name="WelcomeScreen03" component={WelcomeScreen03} />
      <Stack.Screen name="SelectYourCountryScreen" component={SelectYourCountryScreen}/>
      <Stack.Screen name="InterestScreen" component={InterestScreen} />
      <Stack.Screen name="SelectYourIdealMatchScreen"component={SelectYourIdealMatchScreen}/>
      <Stack.Screen name="FillYourProfileScreen"component={FillYourProfileScreen}/>
      <Stack.Screen name="LifeStyleScreen" component={LifeStyleScreen} />
      <Stack.Screen name="AddYourPhotosScreen"component={AddYourPhotosScreen}/>
      <Stack.Screen name="RecentsCallHistoryScreen"component={RecentsCallHistoryScreen}/>
      <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
      <Stack.Screen name="MaleHomeTabs" component={MaleHomeTabs} />
      <Stack.Screen name="ReceiverBottomTabs"component={ReceiverBottomTabs}/>
      <Stack.Screen name="AboutScreen" component={AboutScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="StoriesScreen" component={StoriesScreen} />
      <Stack.Screen name="CallStatusScreen" component={CallStatusScreen} />
      <Stack.Screen name="EndCallConfirmModal" component={EndCallConfirmModal}/>
      <Stack.Screen name="PerfectMatchScreen"component={PerfectMatchScreen}/>
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="EditUserInterestScreen"component={EditUserInterestScreen} />
      <Stack.Screen name="EditUserLifestyleScreen"component={EditUserLifestyleScreen}/>
      <Stack.Screen name="EditUserGeneralInfoScreen" component={EditUserGeneralInfoScreen}/>
      <Stack.Screen name="NotificationScreen"component={NotificationScreen}/>
      <Stack.Screen name="FriendRequestsScreen" component={FriendRequestsScreen}/>
      <Stack.Screen name="IncomingCallScreen" component={IncomingCallScreen}/>
      <Stack.Screen name="HelpCenterScreen" component={HelpCenterScreen}/>
      </Stack.Navigator>
  );
}
export default function App() {
  return (
    <Provider store={store}>
      <SocketProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </SocketProvider>
    </Provider>
  );
}