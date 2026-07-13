import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const AppsettingScreen = () => {
  const navigation = useNavigation();
  const { theme } = useAppTheme();
  const { colors, spacing } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <WelcomeScreenbackgroungpage>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={theme.hitSlop}
          >
            <Icon
              name="arrow-back"
              size={moderateScale(22)}
              color={colors.icon}
            />
          </TouchableOpacity>
          <AppText variant="h3" style={styles.headerTitle}>
            App Settings
          </AppText>
        </View>

        <View style={styles.listBox}>
          <Item
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyPolicyScreen')}
          />
          <Item
            icon="document-text-outline"
            title="Terms of Use"
            onPress={() => navigation.navigate('TermsofUseScreen')}
          />
          <Item
            icon="people-outline"
            title="Community Guidelines"
            onPress={() => navigation.navigate('CummunityGuidelineScreen')}
          />
          <Item icon="language-outline" title="App Language" />
          <Item icon="chatbubbles-outline" title="Customer Support Chat" />
          <Item icon="information-circle-outline" title="About Local Frnd" />
          <Item
            icon="settings-outline"
            title="Settings"
            onPress={() => navigation.navigate('SettingScreen')}
          />
          <Item icon="card-outline" title="Payment Policy" />
          <Item icon="shield-half-outline" title="Safety Center" />
        </View>
      </ScrollView>
    </WelcomeScreenbackgroungpage>
  );
};

/* ---------- REUSABLE ITEM ---------- */
const Item = ({ icon, title, onPress }) => {
  const { theme } = useAppTheme();
  const { colors, spacing } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]}
        useAngle
        angle={75.05}
        style={styles.iconCircle}
      >
        <Icon name={icon} size={moderateScale(18)} color={colors.textInverse} />
      </LinearGradient>

      <AppText variant="subtitle" style={styles.itemText}>
        {title}
      </AppText>

      <Icon
        name="chevron-forward"
        size={moderateScale(18)}
        color={colors.textMuted}
      />
    </TouchableOpacity>
  );
};

export default AppsettingScreen;

const createStyles = theme => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    container: { flex: 1 },

    scrollContainer: {
      flexGrow: 1,
      paddingBottom: spacing.xxxl,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      marginBottom: spacing.sm,
    },

    headerTitle: {
      marginLeft: spacing.sm,
    },

    listBox: {
      marginTop: spacing.xl,
    },

    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },

    iconCircle: {
      width: moderateScale(34),
      height: moderateScale(34),
      borderRadius: moderateScale(17),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
      overflow: 'hidden',
    },

    itemText: {
      flex: 1,
    },
  });
};
