// src/App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './src/reduxStore/store';
import { CommonActions } from '@react-navigation/native';
import SocketProvider from './src/socket/SocketProvider';
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import PhoneScreen from './src/screens/PhoneScreen';
import OtpScreen from './src/screens/OtpScreen';
import HomeScreen from './src/screens/HomeScreen';
import GenderScreen from './src/screens/GenderScreen';
import UserScreen from './src/screens/UserScreen';
import DobGenderScreen from './src/screens/DateofBirth';
import LocationScreen from './src/screens/LocationScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PlanScreen from './src/screens/PlansScreen';
import UplodePhotoScreen from './src/screens/UplodePhotoScreen';
import VideocallScreen from './src/screens/VideocallScreen';
import AudiocallScreen from './src/screens/AudiocallScreen';
import GirlsavatarScreen from './src/screens/GirlsavatarScreen';
import BoysavatarScreen from './src/screens/BoysavatarScreen';
import ChoosePlanScreen from './src/screens/ChoosePlanScreen';
import OnboardScreen from './src/screens/OnboardScreen';
import LanguageScreen from './src/screens/LanguageScreen';
import ReciverHomeScreen from './src/screens/ReciverHomeScreen';
import WelcomeScreen02 from './src/screens/WelcomeScreen02';
import WelcomeScreen03 from './src/screens/WelcomeScreen03';
import SelectYourCountryScreen from './src/screens/SelectYourCountryScreen';
import InterestScreen from './src/screens/InterestScreen';
import SelectYourIdealMatchScreen from './src/screens/SelectYourIdealMatchScreen';
import FillYourProfileScreen from './src/screens/FillYourProfileScreen';
import LifeStyleScreen from './src/screens/LifeStyleScreen';
import AddYourPhotosScreen from './src/screens/AddYourPhotosScreen';
import RecentsCallHistoryScreen from './src/screens/RecentsCallHistoryScreen';
import MaleHomeTabs from './src/navigation/MaleHomeTabs';
import MessagesScreen from './src/screens/MessagesScreen';
import ReceiverBottomTabs from './src/navigation/ReceiverBottomTabs';
import FriendRequestsScreen from './src/screens/FriendRequestsScreen';
import AboutScreen from './src/screens/AboutScreen';
import ChatScreen from './src/screens/ChatScreen';
import StoriesScreen from './src/screens/StoriesScreen';
import CallStatusScreen from './src/screens/CallStatusScreen';
import PerfectMatchScreen from './src/screens/PerfectMatchScreen';
import SettingScreen from './src/screens/SettingScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import EditUserInterestScreen from './src/screens/EditUserInterestScreen';
import EditUserLifestyleScreen from './src/screens/EditUserLifestyleScreen';
import EditUserGeneralInfoScreen from './src/screens/EditUserGeneralInfoScreen';
import EndCallConfirmModal from './src/screens/EndCallConfirmationScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import HelpCenterScreen from './src/screens/HelpCenterScreen';
import ReciverWalletScreen from './src/screens/ReciverWalletScreen';
import StoryViewer from "./src/screens/StoryViewer"
/* 
IMPORTANT
If you really navigate to IncomingCallScreen,
import it here also.
*/
import { useContext } from "react";
import { SocketContext } from "./src/socket/SocketProvider";
import IncomingCallScreen from './src/screens/IncomingCallScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreLogin } from './src/features/Auth/authAction';
import useCallHandler from './src/hooks/useCallHandler';
import GlobalIncomingCall from './src/components/GlobalIncomingCall';
import { useNavigationContainerRef } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

function MainNavigator({ navigationRef, isNavReady  }) {

 const { socketRef } = useContext(SocketContext);
  const call = useSelector(state => state.calls?.call);
  const token = useSelector(state => state.auth?.token);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem('twittoke');
      const userId = await AsyncStorage.getItem('user_id');
      const gender = await AsyncStorage.getItem("gender");

      console.log('🔑 APP TOKEN:', token,userId,gender);

      if (token) {
        dispatch(
          restoreLogin({
            token: token,
            user: { user_id: userId }, // minimal user
          }),
        );
      }

      setLoading(false);
    };

    init();
  }, []);
 useCallHandler(navigationRef,isNavReady );


  return (
    <Stack.Navigator
      initialRouteName={token ? 'ReceiverBottomTabs' : 'Landing'}
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
      <Stack.Screen
        name="SelectYourCountryScreen"
        component={SelectYourCountryScreen}
      />
      <Stack.Screen name="InterestScreen" component={InterestScreen} />
      <Stack.Screen
        name="SelectYourIdealMatchScreen"
        component={SelectYourIdealMatchScreen}
      />
      <Stack.Screen
        name="FillYourProfileScreen"
        component={FillYourProfileScreen}
      />
      <Stack.Screen name="LifeStyleScreen" component={LifeStyleScreen} />
      <Stack.Screen
        name="AddYourPhotosScreen"
        component={AddYourPhotosScreen}
      />
      <Stack.Screen
        name="RecentsCallHistoryScreen"
        component={RecentsCallHistoryScreen}
      />
      <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
      <Stack.Screen name="MaleHomeTabs" component={MaleHomeTabs} />
      <Stack.Screen name="ReceiverBottomTabs" component={ReceiverBottomTabs} />
      <Stack.Screen name="AboutScreen" component={AboutScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="StoriesScreen" component={StoriesScreen} />
      <Stack.Screen name="CallStatusScreen" component={CallStatusScreen} />
      <Stack.Screen
        name="EndCallConfirmModal"
        component={EndCallConfirmModal}
      />
      <Stack.Screen name="PerfectMatchScreen" component={PerfectMatchScreen} />
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="EditUserInterestScreen"component={EditUserInterestScreen} />
      <Stack.Screen name="EditUserLifestyleScreen"component={EditUserLifestyleScreen}/>
      <Stack.Screen name="EditUserGeneralInfoScreen" component={EditUserGeneralInfoScreen}/>
      <Stack.Screen name="NotificationScreen"component={NotificationScreen}/>
      <Stack.Screen name="FriendRequestsScreen" component={FriendRequestsScreen}/>
      <Stack.Screen name="IncomingCallScreen" component={IncomingCallScreen}/>
      <Stack.Screen name="HelpCenterScreen" component={HelpCenterScreen}/>
      <Stack.Screen name="ReciverWalletScreen" component={ReciverWalletScreen}/>
      <Stack.Screen name="StoryViewer" component={StoryViewer} />
      </Stack.Navigator>
  );
}

export default function App() {

  const navigationRef = useNavigationContainerRef();
const [isNavReady, setIsNavReady] = useState(false);
  return (
    <Provider store={store}>
      <SocketProvider>
        <NavigationContainer ref={navigationRef}  onReady={() => {
    console.log("✅ NAVIGATION READY");
    setIsNavReady(true);
  }}>
          <MainNavigator navigationRef={navigationRef} isNavReady={isNavReady}/>
          <GlobalIncomingCall navigationRef={navigationRef} />
        </NavigationContainer>
      </SocketProvider>
    </Provider>
  );
}
