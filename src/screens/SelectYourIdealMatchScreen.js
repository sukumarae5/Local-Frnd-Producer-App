import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import WelcomeScreenbackgroundgpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";
import { useSelector } from "react-redux";

const SelectYourIdealMatchScreen = ({ navigation }) => {
  const { userdata } = useSelector(state => state.user);
  console.log("Selected Gender:", userdata.user.gender)

const handleContinue = () => {
  const gender = userdata?.user?.gender;

  if (!gender) {
    alert("Gender not found");
    return;
  }

  navigation.reset({
    index: 0,
    routes: [
      {
        name:
          gender === "Male"
            ? "MaleHomeTabs"
            : "ReceiverBottomTabs",
      },
    ],
  });
};
  return (
    <WelcomeScreenbackgroundgpage>
      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Your ideal Match</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* TOP FADING BACKGROUND */}
        {/* <LinearGradient
          colors={["#F5E2FF", "#FFFFFF"]}
          style={styles.bgGradient}
        /> */}

        {/* MAIN CONTENT */}
        <View style={styles.mainWrapper}>

          {/* TOP GRADIENT CARD */}
          <LinearGradient
            colors={["#D916F1", "#7E0FFF"]}
            style={styles.topCard}
          >
            <Image
              source={require("../components/BackgroundPages/main_log1.png")}
              style={styles.cardIcon}
            />
            <Text style={styles.cardText}>Love</Text>
          </LinearGradient>

          {/* OVERLAY HEARTS */}
          <Image
            source={require("../assets/smallheart.png")}
            style={[styles.smallHeart, { top: 120, left: 40 }]}
          />
          <Image
            source={require("../assets/smallheart.png")}
            style={[styles.smallHeart, { top: 120, right: 40 ,width:70,height:40}]}
          />

          {/* HANDSHAKE IMAGE */}
          <Image
            source={require("../assets/lovehand.png")}
            style={styles.handImage}
          />

          {/* TITLE TEXT */}
          <Text style={styles.bottomText}>Lets{"\n"}Make{"\n"}Friends</Text>
        </View>
         <Image
            source={require("../assets/smallheart.png")}
            style={[styles.smallHeart, { top: 610, left: -12 ,width:30,height:40}]}
          />
 <Image
            source={require("../assets/smallheart.png")}
            style={[styles.smallHeart, { top: 570, right: 40 ,width:30,height:40}]}
          />

        {/* CONTINUE BUTTON */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleContinue}
          style={styles.continueWrapper}
        >
          <LinearGradient
            colors={["#D916F1", "#7E0FFF"]}
            style={styles.continueBtn}
          >
            <Text style={styles.continueText}>CONTINUE</Text>
          </LinearGradient>
        </TouchableOpacity>

      </SafeAreaView>
    </WelcomeScreenbackgroundgpage>
  );
};

export default SelectYourIdealMatchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginLeft:-100,
        

  },

  bgGradient: {
    width: "100%",
    height: 150,
    position: "absolute",
    top: 0,
    left: 0,
    
  },

  mainWrapper: {
    flex: 1,
    alignItems: "center",
    marginTop: 40,
    paddingTop: 80,
  },

  topCard: {
    width: 150,
    height: 170,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  cardIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 10,
    backgroundColor:"white",
    borderRadius:130
  },

  cardText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  smallHeart: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    position: "absolute",
  },

  handImage: {
    marginTop: 20,
    width: 300,
    height: 180,
    resizeMode: "contain",
  },

  bottomText: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: "700",
    color: "#8A2DFF",
    textAlign: "center",
    lineHeight: 28,
  },

  continueWrapper: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },

  continueBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
