import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { useSelector } from 'react-redux';
import ContinueButton from '../components/Common/ContinueButton';

const { width, height } = Dimensions.get('window');

const SelectYourIdealMatchScreen = ({ navigation }) => {
  const { userdata } = useSelector(state => state.user);

  const handleContinue = () => {
    const gender = userdata?.user?.gender;

    if (!gender) {
      alert('Gender not found');
      return;
    }

    navigation.reset({
      index: 0,
      routes: [
        {
          name: gender === 'Male' ? 'MaleHomeTabs' : 'ReceiverBottomTabs',
        },
      ],
    });
  };

  return (
    <WelcomeScreenbackgroundgpage>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={width * 0.06} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Select Your Ideal Match</Text>
        </View>

        {/* MAIN CONTENT */}
        <View style={styles.mainWrapper}>
          {/* TOP CARD */}
          <LinearGradient
            colors={['#D916F1', '#7E0FFF']}
            style={styles.topCard}
          >
            <Image
              source={require('../components/BackgroundPages/main_log1.png')}
              style={styles.cardIcon}
            />
            <Text style={styles.cardText}>Love</Text>
          </LinearGradient>

          {/* FLOATING HEARTS */}

          <Icon
            name="heart"
            size={width * 0.07}
            color="#D51BF9"
            style={[
              styles.heartIcon,
              { top: height * 0.12, left: width * 0.1,transform: [{ rotate: '-20deg' }] },
            ]}
          />

          <Icon
            name="heart"
            size={width * 0.12}
            color="#8C37F8"
            style={[
              styles.heartIcon,
              { top: height * 0.13, right: width * 0.04 ,transform: [{ rotate: '20deg' }] },
            ]}
          />
          {/* HAND IMAGE */}
          <Image
            source={require('../assets/lovehand.png')}
            style={styles.handImage}
          />

          {/* TEXT */}
          <Text style={styles.bottomText}>
            Lets{'\n'}Make{'\n'}Friends
          </Text>
        </View>

        {/* BOTTOM HEARTS */}
        <Icon
          name="heart"
          size={width * 0.15}
          color="#D51BF9"
          style={[
            styles.heartIcon,
            { bottom: height * 0.33, left: -width * 0.065  },
          ]}
        />

        <Icon
          name="heart"
          size={width * 0.07}
          color="#8C37F8"
          style={[
            styles.heartIcon,
            { bottom: height * 0.37, right: width * 0.1,transform: [{ rotate: '15deg' }]  },
          ]}
        />
        {/* BUTTON */}
        <View style={styles.bottomFixed}>
          <ContinueButton onPress={handleContinue} />
        </View>
      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default SelectYourIdealMatchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.015,
  },

  headerTitle: {
    fontSize: width * 0.045,
    fontWeight: '700',
    marginLeft: width * 0.03,
  },

  mainWrapper: {
    flex: 1,
    alignItems: 'center',
    marginTop: height * 0.05,
  },

  topCard: {
    width: width * 0.4,
    height: height * 0.22,
    borderRadius: width * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

  cardIcon: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.2,
    backgroundColor: 'white',
    marginBottom: height * 0.01,
  },

  cardText: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: '700',
  },

  smallHeart: {
    width: width * 0.07,
    height: width * 0.07,
    position: 'absolute',
    resizeMode: 'contain',
  },

  handImage: {
    marginTop: height * 0.02,
    width: width * 0.7,
    height: height * 0.22,
    resizeMode: 'contain',
  },

  bottomText: {
    marginTop: height * 0.02,
    fontSize: width * 0.055,
    fontWeight: '700',
    color: '#8A2DFF',
    textAlign: 'center',
    lineHeight: height * 0.035,
  },

  bottomFixed: {
    position: 'absolute',
    bottom: height * 0.025,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  heartIcon: {
    position: 'absolute',
  },
});
