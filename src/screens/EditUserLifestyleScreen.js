import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  FETCH_LIFESTYLE_REQUEST,
  FETCH_LIFESTYLE_OPTIONS_REQUEST,
} from "../features/lifeStyle/lifestyleTypes";

const PURPLE = "#B832F9";

const EditUserLifestyleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  /* ===== GET PARAMS ===== */
  const { selected = [] } = route.params || {};

  /* ===== REDUX DATA ===== */
  const { options = [] } = useSelector((state) => state.lifestyle);

  /* ===== LOCAL STATE ===== */
  const [localSelection, setLocalSelection] = useState(selected);

  /* ===== FETCH DATA ===== */
  useEffect(() => {
    dispatch({ type: FETCH_LIFESTYLE_REQUEST });
    dispatch({ type: FETCH_LIFESTYLE_OPTIONS_REQUEST });
  }, []);

  /* ===== GROUP OPTIONS BY CATEGORY ===== */
  const groupedOptions = options.reduce((acc, item) => {
    if (!acc[item.category_id]) {
      acc[item.category_id] = {
        categoryId: item.category_id,
        categoryName: item.category_name,
        items: [],
      };
    }
    acc[item.category_id].items.push(item);
    return acc;
  }, {});

  /* ===== TOGGLE (ONE PER CATEGORY) ===== */
  const toggleLifestyle = (item) => {
    setLocalSelection((prev) => {
      const filtered = prev.filter(
        (i) => i.categoryId !== item.categoryId
      );
      return [...filtered, item];
    });
  };

  /* ===== DONE ===== */
  const handleDone = () => {
    navigation.navigate({
      name: "EditProfileScreen",
      params: {
        updatedLifestyles: localSelection,
      },
      merge: true,
    });
  };

  return (
    <View style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Lifestyle</Text>

        <TouchableOpacity onPress={handleDone}>
          <Text style={styles.doneText}>DONE</Text>
        </TouchableOpacity>
      </View>

      {/* ===== LIST ===== */}
      <ScrollView>
        {options.length === 0 && (
          <Text style={styles.emptyText}>
            Loading lifestyle options...
          </Text>
        )}

        {Object.values(groupedOptions).map((group) => (
          <View key={group.categoryId}>
            {/* CATEGORY TITLE */}
            <Text style={styles.categoryTitle}>
              {group.categoryName}
            </Text>

            {/* SUBCATEGORY OPTIONS */}
            {group.items.map((item) => {
              const selectedItem = localSelection.some(
                (i) =>
                  i.id === item.lifestyle_id &&
                  i.categoryId === item.category_id
              );

              return (
                <TouchableOpacity
                  key={item.lifestyle_id}
                  style={[
                    styles.row,
                    selectedItem && styles.selectedRow,
                  ]}
                  onPress={() =>
                    toggleLifestyle({
                      categoryId: item.category_id,
                      categoryName: item.category_name,
                      id: item.lifestyle_id,
                      name: item.lifestyle_name,
                    })
                  }
                >
                  <Text style={styles.text}>
                    {item.lifestyle_name}
                  </Text>

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
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default EditUserLifestyleScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop:20
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  doneText: {
    color: PURPLE,
    fontWeight: "700",
    fontSize: 14,
  },

  /* CATEGORY */
  categoryTitle: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
    backgroundColor: "#FAFAFA",
  },

  /* LIST */
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
  },

  row: {
    paddingHorizontal: 18,
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
    fontSize: 15,
    color: "#333",
  },
});
