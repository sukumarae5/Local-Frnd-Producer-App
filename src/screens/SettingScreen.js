import React, { useContext, useEffect, useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';

import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';

import {
  deleteUserRequest,
  resetUserState,
  userlogoutrequest,
} from '../features/user/userAction';

import { SocketContext } from '../socket/SocketProvider';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { useAppTheme } from '../theme';
import { AppText } from '../components';
import LinearGradient from 'react-native-linear-gradient';

const getErrorMessage = error => {
  if (typeof error === 'string') return error;
  if (typeof error?.message === 'string') return error.message;
  if (typeof error?.error === 'string') return error.error;
  return 'Unable to delete your account. Please try again.';
};

const SettingScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { socketRef } = useContext(SocketContext);
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { deleting, deleteSuccess, deleteError, deleteResponse } = useSelector(
    state => state.user,
  );

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const clearUserSession = async () => {
    try {
      socketRef?.current?.disconnect();
      await AsyncStorage.multiRemove(['twittoke', 'user_id']);
      dispatch(userlogoutrequest());

      navigation.reset({
        index: 0,
        routes: [{ name: 'Phone' }],
      });
    } catch (error) {
      console.log('Clear session error:', error);
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await clearUserSession();
  };

  const handleDeleteAccount = () => {
    if (deleting) return;
    dispatch(deleteUserRequest());
  };

  useEffect(() => {
    if (!deleteSuccess) return;

    const message =
      deleteResponse?.message || 'Your account has been permanently deleted.';

    setShowDeleteModal(false);

    Alert.alert('Account Deleted', message, [
      {
        text: 'OK',
        onPress: async () => {
          dispatch(resetUserState());
          await clearUserSession();
        },
      },
    ]);
  }, [deleteSuccess, deleteResponse]);

  useEffect(() => {
    if (!deleteError) return;

    Alert.alert('Delete Failed', getErrorMessage(deleteError), [
      {
        text: 'OK',
        onPress: () => dispatch(resetUserState()),
      },
    ]);
  }, [deleteError, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetUserState());
    };
  }, [dispatch]);

  return (
    <WelcomeScreenbackgroungpage>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={theme.hitSlop}
          >
            <Icon
              name="arrow-back"
              size={moderateScale(22)}
              color={colors.icon}
            />
          </TouchableOpacity>

          <AppText variant="h3" style={styles.headerTitle}>
            Settings
          </AppText>
        </View>

        <TouchableOpacity
          style={styles.deleteItem}
          onPress={() => {
            dispatch(resetUserState());
            setShowDeleteModal(true);
          }}
          activeOpacity={0.8}
          disabled={deleting}
        >
          <View style={styles.deleteIcon}>
            <Icon
              name="trash-outline"
              size={moderateScale(20)}
              color={colors.textInverse}
            />
          </View>

          <AppText variant="subtitle" style={styles.rowText}>
            Delete Account
          </AppText>

          <Icon
            name="chevron-forward"
            size={moderateScale(18)}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutItem}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.8}
          disabled={deleting}
        >
          <LinearGradient
            colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
            useAngle
            angle={75.05}
            style={styles.logoutIcon}
          >
            <Icon
              name="log-out-outline"
              size={moderateScale(20)}
              color={colors.textInverse}
            />
          </LinearGradient>

          <AppText variant="subtitle" style={styles.rowText}>
            Log Out
          </AppText>

          <Icon
            name="chevron-forward"
            size={moderateScale(18)}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Logout modal */}
      <Modal
        transparent
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <LinearGradient
              colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
              useAngle
              angle={75.05}
              style={styles.modalIcon}
            >
              <Icon
                name="log-out-outline"
                size={moderateScale(24)}
                color={colors.textInverse}
              />
            </LinearGradient>

            <AppText variant="h4" style={styles.modalTitle}>
              Logout?
            </AppText>

            <AppText
              variant="bodySmall"
              color="textMuted"
              style={styles.modalSub}
            >
              Are you sure you want to logout?
            </AppText>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
              >
                <AppText variant="button" style={styles.cancelText}>
                  CANCEL
                </AppText>
              </TouchableOpacity>

              <LinearGradient
                colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
                useAngle
                angle={75.05}
                style={styles.confirmBtn}
              >
                <TouchableOpacity
                  style={styles.buttonFill}
                  onPress={handleConfirmLogout}
                  activeOpacity={0.8}
                >
                  <AppText variant="button" style={styles.confirmText}>
                    CONFIRM
                  </AppText>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete-account modal */}
      <Modal
        transparent
        visible={showDeleteModal}
        animationType="fade"
        onRequestClose={() => {
          if (!deleting) setShowDeleteModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.deleteModalIcon}>
              <Icon
                name="trash-outline"
                size={moderateScale(24)}
                color={colors.textInverse}
              />
            </View>

            <AppText variant="h4" style={styles.modalTitle}>
              Delete Account?
            </AppText>

            <AppText
              variant="bodySmall"
              color="textMuted"
              style={styles.modalSub}
            >
              This will permanently delete your account. This action cannot be
              undone.
            </AppText>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelBtn, deleting && styles.disabledButton]}
                onPress={() => setShowDeleteModal(false)}
                activeOpacity={0.8}
                disabled={deleting}
              >
                <AppText variant="button" style={styles.cancelText}>
                  CANCEL
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteConfirmBtn,
                  deleting && styles.disabledButton,
                ]}
                onPress={handleDeleteAccount}
                activeOpacity={0.8}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <AppText variant="button" style={styles.confirmText}>
                    DELETE
                  </AppText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </WelcomeScreenbackgroungpage>
  );
};

export default SettingScreen;

const createStyles = theme => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    container: { flex: 1 },

    scrollContainer: {
      flexGrow: 1,
      paddingBottom: spacing.xxxl,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      marginBottom: spacing.sm,
    },

    headerTitle: {
      marginLeft: spacing.sm,
    },

    logoutItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      backgroundColor: colors.card,
      marginTop: spacing.xxl,
    },

    logoutIcon: {
      width: moderateScale(34),
      height: moderateScale(34),
      borderRadius: moderateScale(17),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },

    deleteItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      backgroundColor: colors.card,
      marginTop: spacing.md,
    },

    deleteIcon: {
      width: moderateScale(34),
      height: moderateScale(34),
      borderRadius: moderateScale(17),
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },

    rowText: {
      flex: 1,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },

    modalBox: {
      width: '80%',
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.xl,
      alignItems: 'center',
    },

    modalIcon: {
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
      overflow: 'hidden',
    },

    deleteModalIcon: {
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(24),
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },

    modalTitle: {
      marginBottom: spacing.xs,
    },

    modalSub: {
      textAlign: 'center',
      marginBottom: spacing.xl,
    },

    modalButtons: {
      flexDirection: 'row',
      width: '100%',
    },

    cancelBtn: {
      flex: 1,
      minHeight: moderateScale(44),
      borderRadius: radius.md,
      backgroundColor: `${colors.secondary}1F`,
      marginRight: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },

    cancelText: {
      color: colors.gradientPurpleStart,
    },

    confirmBtn: {
      flex: 1,
      minHeight: moderateScale(44),
      borderRadius: radius.md,
      overflow: 'hidden',
    },
    deleteConfirmBtn: {
      flex: 1,
      minHeight: moderateScale(44),
      borderRadius: radius.md,
      backgroundColor: colors.gradientPurpleStart,
      alignItems: 'center',
      justifyContent: 'center',
    },

    disabledButton: {
      opacity: 0.6,
    },

    confirmText: {
      color: colors.textInverse,
    },
    buttonFill: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};
