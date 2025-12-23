import { RTCPeerConnection, mediaDevices } from "react-native-webrtc";

// WebRTC Ice server configuration
export const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

// Create Peer Connection
export const createPC = () => {
  return new RTCPeerConnection(RTC_CONFIG);
};

// Audio Only Stream
export const getAudioStream = async () => {
  return await mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
};
