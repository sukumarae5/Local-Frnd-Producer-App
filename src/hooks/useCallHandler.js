// hooks/useCallHandler.js

import { useEffect } from "react";
import { useSelector } from "react-redux";
import callManager from "../utils/callManager";

export default function useCallHandler(navigationRef, isNavReady) {

  const call = useSelector(state => state.calls.call);
console.log("📞 useCallHandler - Current Call State:", call);

useEffect(() => {

  if (!call?.status || !isNavReady) return;

  const status = call.status.toUpperCase();

  console.log("🔥 CALL HANDLER:", call);

// if (
//   callManager.currentSession &&
//   !callManager.isSameSession(call.session_id)
// ) {
//   console.log("⚠️ New session detected, resetting...");
//   callManager.reset(); // you must implement this
// }

if (
  callManager.currentSession &&
  callManager.currentSession !== call.session_id
) {
  console.log("🔄 New session → reset");

  callManager.reset();
}

  callManager.setSession(call.session_id);

  // =============================
  // 🎲 RANDOM + DIRECT FLOW
  // =============================
  // if (!call.is_friend) {

  //   if (status === "ACCEPTED" && call.call_mode !== "FRIEND") {

  //     console.log("➡️ PERFECT MATCH SCREEN");

  //     callManager.safeNavigate(navigationRef, "PerfectMatchScreen", {
  //       session_id: call.session_id,
  //       call_type: call.call_type,
  //     });

  //     return;
  //   }
  // }

  if (!call.is_friend) {
  if (status === "ACCEPTED") {

    if (callManager.lastNavigatedSession === call.session_id) {
      return; // ✅ PREVENT DUPLICATE NAVIGATION
    }

    callManager.lastNavigatedSession = call.session_id;

    callManager.safeNavigate(navigationRef, "PerfectMatchScreen", {
      session_id: call.session_id,
      call_type: call.call_type,
    });

    return;
  }
}

  // =============================
  // 👥 FRIEND FLOW
  // =============================
  if (call.is_friend) {

    if (status === "ACCEPTED") {

      console.log("➡️ FRIEND CALL SCREEN");

      const screen =
        call.call_type === "VIDEO"
          ? "VideocallScreen"
          : "AudiocallScreen";

      callManager.safeNavigate(navigationRef, screen, {
        session_id: call.session_id,
        role:
          call.direction === "OUTGOING"
            ? "caller"
            : "receiver",
      });

      return;
    }
  }

}, [call, isNavReady]);

}