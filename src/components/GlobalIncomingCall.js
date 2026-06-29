import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const GlobalIncomingCall = ({ navigationRef }) => {
  const call = useSelector(state => state.calls.call);
  const navigatedRef = useRef(null); // track which session we navigated for

  useEffect(() => {
    if (!navigationRef?.current) return;
    if (!call) return;

    const isFriendRinging =
      call.is_friend &&
      call.direction === "INCOMING" &&
      call.status === "RINGING";

    if (!isFriendRinging) return;

    // ✅ Don't navigate twice for same session
    if (navigatedRef.current === call.session_id) return;
    navigatedRef.current = call.session_id;

    console.log("📲 GlobalIncomingCall → navigating to IncomingCallScreen");

    navigationRef.current.navigate("IncomingCallScreen", {
      session_id: call.session_id,
      call_type: call.call_type,
      caller_id: call.caller_id,
      receiver_id: call.receiver_id,
    });
  }, [call]);

  // ✅ Reset when call clears so next call can navigate again
  useEffect(() => {
    if (!call) {
      navigatedRef.current = null;
    }
  }, [call]);

  return null; // renders nothing — navigation does the work
};

export default GlobalIncomingCall;