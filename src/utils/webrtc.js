import { RTCPeerConnection } from "react-native-webrtc";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const createPC = () => {
  const pc = new RTCPeerConnection(ICE_SERVERS);
  console.log(pc)

  pc.onconnectionstatechange = () => {
    console.log("📡 WebRTC state:", pc.connectionState);
  };

  return pc;
};
