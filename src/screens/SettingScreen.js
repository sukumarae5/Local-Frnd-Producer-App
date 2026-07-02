import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";

import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";

import {
  deleteUserRequest,
  resetUserState,
  userlogoutrequest,
} from "../features/user/userAction";

import { SocketContext } from "../socket/SocketProvider";
import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";

const { height } = Dimensions.get("window");

const getErrorMessage = (error) => {
  if (typeof error === "string") {
    return error;
  }

  if (typeof error?.message === "string") {
    return error.message;
  }

  if (typeof error?.error === "string") {
    return error.error;
  }

  return "Unable to delete your account. Please try again.";
};

const SettingScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { socketRef } = useContext(SocketContext);

  const {
    deleting,
    deleteSuccess,
    deleteError,
    deleteResponse,
  } = useSelector((state) => state.user);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const clearUserSession = async () => {
    try {
      socketRef?.current?.disconnect();

      await AsyncStorage.multiRemove(["twittoke", "user_id"]);

      dispatch(userlogoutrequest());

      navigation.reset({
        index: 0,
        routes: [{ name: "Phone" }],
      });
    } catch (error) {
      console.log("Clear session error:", error);
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await clearUserSession();
  };

  const handleDeleteAccount = () => {
    if (deleting) {
      return;
    }

    // Do not clear local data here.
    // First wait for DELETE_USER_SUCCESS.
    dispatch(deleteUserRequest());
  };

  useEffect(() => {
    if (!deleteSuccess) {
      return;
    }

    const message =
      deleteResponse?.message ||
      "Your account has been permanently deleted.";

    setShowDeleteModal(false);

    Alert.alert("Account Deleted", message, [
      {
        text: "OK",
        onPress: async () => {
          dispatch(resetUserState());
          await clearUserSession();
        },
      },
    ]);
  }, [deleteSuccess, deleteResponse]);

  useEffect(() => {
    if (!deleteError) {
      return;
    }

    Alert.alert("Delete Failed", getErrorMessage(deleteError), [
      {
        text: "OK",
        onPress: () => {
          dispatch(resetUserState());
        },
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
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              <Icon name="arrow-back" size={22} color="#000" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Settings</Text>
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
              <Icon name="trash-outline" size={20} color="#fff" />
            </View>

            <Text style={styles.deleteText}>Delete Account</Text>

            <Icon name="chevron-forward" size={18} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutItem}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.8}
            disabled={deleting}
          >
            <View style={styles.logoutIcon}>
              <Icon name="log-out-outline" size={20} color="#fff" />
            </View>

            <Text style={styles.logoutText}>Log Out</Text>

            <Icon name="chevron-forward" size={18} color="#aaa" />
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
              <View style={styles.modalIcon}>
                <Icon name="person-outline" size={24} color="#fff" />
              </View>

              <Text style={styles.modalTitle}>Logout?</Text>

              <Text style={styles.modalSub}>
                Are you sure you want to logout?
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowLogoutModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelText}>CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirmLogout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmText}>CONFIRM</Text>
                </TouchableOpacity>
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
            if (!deleting) {
              setShowDeleteModal(false);
            }
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.deleteModalIcon}>
                <Icon name="trash-outline" size={24} color="#fff" />
              </View>

              <Text style={styles.modalTitle}>Delete Account?</Text>

              <Text style={styles.modalSub}>
                This will permanently delete your account. This action cannot be
                undone.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.cancelBtn,
                    deleting && styles.disabledButton,
                  ]}
                  onPress={() => setShowDeleteModal(false)}
                  activeOpacity={0.8}
                  disabled={deleting}
                >
                  <Text style={styles.cancelText}>CANCEL</Text>
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
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.confirmText}>DELETE</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: height * 0.05,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: height * 0.01,
    marginBottom: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
    color: "#000",
  },

  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    marginTop: 25,
  },

  logoutIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#C44DFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  logoutText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },

  deleteItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    marginTop: 12,
  },

  deleteIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  deleteText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#060101",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#C44DFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  deleteModalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    color: "#000",
  },

  modalSub: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 19,
  },

  modalButtons: {
    flexDirection: "row",
    width: "100%",
  },

  cancelBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: "#F4E6FF",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    color: "#C44DFF",
    fontWeight: "600",
  },

  confirmBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: "#C44DFF",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteConfirmBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  confirmText: {
    color: "#fff",
    fontWeight: "600",
  },
});