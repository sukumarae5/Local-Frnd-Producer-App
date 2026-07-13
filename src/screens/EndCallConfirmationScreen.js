import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Image, Animated, ActivityIndicator } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';

import { friendRequest, friendAcceptRequest, friendStatusRequest } from '../features/friend/friendAction';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

// One-off accents specific to this modal's avatar glow and confirm action.
const modalAccents = {
  avatarGlow: '#c77dff',
  confirmBg: '#ff5b77',
  followBg: '#7e00ff',
};

const EndCallConfirmModal = ({ visible, onCancel, onConfirm, otherUser }) => {
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const friendStatus = useSelector((s) => s.friends.friendStatus);
  const incoming = useSelector((s) => s.friends.incoming);
  const { loading } = useSelector((state) => state.rating);

  const [rating, setRating] = useState(0);
  const [localPending, setLocalPending] = useState(false);

  const userId = otherUser?.user_id;

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (userId && visible) {
      dispatch(friendStatusRequest(userId));
      setRating(0);
      setLocalPending(false);
    }
  }, [userId, visible]);

  useEffect(() => {
    if (!visible) return;

    rotateAnim.setValue(0);
    scaleAnim.setValue(1);

    const anim = Animated.loop(
      Animated.parallel([
        Animated.timing(rotateAnim, { toValue: 1, duration: 6000, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ]),
      ])
    );

    anim.start();
    return () => anim.stop();
  }, [visible]);

  const renderFollowButton = () => {
    if (!userId) return null;

    const status = friendStatus[userId]?.state;

    if (status === 'FRIEND') {
      return (
        <View style={styles.followingBtn}>
          <AppText variant="bodySmall" style={styles.followingText}>✓ Following</AppText>
        </View>
      );
    }

    if (status === 'PENDING_SENT' || localPending) {
      return (
        <View style={styles.pendingBtn}>
          <AppText variant="bodySmall" style={styles.followText}>Pending</AppText>
        </View>
      );
    }

    if (status === 'PENDING_RECEIVED') {
      const req = incoming.find((r) => r.sender_id === userId);
      if (!req) return null;

      return (
        <TouchableOpacity
          style={styles.followBtn}
          onPress={() => {
            dispatch(friendAcceptRequest(req.request_id));
            setTimeout(() => dispatch(friendStatusRequest(userId)), 300);
          }}
        >
          <AppText variant="bodySmall" style={styles.followText}>Accept</AppText>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.followBtn}
        onPress={() => {
          setLocalPending(true);
          dispatch(friendRequest(userId));
        }}
      >
        <AppText variant="bodySmall" style={styles.followText}>➕ Follow</AppText>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {otherUser?.avatar && (
            <Animated.View
              style={[
                styles.avatarOuter,
                {
                  transform: [
                    { rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
                    { scale: scaleAnim },
                  ],
                },
              ]}
            >
              <View style={styles.avatarRing}>
                <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
              </View>
            </Animated.View>
          )}

          <AppText variant="h4" style={styles.name}>{otherUser?.name || ''}</AppText>

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} disabled={loading} onPress={() => setRating(i)}>
                <Ionicons name={i <= rating ? 'star' : 'star-outline'} size={moderateScale(26)} color="#ffb300" />
              </TouchableOpacity>
            ))}
          </View>

          {renderFollowButton()}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} disabled={loading} onPress={onCancel}>
              <AppText variant="subtitle" style={styles.cancelText}>Cancel</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, (loading || rating === 0) && { opacity: 0.6 }]}
              disabled={loading || rating === 0}
              onPress={() => onConfirm(rating)}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AppText variant="subtitle" style={styles.confirmText}>Confirm</AppText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EndCallConfirmModal;

const createStyles = (theme) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },

    card: {
      width: '85%',
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      padding: spacing.xl,
      alignItems: 'center',
    },

    avatarOuter: {
      width: moderateScale(112),
      height: moderateScale(112),
      borderRadius: moderateScale(56),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },

    avatarRing: {
      width: moderateScale(102),
      height: moderateScale(102),
      borderRadius: moderateScale(51),
      borderWidth: 3,
      borderColor: modalAccents.avatarGlow,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: modalAccents.avatarGlow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 12,
      elevation: 12,
    },

    avatar: { width: moderateScale(86), height: moderateScale(86), borderRadius: moderateScale(43), backgroundColor: colors.surface },

    name: { marginBottom: spacing.sm },

    ratingRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },

    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },

    cancelBtn: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
      backgroundColor: colors.surface,
    },

    confirmBtn: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      borderRadius: radius.xl,
      backgroundColor: modalAccents.confirmBg,
    },

    cancelText: { color: colors.textSecondary },
    confirmText: { color: '#fff' },

    followBtn: {
      marginTop: spacing.xxs,
      backgroundColor: modalAccents.followBg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
    },

    followText: { color: '#fff', fontWeight: '700' },

    pendingBtn: {
      marginTop: spacing.xxs,
      backgroundColor: colors.disabled,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
    },

    followingBtn: {
      marginTop: spacing.xxs,
      backgroundColor: `${colors.info}1A`,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.info,
    },

    followingText: { color: colors.info, fontWeight: '700' },
  });
};