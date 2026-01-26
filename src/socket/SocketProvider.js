import React, { createContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSocket, destroySocket } from "./globalSocket";

export const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {
  // ✅ HOOKS — ALWAYS CALLED, NEVER CONDITIONAL
  const socketRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const [connected, setConnected] = useState(false);

  /* ================= INIT SOCKET ================= */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const token = await AsyncStorage.getItem("twittoke");

      if (!token) {
        console.log("⛔ No token → socket not started");
        destroySocket();
        if (mounted) setConnected(false);
        return;
      }

      console.log("🔐 Token found → initializing socket");

      const socket = createSocket(token);
      socketRef.current = socket;

      socket.on("connect", () => {
        if (mounted) setConnected(true);
      });

      socket.on("disconnect", () => {
        if (mounted) setConnected(false);
      });
    };

    init();

    return () => {
      mounted = false;
      destroySocket();
    };
  }, []);

  /* ================= FOREGROUND RECONNECT ================= */
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (
        appState.current.match(/inactive|background/) &&
        next === "active"
      ) {
        if (socketRef.current && !socketRef.current.connected) {
          console.log("🔁 Reconnecting socket (foreground)");
          socketRef.current.connect();
        }
      }
      appState.current = next;
    });

    return () => sub.remove();
  }, []);

  return (
    <SocketContext.Provider value={{ socketRef, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
