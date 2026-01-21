import React, { createContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useDispatch } from "react-redux";
import { createSocket } from "./globalSocket";

import {
  friendPendingRequest,
  friendListRequest,
} from "../features/friend/friendAction";

export const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const appState = useRef(AppState.currentState);
  const dispatch = useDispatch();

  
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const socket = await createSocket();
      if (!socket || !mounted) return;

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("🟢 Socket connected:", socket.id);
        setConnected(true);
      });

      socket.on("disconnect", (reason) => {
        console.log("🔴 Socket disconnected:", reason);
        setConnected(false);
      });
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  /* ===== SOCKET EVENTS (FRIEND NOTIFICATIONS) ===== */
  useEffect(() => {
    if (!connected || !socketRef.current) return;

    const socket = socketRef.current;

    socket.on("friend_request", () => {
      console.log("🔔 Friend request received");
      dispatch(friendPendingRequest());
    });

    socket.on("friend_accept", () => {
      console.log("✅ Friend request accepted");
      dispatch(friendListRequest());
    });

    return () => {
      socket.off("friend_request");
      socket.off("friend_accept");
    };
  }, [connected]);

  /* ===== APP FOREGROUND HANDLING ===== */
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (next) => {
      if (
        appState.current.match(/inactive|background/) &&
        next === "active"
      ) {
        if (socketRef.current && !socketRef.current.connected) {
          console.log("🔁 Reconnecting socket");
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
