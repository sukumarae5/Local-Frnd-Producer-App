import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import {
  FETCH_COUNTRIES_REQUEST,
  
} from "../features/Countries/locationTypes";
import {fetchStatesRequest} from "../features/Countries/locationActions"
import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";
import { newUserDataRequest } from "../features/user/userAction";
const { width } = Dimensions.get("window");

export default function SelectYourCountryScreen({ navigation }) {
  const dispatch = useDispatch();

  const location = useSelector((state) => state.location ?? {});
  const countries = location.countries ?? [];
  const loading = location.loading ?? false;
  const error = location.error ?? null;

  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    dispatch({ type: FETCH_COUNTRIES_REQUEST });
    dispatch(newUserDataRequest());
  }, []);

  const filteredData = countries.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
        <WelcomeScreenbackgroungpage>


    <View style={styles.container}>
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="chevron-back" size={26} color="#000" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Select Your Country</Text>

      {/* Search */}
      <View style={styles.searchBox}>
        <Icon name="search-outline" size={20} color="#999" style={{ marginLeft: 8 }} />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          />
      </View>

      {/* Loading */}
      {loading && <ActivityIndicator size="large" color="#B45BFA" style={{ marginTop: 50 }} />}

      {/* Error */}
      {!loading && error && (
        <Text style={{ textAlign: "center", color: "red", marginTop: 20 }}>{error}</Text>
      )}

      {/* List */}
      {!loading && !error && (
        <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <TouchableOpacity
          style={[
            styles.row,
            selected?.id === item.id && styles.rowActive,
          ]}
          onPress={() => setSelected(item)}
          >
              <Image
                source={{ uri: item.flag_url }}
                style={{ width: 32, height: 24, borderRadius: 4, marginRight: 10 }}
                />
              <Text style={styles.countryName}>{item.name}</Text>

              {/* Radio */}
              <View style={styles.radioOuter}>
                {selected?.id === item.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          )}
          />
        )}

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => {
          if (!selected) return;
          console.log(selected.id)
          dispatch(fetchStatesRequest(selected.id ));
          // dispatch(newUserDataRequest({Country_id:selected.id}));
          navigation.navigate("FillYourProfileScreen", {
            country_id: selected.id,
           
          });
        }}
        
        >
        <Text style={styles.continueText}>CONTINUE</Text>
      </TouchableOpacity>

      <View style={styles.bottomIndicator} />
    </View>
        </WelcomeScreenbackgroungpage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#F7F0FF",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 15,
    padding: 4,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 30,
  },
  searchBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    height: 48,
    alignItems: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E3D8FF",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 5,
    color: "#000",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    height: 54,
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E3D8FF",
  },
  rowActive: {
    borderColor: "#B45BFA",
    backgroundColor: "#F8F0FF",
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: "#222",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#B45BFA",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    backgroundColor: "#B45BFA",
    borderRadius: 5,
  },
  continueButton: {
    position: "absolute",
    bottom: 50,
    width: width - 40,
    alignSelf: "center",
    backgroundColor: "#B45BFA",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  continueText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  bottomIndicator: {
    position: "absolute",
    bottom: 10,
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#aaa",
    alignSelf: "center",
  },
});
