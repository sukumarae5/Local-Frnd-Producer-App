// ✅ REPLACE the full useCallHandler.js

import { useEffect } from "react";
import { useSelector } from "react-redux";
import callManager from "../utils/callManager";
import store from "../reduxStore/store";

export default function useCallHandler(navigationRef, isNavReady) {

  const call = useSelector(state => state.calls.call);

  useEffect(() => {
    if (!call?.status || !isNavReady) return;

    const status = call.status.toUpperCase();

    console.log("🔥 CALL HANDLER:", call);

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
    if (!call.is_friend) {
      if (status === "ACCEPTED") {
        if (callManager.lastNavigatedSession === call.session_id) return;
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
        if (callManager.lastNavigatedSession === call.session_id) return;
        callManager.lastNavigatedSession = call.session_id;

        console.log("➡️ FRIEND CALL SCREEN");

        // ✅ Get myId from store correctly
        const myId = store.getState().user?.userdata?.user?.user_id;

        const screen =
          call.call_type === "VIDEO"
            ? "VideocallScreen"
            : "AudiocallScreen";

        callManager.safeNavigate(navigationRef, screen, {
          session_id: call.session_id,
          caller_id: call.caller_id,      // ✅ pass correctly
          receiver_id: call.receiver_id,  // ✅ pass correctly
        });

        return;
      }
    }

  }, [call, isNavReady]);
}