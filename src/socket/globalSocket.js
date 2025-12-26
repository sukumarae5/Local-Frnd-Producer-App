import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MAIN_BASE_URL } from "../api/baseUrl1";

let socket = null;

export const getSocket = async () => {
  if (socket && socket.connected) return socket;

  const token = await AsyncStorage.getItem("twittoke");
  if (!token) return null;

  socket = io(MAIN_BASE_URL, {
    transports: ["websocket"],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("🔌 Global socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("⚠️ Global socket disconnected");
  });

  return socket;
};