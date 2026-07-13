import React, { useMemo } from 'react';
import {
  View,
  Image,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import ContinueButton from '../components/Common/ContinueButton';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const WelcomeScreen03 = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const { width, height } = useWindowDimensions();

  const styles = useMemo(
    () => createStyles(theme, width, height),
    [theme, width, height],
  );

  return (
    <WelcomeScreenbackgroundgpage>
      <View style={styles.container}>

        {/* Logo */}
        <View style={styles.logoSection}>
          <Image
            source={require('../components/BackgroundPages/main_log1.png')}
            style={styles.logo}
          />
        </View>

        {/* Center */}
        <View style={styles.centerSection}>

          <View style={styles.heartWrapper}>

            <Image
              source={require('../assets/coupleimage.png')}
              style={styles.coupleHeart}
            />

            {/* Heart 1 */}
            <MaskedView
              style={[styles.smallHeart, styles.heart1]}
              maskElement={
                <Ionicons
                  name="heart"
                  size={styles.icon18.width}
                  color="black"
                />
              }>
              <LinearGradient
                colors={[
                  colors.gradientPurpleStart,
                  colors.gradientPurpleEnd,
                ]}
                style={styles.icon18}
              />
            </MaskedView>

            {/* Heart 2 */}
            <MaskedView
              style={[styles.smallHeart, styles.heart2]}
              maskElement={
                <Ionicons
                  name="heart"
                  size={styles.icon28.width}
                  color="black"
                />
              }>
              <LinearGradient
                colors={[
                  colors.gradientPurpleStart,
                  colors.gradientPurpleEnd,
                ]}
                style={styles.icon28}
              />
            </MaskedView>

            {/* Heart 3 */}
            <MaskedView
              style={[styles.smallHeart, styles.heart3]}
              maskElement={
                <Ionicons
                  name="heart"
                  size={styles.icon40.width}
                  color="black"
                />
              }>
              <LinearGradient
                colors={[
                  colors.gradientPurpleStart,
                  colors.gradientPurpleEnd,
                ]}
                style={styles.icon40}
              />
            </MaskedView>

            {/* Heart 4 */}
            <MaskedView
              style={[styles.smallHeart, styles.heart4]}
              maskElement={
                <Ionicons
                  name="heart"
                  size={styles.icon20.width}
                  color="black"
                />
              }>
              <LinearGradient
                colors={[
                  colors.gradientPurpleStart,
                  colors.gradientPurpleEnd,
                ]}
                style={styles.icon20}
              />
            </MaskedView>

          </View>

          <View style={styles.textWrapper}>
            <AppText variant="h4" style={styles.title}>
              Don't wait anymore, find
            </AppText>

            <AppText variant="h4" style={styles.title}>
              your soulmate right now!
            </AppText>
          </View>

        </View>

        {/* Bottom */}
        <View style={styles.bottomSection}>
          <ContinueButton
            title="GET STARTED"
            onPress={() => navigation.navigate('Phone')}
          />
        </View>

      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default WelcomeScreen03;

const createStyles = (theme, width, height) => {

  const logoSize = Math.min(width * 0.32, 140);

  const imageSize = Math.min(width * 0.82, 380);

  const icon18 = Math.max(width * 0.05, 18);
  const icon20 = Math.max(width * 0.055, 20);
  const icon28 = Math.max(width * 0.075, 28);
  const icon40 = Math.max(width * 0.10, 40);

  return StyleSheet.create({

    container: {
      flex: 1,
    },

    logoSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    logo: {
      width: logoSize,
      height: logoSize,
      resizeMode: 'contain',
    },

    centerSection: {
      flex: 3,
      justifyContent: 'center',
      alignItems: 'center',
    },

    heartWrapper: {
      width: imageSize,
      height: imageSize,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },

    coupleHeart: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },

    textWrapper: {
      marginTop: height * 0.02,
      alignItems: 'center',
      paddingHorizontal: width * 0.08,
    },

    title: {
      textAlign: 'center',
      color: '#5b4747',
    },

    bottomSection: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: height * 0.035,
    },

    smallHeart: {
      position: 'absolute',
    },

    heart1: {
      top: '12%',
      left: '10%',
      transform: [{ rotate: '-35deg' }],
    },

    heart2: {
      top: '22%',
      right: '6%',
      transform: [{ rotate: '25deg' }],
    },

    heart3: {
      bottom: '20%',
      left: '-3%',
    },

    heart4: {
      bottom: '18%',
      right: '4%',
      transform: [{ rotate: '20deg' }],
    },

    icon18: {
      width: icon18,
      height: icon18,
    },

    icon20: {
      width: icon20,
      height: icon20,
    },

    icon28: {
      width: icon28,
      height: icon28,
    },

    icon40: {
      width: icon40,
      height: icon40,
    },

  });
};