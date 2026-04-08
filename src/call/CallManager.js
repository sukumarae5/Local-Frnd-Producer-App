import { CommonActions } from "@react-navigation/native";

let navigationRef = null;
let socketRef = null;
let dispatchRef = null;

export const setCallManagerRefs = ({ navigation, socket, dispatch }) => {
  navigationRef = navigation;
  socketRef = socket;
  dispatchRef = dispatch;
};

/* ================= HANDLE INCOMING ================= */

export const handleIncomingCall = (call) => {
  if (!call || !call.status) return;

  const { call_mode, call_type, session_id } = call;

  // ---------------- FRIEND ----------------
  if (call_mode === "FRIEND") {
    navigationRef?.navigate("IncomingCallScreen", {
      session_id,
      call_type,
    });
    return;
  }

  // ---------------- RANDOM + DIRECT ----------------
  if (call_mode === "RANDOM" || call_mode === "DIRECT") {

    socketRef?.emit("call_accept", { session_id });

    navigationRef?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name:
              call_type === "VIDEO"
                ? "VideocallScreen"
                : "AudiocallScreen",
            params: {
              session_id,
              role: "receiver",
            },
          },
        ],
      })
    );
  }
};

/* ================= HANDLE OUTGOING ================= */

export const handleOutgoingCall = (call) => {
  if (!call || !call.status) return;

  const { status, call_type, session_id } = call;

  if (status === "ACCEPTED") {
    navigationRef?.replace(
      call_type === "VIDEO"
        ? "VideocallScreen"
        : "AudiocallScreen",
      {
        session_id,
        role: "caller",
      }
    );
  }

  if (status === "FAILED" || status === "CANCELED") {
    navigationRef?.goBack();
  }
};