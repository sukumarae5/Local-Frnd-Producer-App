import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BackgroundPagesOne from "../components/BackgroundPages/BackgroundPagesOne";
import AnimatedLogo from "../components/SampleLogo/AnimatedLogo";

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => (
  <BackgroundPagesOne>
    <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Animated Logo */}
        <AnimatedLogo style={styles.animatedLogo} />

        {/* Content */}
        <View style={styles.centerContent}>
          <View style={styles.midcontent}>

          <Text style={styles.title}>Get Started</Text>

          <Text style={styles.subtitle}>
            By tapping <Text style={{ fontWeight: 'bold' }}>Log In</Text>, you agree to our
          </Text>

          <TouchableOpacity>
            <Text style={styles.link}>Terms & Privacy Policy</Text>
          </TouchableOpacity>

          </View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Phone')}
            >
              <Icon name="phone" size={22} color="#fff" style={styles.icon} />
              <Text style={styles.buttonText}>Log in with Phone number</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity>
            <Text style={styles.troubleLink}>Trouble Logging In?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  </BackgroundPagesOne>
);

export default LoginScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'android' ? height * 0.06 : height * 0.02,
  },

  animatedLogo: {
    marginTop: -height * 0.07,   // ⬆️ pushes logo up
    marginBottom: height * 0.02,
  },

  midcontent: {
  marginTop: -height * 0.03,     // space from top
  marginBottom: height * 0.05,  // space from bottom
  alignItems: 'center',
},

centerContent: {
     
    width: '88%',
    alignItems: 'center',
  },

  title: {
    marginTop:-height*0.04,
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },

  subtitle: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 4,
  },

  link: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 26, // ⬅️ more space before buttons
    marginTop: 6,
  },

  buttonGroup: {
    width: '100%',
    marginBottom: 26,
  },

  button: {
    marginTop:height*0.030,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C724C7',
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },

  icon: {
    marginRight: 16,
  },

  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },

  troubleLink: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontSize: 13.5,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 4,
  },
});
