import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSocket } from "../socket/globalSocket";

const UserStatusScreen = () => {
  useEffect(() => {
    let mounted = true;

    const setupSocket = async () => {
      const socket = await getSocket();
      if (!socket || !mounted) return;

      const user_id = await AsyncStorage.getItem("user_id");
      if (!user_id) return;

      console.log("🟢 Sending user_online:", user_id);

      socket.emit("user_online");

      socket.off("presence_update");
      socket.on("presence_update", (data) => {
        console.log("📡 Presence update:", data);
      });
    };

    setupSocket();

    return () => {
      mounted = false;
      // ❌ DO NOT disconnect socket here
    };
  }, []);

  return null;
};

export default UserStatusScreen;