import { RTCPeerConnection,MediaStream  } from 'react-native-webrtc';

// const ICE_SERVERS = {
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" },
//     { urls: "stun:stun1.l.google.com:19302" },
//     { urls: "stun:stun2.l.google.com:19302" },
//   ],
// };

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },

    {
      urls: 'turn:relay1.expressturn.com:3478',
      username: 'ef7M9Y7KQKZQ6Z6W',
      credential: '8c2k7K5z3Jf7nF4d',
    },
  ],
};
// const ICE_SERVERS = {
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" },

//     {
//       urls: "turn:relay1.expressturn.com:3478",
//       username: "ef7M9Y7KQKZQ6Z6W",
//       credential: "8c2k7K5z3Jf7nF4d",
//     },
//   ],
// };

// const ICE_SERVERS = {
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" },

//     {
//       urls: [
//         "turn:global.turn.twilio.com:3478?transport=udp",
//         "turn:global.turn.twilio.com:3478?transport=tcp",
//       ],
//       username: "YOUR_TWILIO_USERNAME",
//       credential: "YOUR_TWILIO_PASSWORD",
//     },
//   ],
// };
export const createPC = ({ onIceCandidate, onTrack, onIceState }) => {
  try {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = event => {

      console.log("📤 ICE CANDIDATE:", event.candidate);
      if (event.candidate) {
        onIceCandidate?.(event.candidate);
      }
    };

    /* 🔥 IMPORTANT: SEND FULL EVENT */
    //  pc.ontrack = (event) => {
    //   console.log("🎥 TRACK RECEIVED:", event.streams);

    //   if (event.streams && event.streams[0]) {
    //     onTrack?.(event.streams[0]); // ✅ send FULL stream
    //   }
    // };

    // pc.ontrack = event => {
    //   console.log('🎧 TRACK KIND:', event.track.kind);

    //   // 🔥 Always use streams[0]
    //   const stream = event.streams[0];

    //   if (!stream) return;
    //   console.log('🔥 REMOTE STREAM SET');
    //   onTrack?.(stream);
    // };


    pc.ontrack = (event) => {
  console.log("🎧 TRACK KIND:", event.track.kind);

  let stream;

  if (event.streams && event.streams[0]) {
    stream = event.streams[0];
  } else {
    // 🔥 CRITICAL FIX FOR REACT NATIVE
    stream = new MediaStream();
    stream.addTrack(event.track);
  }

  console.log("🔥 REMOTE STREAM FIXED");

  onTrack?.(stream);
};
pc.onconnectionstatechange = () => {
  console.log("🔗 CONNECTION STATE:", pc.connectionState);
};
    pc.oniceconnectionstatechange = () => {
      console.log('🌐 ICE STATE:', pc.iceConnectionState);

      onIceState?.(pc.iceConnectionState);

      if (pc.iceConnectionState === 'connected') {
        console.log('✅ CONNECTED SUCCESS');
      }

      if (pc.iceConnectionState === 'failed') {
        console.log('❌ ICE FAILED');
         pc.restartIce();
      }

     
    };

    return pc;
  } catch (e) {
    console.error('PC ERROR:', e);
    return null;
  }
};
