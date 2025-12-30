// src/socket/globalSocket.js
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MAIN_BASE_URL } from "../api/baseUrl1";

let socket = null;

export const getSocket = async () => {
  if (socket) return socket;

  const token = await AsyncStorage.getItem("twittoke");
  if (!token) return null;

  socket = io(MAIN_BASE_URL, {
    transports: ["websocket"],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    forceNew: false,
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("⚠️ Socket disconnected:", reason);
  });

  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const connectSocketAfterLogin = async () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  return await getSocket();
};
export const disconnectSocketOnLogout = () => {
  closeSocket();
} 
