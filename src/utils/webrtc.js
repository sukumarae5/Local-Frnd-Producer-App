import {
  RTCPeerConnection,
} from "react-native-webrtc";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

export const createPC = ({ onIceCandidate, onIceState }) => {
  const pc = new RTCPeerConnection(ICE_SERVERS);

  console.log("🌐 PeerConnection CREATED");

  /* ================= ICE CANDIDATES ================= */
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("🧊 ICE CANDIDATE GENERATED:", event.candidate);
      onIceCandidate?.(event.candidate);
    } else {
      console.log("🧊 ICE gathering complete");
    }
  };

  pc.onicecandidateerror = (e) => {
    console.log("❌ ICE CANDIDATE ERROR:", e);
  };

  /* ================= ICE STATE ================= */
  pc.oniceconnectionstatechange = () => {
    console.log("🧊 ICE CONNECTION STATE:", pc.iceConnectionState);
    onIceState?.(pc.iceConnectionState);
  };

  pc.onicegatheringstatechange = () => {
    console.log("❄️ ICE GATHERING STATE:", pc.iceGatheringState);
  };

  /* ================= CONNECTION ================= */
  pc.onconnectionstatechange = () => {
    console.log("🔌 PEER CONNECTION STATE:", pc.connectionState);
  };

  pc.onsignalingstatechange = () => {
    console.log("📡 SIGNALING STATE:", pc.signalingState);
  };

  /* ================= MEDIA ================= */
  pc.ontrack = (event) => {
    console.log("🔊 REMOTE TRACK RECEIVED");
    console.log("🎧 Streams:", event.streams);
  };

  pc.onnegotiationneeded = () => {
    console.log("🔄 NEGOTIATION NEEDED");
  };

  return pc;
};
