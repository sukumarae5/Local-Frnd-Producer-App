import {
  RTCPeerConnection,
  mediaDevices,
} from "react-native-webrtc";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const createPC = () => {
  return new RTCPeerConnection(ICE_SERVERS);
};

export const getAudioStream = async () => {
  return await mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
};
