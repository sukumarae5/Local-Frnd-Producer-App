// src/socket/SocketProvider.js
import React, { createContext, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { getSocket } from "./globalSocket";

export const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initSocket = async () => {
      const socket = await getSocket();
      if (!socket || !mounted) return;

      socketRef.current = socket;

      // 🔥 Presence updates from backend
      socket.on("presence_update", (data) => {
        console.log("👤 Presence update:", data);
      });
    };

    initSocket();

    return () => {
      mounted = false;
      // ❌ DO NOT disconnect here
    };
  }, []);

  /* 🔥 Optional: App background handling */
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        console.log("📲 App foreground");
      } else {
        console.log("📴 App background");
      }
    });

    return () => sub.remove();
  }, []);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
