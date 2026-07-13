import React, { useContext, useState, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { moderateScale } from 'react-native-size-matters';
import { useDispatch } from 'react-redux';
import { SocketContext } from '../socket/SocketProvider';
import { femaleSearchRequest } from '../features/calls/callAction';
import { useAppTheme } from '../theme';
import { AppText } from './index';

const GoOnlineCard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { connected } = useContext(SocketContext);
  const [showModal, setShowModal] = useState(false);
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleGoOnline = (type) => {
    if (!connected) return;

    setShowModal(false);
    dispatch(femaleSearchRequest({ call_type: type }));

    navigation.navigate('CallStatusScreen', {
      call_type: type,
      role: 'female',
    });
  };

  return (
    <>
      <TouchableOpacity activeOpacity={0.9} onPress={() => setShowModal(true)}>
        <LinearGradient
          colors={['#D51BF9', '#8C37F8']}
          start={{ x: 0.05, y: 0.25 }}
          end={{ x: 1.0, y: 0.75 }}
          style={styles.outerPill}
        >
          <Icon name="heart" size={moderateScale(48)} color="rgba(255,255,255,0.20)" style={styles.heart1} />
          <Icon name="heart" size={moderateScale(48)} color="rgba(255,255,255,0.15)" style={styles.heart2} />
          <Icon name="heart" size={moderateScale(48)} color="rgba(255,255,255,0.15)" style={styles.heart3} />
          <Icon name="heart" size={moderateScale(48)} color="rgba(255,255,255,0.12)" style={styles.heart4} />

          <View style={styles.innerPill}>
            <Icon name="wifi-outline" size={moderateScale(22)} color="#fff" />
            <AppText variant="subtitle" style={styles.innerText}>GO ONLINE</AppText>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <AppText variant="h3" style={styles.modalTitle}>Go Online</AppText>

            <TouchableOpacity style={styles.callBtn} onPress={() => handleGoOnline('AUDIO')}>
              <Icon name="call-outline" size={moderateScale(22)} color="#fff" />
              <AppText variant="subtitle" style={styles.callText}>Audio Call</AppText>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.callBtn, styles.videoBtn]} onPress={() => handleGoOnline('VIDEO')}>
              <Icon name="videocam-outline" size={moderateScale(22)} color="#fff" />
              <AppText variant="subtitle" style={styles.callText}>Video Call</AppText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowModal(false)} activeOpacity={0.7}>
              <AppText variant="bodySmall" style={styles.closeText}>Cancel</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default GoOnlineCard;

const createStyles = (theme) => {
  const { spacing, radius } = theme;

  return StyleSheet.create({
    outerPill: {
      width: '100%',
      height: moderateScale(110),
      borderRadius: radius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#8C37F8',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
    innerPill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.md,
      borderRadius: radius.xl,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    innerText: {
      marginLeft: spacing.sm,
      color: '#fff',
      letterSpacing: 1.2,
    },
    heart1: { position: 'absolute', left: moderateScale(18), top: moderateScale(12) },
    heart2: { position: 'absolute', left: moderateScale(120), top: moderateScale(8) },
    heart3: { position: 'absolute', right: moderateScale(70), top: moderateScale(10) },
    heart4: { position: 'absolute', right: moderateScale(30), bottom: moderateScale(10) },

    // Dark brand modal — intentionally fixed, not theme-driven (matches StoryViewer pattern)
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(12, 5, 20, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBox: {
      backgroundColor: '#180D2B',
      padding: spacing.xxl,
      borderRadius: radius.xl,
      width: '85%',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(213, 27, 249, 0.2)',
    },
    modalTitle: {
      color: '#fff',
      marginBottom: spacing.xxl,
      letterSpacing: 0.5,
    },
    callBtn: {
      flexDirection: 'row',
      backgroundColor: '#8C37F8',
      padding: spacing.lg,
      borderRadius: radius.xl,
      alignItems: 'center',
      marginBottom: spacing.md,
      width: '100%',
      justifyContent: 'center',
      elevation: 2,
    },
    videoBtn: {
      backgroundColor: '#D51BF9',
    },
    callText: {
      color: '#fff',
      marginLeft: spacing.sm,
    },
    closeText: {
      color: 'rgba(255, 255, 255, 0.5)',
      marginTop: spacing.md,
      padding: spacing.xxs,
    },
  });
};