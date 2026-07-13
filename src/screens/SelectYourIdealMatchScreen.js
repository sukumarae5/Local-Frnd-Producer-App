import React, { useMemo } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { useSelector } from 'react-redux';
import ContinueButton from '../components/Common/ContinueButton';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const SelectYourIdealMatchScreen = ({ navigation }) => {
  const { userdata } = useSelector((state) => state.user);
  const { theme } = useAppTheme();
  const { colors, spacing } = theme;
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width, height), [theme, width, height]);

  const handleContinue = () => {
    const gender = userdata?.user?.gender;

    if (!gender) {
      alert('Gender not found');
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: gender === 'Male' ? 'MaleHomeTabs' : 'ReceiverBottomTabs' }],
    });
  };

  return (
    <WelcomeScreenbackgroundgpage>
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={theme.hitSlop}>
            <Icon name="chevron-back" size={moderateScale(22)} color={colors.icon} />
          </TouchableOpacity>
          <AppText variant="h4" style={styles.headerTitle}>Select Your Ideal Match</AppText>
        </View>

        <View style={styles.mainWrapper}>
          <LinearGradient colors={['#D916F1', '#7E0FFF']} style={styles.topCard}>
            <Image source={require('../components/BackgroundPages/main_log1.png')} style={styles.cardIcon} />
            <AppText variant="h3" style={styles.cardText}>Love</AppText>
          </LinearGradient>

          <Icon
            name="heart"
            size={moderateScale(25)}
            color="#D51BF9"
            style={[styles.heartIcon, { top: height * 0.12, left: width * 0.1, transform: [{ rotate: '-20deg' }] }]}
          />

          <Icon
            name="heart"
            size={moderateScale(43)}
            color="#8C37F8"
            style={[styles.heartIcon, { top: height * 0.13, right: width * 0.04, transform: [{ rotate: '20deg' }] }]}
          />

          <Image source={require('../assets/lovehand.png')} style={styles.handImage} />

          <AppText variant="h2" style={styles.bottomText}>
            Lets{'\n'}Make{'\n'}Friends
          </AppText>
        </View>

        <Icon
          name="heart"
          size={moderateScale(54)}
          color="#D51BF9"
          style={[styles.heartIcon, { bottom: height * 0.33, left: -width * 0.065 }]}
        />

        <Icon
          name="heart"
          size={moderateScale(25)}
          color="#8C37F8"
          style={[styles.heartIcon, { bottom: height * 0.37, right: width * 0.1, transform: [{ rotate: '15deg' }] }]}
        />

        <View style={styles.bottomFixed}>
          <ContinueButton onPress={handleContinue} />
        </View>
      </SafeAreaView>
    </WelcomeScreenbackgroundgpage>
  );
};

export default SelectYourIdealMatchScreen;

const createStyles = (theme, width, height) => {
  const { colors, spacing } = theme;

  return StyleSheet.create({
    container: { flex: 1, paddingHorizontal: spacing.lg },

    header: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
    headerTitle: { marginLeft: spacing.sm },

    mainWrapper: { flex: 1, alignItems: 'center', marginTop: spacing.xxl },

    topCard: {
      width: width * 0.4,
      height: height * 0.22,
      borderRadius: moderateScale(20),
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
    },

    cardIcon: {
      width: width * 0.15,
      height: width * 0.15,
      borderRadius: width * 0.2,
      backgroundColor: 'white',
      marginBottom: spacing.sm,
    },

    cardText: { color: '#fff' },

    handImage: { marginTop: spacing.sm, width: width * 0.7, height: height * 0.22, resizeMode: 'contain' },

    bottomText: {
      marginTop: spacing.sm,
      color: colors.accentViolet,
      textAlign: 'center',
      lineHeight: height * 0.035,
    },

    bottomFixed: { position: 'absolute', bottom: spacing.md, left: 0, right: 0, alignItems: 'center' },

    heartIcon: { position: 'absolute' },
  });
};