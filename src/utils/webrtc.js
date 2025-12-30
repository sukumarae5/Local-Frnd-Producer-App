import { RTCPeerConnection } from "react-native-webrtc";

export const createPC = () => {
  const pc = new RTCPeerConnection({
    iceServers: [
      // STUN
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },

      // FREE TURN (debug / dev)
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
    bundlePolicy: "max-bundle",
    rtcpMuxPolicy: "require",
  });

  pc.onconnectionstatechange = () => {
    console.log("📡 PC connectionState:", pc.connectionState);
  };

  pc.onsignalingstatechange = () => {
    console.log("📶 Signaling:", pc.signalingState);
  };

  return pc;
};