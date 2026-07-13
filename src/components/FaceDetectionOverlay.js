import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale } from 'react-native-size-matters';
import { useAppTheme } from '../theme';
import { AppText } from './index';

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

  return <Animated.View style={[styles.dot, { backgroundColor: color, opacity }]} />;
};

const FaceDetectionOverlay = ({ faceStatus, faceCount, visible = true }) => {
  const { theme } = useAppTheme();
  const { spacing, radius } = theme;

  const slideAnim = useRef(new Animated.Value(160)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const shouldShow = visible && (faceStatus === 'no_face' || faceStatus === 'multiple_faces');
  const isNoFace = faceStatus === 'no_face';
  const color = isNoFace ? '#FF4D4F' : '#FF9800';

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
        <View style={[styles.strip, { backgroundColor: color }]} />

        <View style={styles.inner}>
          <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
            <Ionicons name={isNoFace ? 'scan-outline' : 'people-outline'} size={moderateScale(20)} color={color} />
          </View>

          <View style={styles.textBox}>
            <AppText variant="bodySmall" style={{ color, fontWeight: '700' }}>
              {isNoFace ? 'Face Not Visible' : 'Multiple Faces'}
            </AppText>
            <AppText variant="caption" style={styles.msg}>
              {isNoFace ? 'Look at the camera to continue' : `${faceCount} faces detected — only one allowed`}
            </AppText>
          </View>

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
    bottom: moderateScale(100),
    left: moderateScale(16),
    right: moderateScale(16),
    zIndex: 100,
    elevation: 20,
  },
  card: {
    flexDirection: 'row',
    borderRadius: moderateScale(14),
    borderWidth: 1,
    backgroundColor: 'rgba(8,8,8,0.94)',
    overflow: 'hidden',
  },
  strip: { width: moderateScale(4) },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(12),
    gap: moderateScale(10),
  },
  iconBox: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: { flex: 1, gap: moderateScale(2) },
  msg: { color: '#777', lineHeight: moderateScale(15) },
  dots: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(4) },
  dot: { width: moderateScale(5), height: moderateScale(5), borderRadius: moderateScale(3) },
});

export default FaceDetectionOverlay;