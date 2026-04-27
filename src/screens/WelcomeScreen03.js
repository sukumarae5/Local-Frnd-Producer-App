import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import WelcomeScreenbackgroundgpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import ContinueButton from "../components/Common/ContinueButton"; // adjust path if needed

const { width } = Dimensions.get("window");

const WelcomeScreen03 = ({ navigation }) => {
  return (
    <WelcomeScreenbackgroundgpage>
      <View style={styles.container}>
        
        {/* LOGO */}
        <Image
          source={require("../components/BackgroundPages/main_log1.png")}
          style={styles.logo}
        />

        {/* CENTER HEART IMAGE */}
        <View style={styles.heartWrapper}>
          <Image
            source={require("../assets/coupleimage.png")} // 🔥 your center couple heart image
            style={styles.coupleHeart}
          />
        </View>

        {/* FLOATING SMALL HEARTS */}
       
{/* ❤️ HEART 1 */}
<MaskedView
  style={[styles.smallHeart, { top: 240, left: 60, width: 18, height: 18,transform: [{ rotate: '-40deg' }], }]}
  maskElement={<Ionicons name="heart" size={18} color="black" />}
>
  <LinearGradient
    colors={['#D51BF9', '#8C37F8']}
    style={{ flex: 1 }}
  />
</MaskedView>

{/* ❤️ HEART 2 */}
<MaskedView
  style={[
    styles.smallHeart,
    { top: 260, right: 40, width: 28, height: 28 ,transform: [{ rotate: '20deg' }],}, // 🔥 ADD THIS
  ]}
  maskElement={<Ionicons name="heart" size={28} color="black" />}
>
  <LinearGradient
    colors={['#D51BF9', '#8C37F8']}
    style={{ flex: 1 }}
  />
</MaskedView>

{/* ❤️ HEART 3 */}
<MaskedView
  style={[styles.smallHeart, { bottom: 280, left: -20, width: 40, height: 40 }]}
  maskElement={<Ionicons name="heart" size={40} color="black" />}
>
  <LinearGradient
    colors={['#D51BF9', '#8C37F8']}
    style={{ flex: 1 }}
  />
</MaskedView>

{/* ❤️ HEART 4 */}
<MaskedView
  style={[styles.smallHeart, { bottom: 280, left: 300, width: 20, height: 20,transform: [{ rotate: '20deg' }], }]}
  maskElement={<Ionicons name="heart" size={20} color="black" />}
>
  <LinearGradient
    colors={['#D51BF9', '#8C37F8']}
    style={{ flex: 1 }}
  />
</MaskedView>
        {/* TEXT */}
        <View style={styles.textWrapper}>
          <Text style={styles.title}>Don’t wait anymore, find</Text>
          <Text style={styles.title}>your soulmate right now!</Text>
        </View>

        {/* CALL TO ACTION BUTTON */}
      {/* FIXED BUTTON */}
<View style={styles.bottomFixed}>
  <ContinueButton
    title="GET STARTED"
    onPress={() => {
      console.log("Pressed");
      navigation.navigate("Phone");
    }}
  />
</View>
      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default WelcomeScreen03;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    width: "100%",
  },

  logo: {
   
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 40,
  },

  heartWrapper: {
    width: width * 0.8,
    height: width * 0.65,
    justifyContent: "center",
    alignItems: "center",
  },

  coupleHeart: {
    marginTop:100,
    width: "90%",
    height: "90%",
    resizeMode: "contain",
  },

  smallHeart: {
   
    position: "absolute",
    
  },

  textWrapper: {
    marginTop: 120,
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5b4747ff",
    textAlign: "center",
  },

  bottomFixed: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
