import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";

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
  const { interests = [], loading } = useSelector(
    (state) => state.interest
  );

  /* ===== LOCAL STATE ===== */
  const [localSelection, setLocalSelection] = useState(selected);

  /* ===== FETCH INTERESTS ===== */
  useEffect(() => {
    dispatch(fetchInterestsRequest());
  }, [dispatch]);

  /* ===== TOGGLE INTEREST ===== */
  const toggleInterest = (item) => {
    setLocalSelection((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  /* ===== DONE ACTION ===== */
  const handleDone = () => {
    const interestIds = localSelection.map((item) => item.id);
console.log(interestIds)
    // 🔥 UPDATE INTERESTS API (PUT via saga)
    dispatch(
      updateselectinterestsrequest({
        interests: interestIds,
      })
    );

    // 🔁 Navigate back with updated data
    navigation.navigate({
      name: "EditProfileScreen",
      params: {
        updatedInterests: localSelection,
      },
      merge: true,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Interests</Text>

        <TouchableOpacity onPress={handleDone} disabled={loading}>
          <Text style={[styles.done, loading && { opacity: 0.5 }]}>
            DONE
          </Text>
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

/* ================= STYLES ================= */

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
