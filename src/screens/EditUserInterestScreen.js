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

  /* ===== PARAMS ===== */
  const { selected = [] } = route.params || {};

  /* ===== REDUX STATE ===== */
  const {
    interests = [],
    updateselectedInterests,
    updateResponse,
    selectedInterests,
    loading,
  } = useSelector((state) => state.interest);
console.log(selectedInterests)
  /* ===== LOCAL STATE ===== */
  const [localSelection, setLocalSelection] = useState(selected);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHandled, setIsHandled] = useState(false);

  /* ===== FETCH INTERESTS ===== */
  useEffect(() => {
    dispatch(fetchInterestsRequest());
  }, [dispatch]);

  /* ===== TOGGLE ===== */
  const toggleInterest = (item) => {
    setLocalSelection((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  /* ===== DONE ===== */
  const handleDone = () => {
    const interestIds = localSelection.map((item) => item.id);

    setIsSubmitting(true);

    dispatch(
      updateselectinterestsrequest({
        interests: interestIds,
      })
    );
  };

  /* ===== SUCCESS / ERROR HANDLER ===== */
useEffect(() => {
  if (!updateselectedInterests || isHandled) return;

  const isSuccess = updateselectedInterests?.success === true;

  const safeMessage =
    typeof updateselectedInterests?.message === "string"
      ? updateselectedInterests.message
      : "Operation completed";

  setIsSubmitting(false);
  setIsHandled(true);

  Alert.alert(
    isSuccess ? "Success ✅" : "Error ❌",
    safeMessage,
    [
      {
        text: "OK",
        onPress: () => {
          if (isSuccess) {
            dispatch({ type: CLEAR_UPDATE_INTERESTS }); // ✅ CLEAR HERE
            navigation.navigate("EditProfileScreen");
          }
        },
      },
    ]
  );
}, [updateselectedInterests]);


  /* Reset when screen opens again */
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setIsHandled(false);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Interests</Text>

        <TouchableOpacity
          onPress={handleDone}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={PURPLE} />
          ) : (
            <Text style={styles.done}>DONE</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <ScrollView>
        {loading && interests.length === 0 && (
          <Text style={styles.empty}>Loading interests...</Text>
        )}

        {interests.map((item) => {
          const selectedItem = localSelection.some(
            (i) => i.id === item.id
          );

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.row,
                selectedItem && styles.selectedRow,
              ]}
              onPress={() => toggleInterest(item)}
            >
              <Text style={styles.text}>{item.name}</Text>

              {selectedItem && (
                <Icon
                  name="checkmark-circle"
                  size={20}
                  color={PURPLE}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditUserInterestScreen;

/* ===== STYLES ===== */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  done: {
    color: PURPLE,
    fontWeight: "700",
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
  },
  row: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  selectedRow: {
    backgroundColor: "#F6ECFF",
  },
  text: {
    fontSize: 15,
    color: "#333",
  },
});
