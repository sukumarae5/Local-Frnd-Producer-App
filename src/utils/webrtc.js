import { RTCPeerConnection, MediaStream } from 'react-native-webrtc';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },

    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceTransportPolicy: 'all',
};

export const createPC = ({ onIceCandidate, onTrack, onIceState }) => {
  try {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = event => {
      console.log('📤 ICE CANDIDATE:', event.candidate);
      if (event.candidate) {
        console.log('📤 ICE CANDIDATE:', event.candidate);
        console.log('ICE TYPE:', event.candidate.candidate);

        const candidate = event.candidate;

        // ✅ SEND CLEAN OBJECT
        onIceCandidate?.(JSON.parse(JSON.stringify(candidate)));
      }
    };

    pc.ontrack = event => {
      console.log('🎧 TRACK RECEIVED:', event.track.kind);

      let stream;

      if (event.streams && event.streams.length > 0) {
        stream = event.streams[0];
      } else {
        // ✅ CRITICAL FIX (React Native)
        stream = new MediaStream();
        stream.addTrack(event.track);
      }

      // ✅ FORCE AUDIO ENABLE
      event.track.enabled = true;

      console.log('🔊 REMOTE AUDIO READY');

      onTrack?.(stream);
    };

    pc.onconnectionstatechange = () => {
      console.log('🔗 CONNECTION STATE:', pc.connectionState);
    };
    pc.oniceconnectionstatechange = () => {
      console.log('🌐 ICE STATE:', pc.iceConnectionState);

      onIceState?.(pc.iceConnectionState);

      if (pc.iceConnectionState === 'failed') {
        console.log('❌ ICE FAILED → no audio possible');
      }
      if (pc.iceConnectionState === 'connected') {
        console.log('✅ CONNECTED SUCCESS');
      }
    };

    return pc;
  } catch (e) {
    console.error('PC ERROR:', e);
    return null;
  }
};
