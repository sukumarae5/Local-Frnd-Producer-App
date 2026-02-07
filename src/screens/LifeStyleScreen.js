import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
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

  /* ===== PARAMS ===== */
  const { selected = [] } = route.params || {};

  /* ===== REDUX ===== */
  const { data = [], options = [] } = useSelector(
    (state) => state.lifestyle
  );

  /* ===== LOCAL STATE ===== */
  const [selectedChoices, setSelectedChoices] = useState(() => {
    const map = {};
    selected.forEach((item) => {
      map[item.categoryId] = item.id;
    });
    return map;
  });

  /* ===== FETCH DATA ===== */
  useEffect(() => {
    dispatch({ type: FETCH_LIFESTYLE_REQUEST });
    dispatch({ type: FETCH_LIFESTYLE_OPTIONS_REQUEST });
  }, []);

  /* ===== HANDLE CHANGE ===== */
  const handleSelect = (category, value) => {
    setSelectedChoices((prev) => ({
      ...prev,
      [category.id]: value,
    }));
  };

  /* ===== DONE ===== */
  const handleDone = () => {
    const finalSelection = Object.entries(selectedChoices).map(
      ([categoryId, lifestyleId]) => {
        const opt = options.find(
          (o) =>
            o.lifestyle_id === lifestyleId &&
            o.category_id === Number(categoryId)
        );

        return {
          categoryId: Number(categoryId),
          categoryName: opt?.category_name,
          id: opt?.lifestyle_id,
          name: opt?.lifestyle_name,
        };
      }
    );

    navigation.navigate({
      name: "EditProfileScreen",
      params: {
        updatedLifestyles: finalSelection,
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

      {/* ===== CONTENT ===== */}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {data.map((category) => {
          const categoryOptions = options.filter(
            (o) => o.category_id === category.id
          );

          return (
            <View key={category.id} style={styles.section}>
              <Text style={styles.categoryTitle}>{category.name}</Text>

              {categoryOptions.length > 0 ? (
                <View style={styles.dropdown}>
                  <Picker
                    selectedValue={selectedChoices[category.id] || ""}
                    onValueChange={(value) =>
                      handleSelect(category, value)
                    }
                  >
                    <Picker.Item label="Select..." value="" />
                    {categoryOptions.map((opt) => (
                      <Picker.Item
                        key={opt.lifestyle_id}
                        label={opt.lifestyle_name}
                        value={opt.lifestyle_id}
                      />
                    ))}
                  </Picker>
                </View>
              ) : (
                <Text style={styles.notAvailable}>
                  Not available
                </Text>
              )}
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
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 40,
  },

  headerTitle: { fontSize: 18, fontWeight: "600" },
  doneText: { color: PURPLE, fontWeight: "700" },

  section: {
    paddingHorizontal: 20,
    marginTop: 16,
  },

  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#444",
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  notAvailable: {
    color: "#999",
    fontSize: 14,
    paddingVertical: 10,
  },
});
