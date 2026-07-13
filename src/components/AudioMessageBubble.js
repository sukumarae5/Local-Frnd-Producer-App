// components/AudioMessageBubble.jsx
//
// WhatsApp-style voice note bubble: circular play/pause button, a bar-chart
// "waveform" that doubles as a scrub slider, and current/total time.
//
// NOTE on the waveform: these bars are DECORATIVE. They're generated from a
// deterministic seed based on the message id, so a given message always
// looks the same, but the heights do not reflect real audio amplitude.
// True waveform extraction needs native audio analysis (e.g. reading PCM
// samples and computing RMS per chunk) which is out of scope here.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, PanResponder, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppText } from '../components';
import audioPlayerManager from '../utils/auidoPlayerManager';

const BAR_COUNT = 26;

const seedRandom = seed => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h % 1000) / 1000;
  };
};

const getWaveformHeights = id => {
  const rand = seedRandom(String(id));
  return Array.from({ length: BAR_COUNT }, () => 4 + Math.round(rand() * 14));
};

const formatMs = ms => {
  const totalSeconds = Math.max(0, Math.floor((ms || 0) / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const AudioMessageBubble = ({ item, isMe, chat, onRetry }) => {
  const messageId = item.message_id;
  const heights = useMemo(() => getWaveformHeights(messageId), [messageId]);
  const knownDurationMs = (item.duration_seconds || 0) * 1000;

  const [state, setState] = useState({
    isPlaying: false,
    currentPosition: 0,
    duration: knownDurationMs,
  });

  const widthRef = useRef(1);

  useEffect(() => {
    const unsubscribe = audioPlayerManager.subscribe(snap => {
      const isPlaying = snap.currentId === messageId;
      setState(prev => ({
        isPlaying,
        currentPosition: isPlaying ? snap.currentPosition : 0,
        duration: isPlaying && snap.duration ? snap.duration : (prev.duration || knownDurationMs),
      }));
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageId]);

  const handleTogglePlay = () => {
    if (item.uploading) return;
    if (item.failed) {
      onRetry?.();
      return;
    }
    audioPlayerManager.play(messageId, item.content);
  };

  const seekFromLocationX = x => {
    if (!state.duration) return;
    const fraction = Math.max(0, Math.min(1, x / widthRef.current));
    audioPlayerManager.seek(fraction * state.duration);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => state.isPlaying,
      onMoveShouldSetPanResponder: () => state.isPlaying,
      onPanResponderGrant: e => seekFromLocationX(e.nativeEvent.locationX),
      onPanResponderMove: e => seekFromLocationX(e.nativeEvent.locationX),
    }),
    // Recreated when isPlaying changes so onStartShouldSetPanResponder sees
    // the latest value rather than a stale closure from first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ).current;

  const fraction = state.duration
    ? Math.max(0, Math.min(1, state.currentPosition / state.duration))
    : 0;
  const filledBars = Math.round(fraction * BAR_COUNT);

  const displayMs = state.isPlaying ? state.currentPosition : (state.duration || knownDurationMs);

  const iconColor = isMe ? '#fff' : chat.accentIconColor;
  const trackColor = isMe ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)';
  const barFilled = isMe ? '#fff' : chat.accentIconColor;
  const barUnfilled = isMe ? 'rgba(255,255,255,0.4)' : '#cfcfcf';
  const timeColor = isMe ? 'rgba(255,255,255,0.85)' : chat.otherBubbleText;

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        onPress={handleTogglePlay}
        style={[styles.playBtn, { backgroundColor: trackColor }]}
        disabled={item.uploading}
      >
        {item.uploading ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : item.failed ? (
          <Ionicons name="refresh" size={18} color={iconColor} />
        ) : (
          <Ionicons name={state.isPlaying ? 'pause' : 'play'} size={18} color={iconColor} />
        )}
      </TouchableOpacity>

      <View
        style={styles.waveformArea}
        onLayout={e => { widthRef.current = e.nativeEvent.layout.width || 1; }}
        {...panResponder.panHandlers}
      >
        <View style={styles.waveformRow}>
          {heights.map((h, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                { height: h, backgroundColor: i < filledBars ? barFilled : barUnfilled },
              ]}
            />
          ))}
        </View>
        <AppText variant="caption" style={[styles.timeText, { color: timeColor }]}>
          {item.failed ? 'Tap to retry' : formatMs(displayMs)}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', minWidth: 200, paddingVertical: 2 },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  waveformArea: { flex: 1 },
  waveformRow: { flexDirection: 'row', alignItems: 'flex-end', height: 20 },
  bar: { width: 3, marginRight: 2, borderRadius: 2 },
  timeText: { marginTop: 3, fontSize: 11 },
});

export default AudioMessageBubble;