import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BackgroundPagesOne from "../components/BackgroundPages/BackgroundPagesOne";
import AnimatedLogo from "../components/SampleLogo/AnimatedLogo";

const { width } = Dimensions.get('window');

const LoginScreen = ({navigation}) => (
  <BackgroundPagesOne>
    <StatusBar barStyle="light-content" />

    <View style={styles.container}>
      {/* Animated Logo */}
      <AnimatedLogo style={styles.animatedLogo} />

      {/* Main Content stacked below logo */}
      <View style={styles.centerContent}>
        <Text style={styles.title}>Get Started</Text>
        <Text style={styles.subtitle}>
          By tapping <Text style={{ fontWeight: 'bold' }}>Log In</Text> , you agree to our
        </Text>
        <TouchableOpacity>
          <Text style={styles.link}>Terms & Privacy Policy</Text>
        </TouchableOpacity>
        <View style={styles.buttonGroup}>
          
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Phone')}>
            <Icon name="phone" size={22} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Log in with Phone number</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Text style={styles.troubleLink}>Trouble Logging In?</Text>
        </TouchableOpacity>
      </View>
    </View>
  </BackgroundPagesOne>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // stack logo at the top
    paddingTop: 72, // space from status bar
  },
  animatedLogo: {
    marginBottom: 28, // tight space between logo and content
  },
  centerContent: {
    width: '88%',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  subtitle: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 2,
  },
  link: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 3,
  },
  buttonGroup: {
    width: '100%',
    marginBottom: 18,
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C724C7',
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 16,
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
    marginBottom: 2,
    fontWeight: '500',
  },
});

export default LoginScreen;
