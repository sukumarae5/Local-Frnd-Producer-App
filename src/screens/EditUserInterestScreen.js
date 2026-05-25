import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { CLEAR_UPDATE_INTERESTS } from "../features/interest/interestTypes";

import {
  fetchInterestsRequest,
  updateselectinterestsrequest,
} from "../features/interest/interestActions";

const PURPLE = "#B832F9";

const EditUserInterestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { selected = [] } = route.params || {};

  const {
    interests = [],
    updateselectedInterests,
    selectedInterests,
    loading,
  } = useSelector((state) => state.interest);

  console.log(selectedInterests);

  const [localSelection, setLocalSelection] = useState(selected);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHandled, setIsHandled] = useState(false);

  useEffect(() => {
    dispatch(fetchInterestsRequest());
  }, [dispatch]);

  const toggleInterest = (item) => {
    setLocalSelection((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  const handleDone = () => {
    const interestIds = localSelection.map((item) => item.id);

    setIsSubmitting(true);

    dispatch(
      updateselectinterestsrequest({
        interests: interestIds,
      })
    );
  };

  useEffect(() => {
    if (!updateselectedInterests || isHandled) return;

    const isSuccess = updateselectedInterests?.success === true;

    const safeMessage =
      typeof updateselectedInterests?.message === "string"
        ? updateselectedInterests.message
        : "Operation completed";

    setIsSubmitting(false);
    setIsHandled(true);

    Alert.alert(isSuccess ? "Success ✅" : "Error ❌", safeMessage, [
      {
        text: "OK",
        onPress: () => {
          if (isSuccess) {
            dispatch({ type: CLEAR_UPDATE_INTERESTS });
            navigation.navigate("EditProfileScreen");
          }
        },
      },
    ]);
  }, [updateselectedInterests, isHandled, dispatch, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setIsHandled(false);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* HEADER - SAME LIKE EDIT USER LIFESTYLE SCREEN */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Interests</Text>

          <TouchableOpacity onPress={handleDone} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={PURPLE} size="small" />
            ) : (
              <Text style={styles.done}>DONE</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* LIST */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {loading && interests.length === 0 && (
            <Text style={styles.empty}>Loading interests...</Text>
          )}

          {interests.map((item) => {
            const selectedItem = localSelection.some((i) => i.id === item.id);

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.row, selectedItem && styles.selectedRow]}
                onPress={() => toggleInterest(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.text}>{item.name}</Text>

                {selectedItem && (
                  <Icon name="checkmark-circle" size={20} color={PURPLE} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default EditUserInterestScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 40,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },

  done: {
    color: PURPLE,
    fontWeight: "700",
  },

  scrollContent: {
    paddingBottom: 30,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
    fontSize: 15,
  },

  row: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },

  selectedRow: {
    backgroundColor: "#F6ECFF",
  },

  text: {
    fontSize: 16,
    color: "#333",
  },
});