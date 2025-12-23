import React, { useEffect } from "react";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MAIN_BASE_URL } from "../api/baseUrl1";


// Replace with backend laptop IP
const socket = io("MAIN_BASE_URL");

const UserStatusScreen = () => {

  useEffect(() => {
    const setupSocket = async () => {
      // get user id
      const user_id = await AsyncStorage.getItem("user_id");
      console.log("MY USER ID:", user_id);

      // send user id to backend
      socket.emit("user_online", user_id); 
      console.log("Sent to server:", user_id);

      // listen for presence response
      socket.on("presence_update", (data) => {
        console.log("Presence update from server:", data);
      });
    };

    setupSocket();

    return () => {
      socket.disconnect();
    };
  }, []);

  // No UI needed (as you requested)
  return null;
};

export default UserStatusScreen;
