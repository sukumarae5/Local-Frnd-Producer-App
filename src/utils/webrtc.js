// import { RTCPeerConnection, mediaDevices } from "react-native-webrtc";

// /* ================= ICE CONFIG ================= */
// export const RTC_CONFIG = {
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" },
//     { urls: "stun:stun1.l.google.com:19302" },
//   ],
//   bundlePolicy: "max-bundle",
//   rtcpMuxPolicy: "require",
// };

// /* ================= PEER CONNECTION ================= */
// export const createPC = () => {
//   return new RTCPeerConnection(RTC_CONFIG);
// };

// /* ================= AUDIO STREAM ================= */
// export const getAudioStream = async () => {
//   return await mediaDevices.getUserMedia({
//     audio: {
//       echoCancellation: true,
//       noiseSuppression: true,
//       autoGainControl: true,
//     },
//     video: false,
//   });
// };
  import { RTCPeerConnection } from "react-native-webrtc";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const createPC = () => {
  const pc = new RTCPeerConnection(ICE_SERVERS);

  pc.onconnectionstatechange = () => {
    console.log("📡 WebRTC state:", pc.connectionState);
  };

  return pc;
};