import { io } from "socket.io-client";
import { MAIN_BASE_URL } from "../api/baseUrl1";

let socket = null;

export const createSocket = (token) => {
  if (socket) return socket;

  if (!token) {
    console.log("⛔ No token, socket not created");
    return null;
  }

  console.log("🆕 Creating socket...");

  socket = io(MAIN_BASE_URL, {
    transports: ["websocket"], // 🔥 REQUIRED
    auth: { token },
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("✅ SOCKET CONNECTED:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 SOCKET DISCONNECTED:", reason);
  });

  socket.on("connect_error", (err) => {
    console.log("❌ SOCKET ERROR:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const destroySocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    console.log("👋 Socket destroyed");
  }
};
