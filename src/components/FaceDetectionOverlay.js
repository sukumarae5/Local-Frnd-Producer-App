import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PulsingDot = ({ delay, color }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={[styles.dot, { backgroundColor: color, opacity }]} />
  );
};

const FaceDetectionOverlay = ({ faceStatus, faceCount, visible = true }) => {
  const slideAnim   = useRef(new Animated.Value(160)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const shouldShow = visible && (faceStatus === 'no_face' || faceStatus === 'multiple_faces');
  const isNoFace   = faceStatus === 'no_face';
  const color      = isNoFace ? '#FF4D4F' : '#FF9800';

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: shouldShow ? 0 : 160,
        useNativeDriver: true,
        tension: 70,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: shouldShow ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shouldShow]);

  return (
    <Animated.View
      pointerEvents={shouldShow ? 'box-none' : 'none'}
      style={[styles.wrapper, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <View style={[styles.card, { borderColor: color }]}>
        {/* Left accent strip */}
        <View style={[styles.strip, { backgroundColor: color }]} />

        <View style={styles.inner}>
          {/* Icon */}
          <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
            <Ionicons
              name={isNoFace ? 'scan-outline' : 'people-outline'}
              size={20}
              color={color}
            />
          </View>

          {/* Text */}
          <View style={styles.textBox}>
            <Text style={[styles.title, { color }]}>
              {isNoFace ? 'Face Not Visible' : 'Multiple Faces'}
            </Text>
            <Text style={styles.msg}>
              {isNoFace
                ? 'Look at the camera to continue'
                : `${faceCount} faces detected — only one allowed`}
            </Text>
          </View>

          {/* Live dots */}
          <View style={styles.dots}>
            {[0, 200, 400].map((d, i) => (
              <PulsingDot key={i} delay={d} color={color} />
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 100,
    elevation: 20,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(8,8,8,0.94)',
    overflow: 'hidden',
  },
  strip: {
    width: 4,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  msg: {
    color: '#777',
    fontSize: 11,
    lineHeight: 15,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});

export default FaceDetectionOverlay;