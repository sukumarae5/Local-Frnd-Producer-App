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
  EDIT_USER_LIFESTYLE_REQUEST,
} from "../features/lifeStyle/lifestyleTypes";

const PURPLE = "#B832F9";

const EditUserLifestyleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  /* ===== PARAMS ===== */
  const { selected = [] } = route.params || {};

  /* ===== REDUX ===== */
  const { data = [], options = [] } = useSelector(
    (state) => state.lifestyle
  );

  /* ===== LOCAL STATE ===== */
  const [openCategory, setOpenCategory] = useState(null);
  const [localSelection, setLocalSelection] = useState(selected);

  /* ===== FETCH ===== */
  useEffect(() => {
    dispatch({ type: FETCH_LIFESTYLE_REQUEST });
    dispatch({ type: FETCH_LIFESTYLE_OPTIONS_REQUEST });
  }, []);

  /* ===== GET SELECTED TEXT ===== */
  const getSelectedLabel = (categoryId) => {
    const found = localSelection.find(
      (i) => i.categoryId === categoryId
    );
    return found ? found.name : "Select...";
  };

  /* ===== SELECT OPTION ===== */
  const handleSelect = (category, option) => {
    setLocalSelection((prev) => {
      const filtered = prev.filter(
        (i) => i.categoryId !== category.id
      );
      return [
        ...filtered,
        {
          categoryId: category.id,
          categoryName: category.name,
          id: option.lifestyle_id,
          name: option.lifestyle_name,
        },
      ];
    });
    setOpenCategory(null);
  };

  /* ===== DONE ===== */
 const handleDone = () => {
  // 🔹 extract only lifestyle IDs
  const lifestyleIds = localSelection.map((item) =>
    Number(item.id)
  );

  dispatch({
    type: EDIT_USER_LIFESTYLE_REQUEST,
    payload: {
      lifestyles: lifestyleIds, // ✅ ONLY THIS
    },
  });

  navigation.goBack();
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

      {/* ===== CONTENT ===== */}
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {data.map((category) => {
          const relatedOptions = options.filter(
            (o) => o.category_id === category.id
          );

          return (
            <View key={category.id} style={styles.section}>
              {/* CATEGORY NAME */}
              <Text style={styles.label}>{category.name}</Text>

              {/* DROPDOWN */}
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() =>
                  relatedOptions.length > 0 &&
                  setOpenCategory(
                    openCategory === category.id
                      ? null
                      : category.id
                  )
                }
              >
                <Text style={styles.dropdownText}>
                  {relatedOptions.length > 0
                    ? getSelectedLabel(category.id)
                    : "Not available"}
                </Text>

                {relatedOptions.length > 0 && (
                  <Icon name="chevron-down" size={18} />
                )}
              </TouchableOpacity>

              {/* OPTIONS */}
              {openCategory === category.id &&
                relatedOptions.map((opt) => {
                  const selectedItem = localSelection.some(
                    (i) =>
                      i.id === opt.lifestyle_id &&
                      i.categoryId === category.id
                  );

                  return (
                    <TouchableOpacity
                      key={opt.lifestyle_id}
                      style={[
                        styles.optionRow,
                        selectedItem && styles.selectedRow,
                      ]}
                      onPress={() =>
                        handleSelect(category, opt)
                      }
                    >
                      <Text style={styles.optionText}>
                        {opt.lifestyle_name}
                      </Text>

                      {selectedItem && (
                        <Icon
                          name="checkmark-circle"
                          size={18}
                          color={PURPLE}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
            </View>
          );
        })}
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
  },

  doneText: {
    color: PURPLE,
    fontWeight: "700",
  },

  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 6,
    color: "#333",
  },

  dropdown: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },

  dropdownText: {
    fontSize: 14,
    color: "#333",
  },

  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectedRow: {
    backgroundColor: "#F6ECFF",
  },

  optionText: {
    fontSize: 14,
    color: "#333",
  },
});
