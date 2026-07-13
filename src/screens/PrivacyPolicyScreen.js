import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <WelcomeScreenbackgroungpage>
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.header}>
          <Icon name="arrow-back" size={moderateScale(22)} color={colors.icon} onPress={() => navigation.goBack()} />
          <AppText variant="h3" style={styles.headerTitle}>Privacy Policy</AppText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <AppText variant="h3" style={styles.title}>LOKALFRND PRIVACY POLICY</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>Last Updated: June 2026</AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>INTRODUCTION</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              Welcome to LokalFrnd ("LokalFrnd", "Platform", "App", "Service", "we", "our", or "us").{'\n\n'}
              LokalFrnd is a social networking, friendship, communication, and entertainment platform that enables users to connect with others through chat, audio calls, video calls, virtual gifting, live interactions, subscriptions, and other social features.{'\n\n'}
              This Privacy Policy explains how we collect, use, store, process, disclose, and protect your personal information when you use the LokalFrnd mobile application, website, and related services collectively referred to as the "Platform".{'\n\n'}
              By accessing or using LokalFrnd, you agree to this Privacy Policy and consent to our collection and processing of your information as described herein.{'\n\n'}
              If you do not agree with this Privacy Policy, please discontinue use of the Platform.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>INFORMATION WE COLLECT</AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>Account Information</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              When you register on LokalFrnd, we may collect:{'\n'}
              • Mobile Number{'\n'}• OTP Verification Details{'\n'}• User ID{'\n'}• Username{'\n'}• Gender{'\n'}• Date of Birth{'\n'}• Language Preference{'\n'}• Profile Photo{'\n'}• Bio/About Information{'\n'}• Referral Information{'\n'}
              This information helps us create and manage your account.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>Profile Information</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              You may voluntarily provide:{'\n'}
              • Profile Images{'\n'}• Personal Interests{'\n'}• Education Information{'\n'}• Occupation Details{'\n'}• Relationship Preferences{'\n'}• Social Media Links{'\n'}• Voice Introductions{'\n'}
              This information is used to improve user matching and platform engagement.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>Communications and Interactions</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              We may collect information related to:{'\n'}
              • Private Chats{'\n'}• Group Chats{'\n'}• Audio Calls{'\n'}• Video Calls{'\n'}• Voice Notes{'\n'}• Virtual Gifts{'\n'}• Friend Requests{'\n'}• User Interactions{'\n'}• User Reports{'\n'}
              We use this information to provide communication services, maintain platform safety, and improve user experience.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>Device Information</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              We may automatically collect:{'\n'}
              • Device Model{'\n'}• Device Manufacturer{'\n'}• Operating System{'\n'}• App Version{'\n'}• Device Identifiers{'\n'}• IP Address{'\n'}• Mobile Network Information{'\n'}• Browser Information{'\n'}• Crash Logs{'\n'}• Diagnostic Data{'\n'}
              This information helps us maintain service quality and security.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>Location Information</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              With your permission, we may collect:{'\n'}
              • GPS Location{'\n'}• Approximate Location{'\n'}• IP-Based Location{'\n'}• City and State Information{'\n'}
              Location data helps us:{'\n'}
              • Match nearby users{'\n'}• Improve recommendations{'\n'}• Prevent fraud{'\n'}• Enhance security
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>Payment Information</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              For purchases, subscriptions, coin packages, and premium services, we may collect:{'\n'}
              • Transaction IDs{'\n'}• Purchase History{'\n'}• Wallet Activity{'\n'}• Payment Status{'\n'}• Subscription Details{'\n'}
              Payments are processed through authorized payment providers.{'\n'}
              LokalFrnd does not store complete debit card, credit card, UPI PIN, or banking credentials.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>Camera and Microphone Permissions</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              To provide audio and video communication services, we may access:{'\n'}
              • Camera{'\n'}• Microphone{'\n'}• Media Uploads{'\n'}• Photo Gallery{'\n'}
              These permissions are only used when you grant access and utilize related features.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>Face Detection and Content Moderation</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              To maintain user safety and platform integrity, LokalFrnd may use automated moderation technologies including:{'\n'}
              • Face Presence Detection{'\n'}• Identity Verification Checks{'\n'}• Content Classification Systems{'\n'}• Nudity Detection{'\n'}• Violence Detection{'\n'}• Policy Violation Detection{'\n'}
              If prohibited content is detected, the Platform may:{'\n'}
              • Blur Content{'\n'}• Restrict Features{'\n'}• Suspend Accounts{'\n'}• Permanently Ban Users
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>Contacts Permission</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              With your consent, LokalFrnd may access your contacts to:{'\n'}
              • Invite Friends{'\n'}• Improve User Discovery{'\n'}• Provide Referral Features{'\n'}
              You may revoke this permission at any time through device settings.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>Cookies and Analytics</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              We may use:{'\n'}
              • Cookies{'\n'}• Local Storage{'\n'}• Analytics SDKs{'\n'}• Tracking Technologies{'\n'}
              These technologies help us:{'\n'}
              • Improve Platform Performance{'\n'}• Analyze User Behavior{'\n'}• Prevent Fraud{'\n'}• Personalize User Experience
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>HOW WE USE YOUR INFORMATION</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              We use collected information to:{'\n'}
              • Create and Manage User Accounts{'\n'}• Verify User Identity{'\n'}• Enable Chat, Audio, and Video Calling Features{'\n'}• Process Purchases and Payments{'\n'}• Deliver Coins, Gifts, and Rewards{'\n'}• Personalize Recommendations{'\n'}• Improve Matching Algorithms{'\n'}• Detect Fraud and Abuse{'\n'}• Enforce Community Guidelines{'\n'}• Respond to User Support Requests{'\n'}• Improve Platform Performance{'\n'}• Conduct Research and Analytics{'\n'}• Comply with Legal Obligations
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>HOW INFORMATION IS SHARED</AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>Information Visible to Other Users</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              Depending on your privacy settings, other users may see:{'\n'}
              • Username{'\n'}• Profile Picture{'\n'}• Age{'\n'}• Gender{'\n'}• Language{'\n'}• Bio{'\n'}• Online Status{'\n'}
              Information shared during calls, chats, live rooms, and public interactions may also be visible to other participants.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>Service Providers</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              We may share information with trusted service providers that assist with:{'\n'}
              • Cloud Hosting{'\n'}• Analytics{'\n'}• Customer Support{'\n'}• Payment Processing{'\n'}• OTP Delivery{'\n'}• Security Monitoring{'\n'}• Fraud Prevention{'\n'}
              These providers are required to protect your information.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>Legal Compliance</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              We may disclose information:{'\n'}
              • To comply with legal obligations{'\n'}• To respond to court orders{'\n'}• To investigate fraud{'\n'}• To protect users and the Platform{'\n'}• To enforce our Terms and Policies
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>Business Transfers</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              If LokalFrnd undergoes a merger, acquisition, restructuring, or sale of assets, your information may be transferred as part of that transaction.{'\n'}
              Users will be notified where legally required.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>DATA RETENTION</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              We retain personal information only for as long as necessary to:{'\n'}
              • Provide Services{'\n'}• Comply with Laws{'\n'}• Resolve Disputes{'\n'}• Prevent Fraud{'\n'}• Enforce Agreements{'\n'}
              Certain records may be retained even after account deletion where required by law.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>ACCOUNT DELETION</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              Users may request account deletion through:{'\n'}
              • App Settings{'\n'}• Customer Support{'\n'}
              After verification, personal information will be deleted or anonymized within a reasonable timeframe unless retention is required by law.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>YOUR RIGHTS</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              Subject to applicable law, you may:{'\n'}
              • Access Your Personal Information{'\n'}• Correct Inaccurate Information{'\n'}• Request Data Deletion{'\n'}• Withdraw Consent{'\n'}• Request Data Portability{'\n'}• Restrict Certain Processing Activities{'\n'}
              For privacy-related requests, contact:{'\n'}
              Email: support@lokalfrnd.com
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>CHILDREN'S PRIVACY</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              LokalFrnd is intended only for users who are at least 18 years of age.{'\n'}
              We do not knowingly collect information from children.{'\n'}
              Accounts identified as belonging to minors may be removed immediately.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>SECURITY PRACTICES</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              We use industry-standard measures including:{'\n'}
              • Secure Servers{'\n'}• Encryption{'\n'}• Authentication Controls{'\n'}• Access Restrictions{'\n'}• Monitoring Systems{'\n'}
              While we strive to protect your information, no online system can guarantee complete security.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>THIRD-PARTY SERVICES</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              The Platform may integrate with third-party services such as:{'\n'}
              • Google Services{'\n'}• AWS Cloud Services{'\n'}• Firebase{'\n'}• Razorpay{'\n'}• PhonePe{'\n'}• Cashfree{'\n'}• Analytics Providers{'\n'}
              These services operate under their own privacy policies.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>CHANGES TO THIS POLICY</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              We may update this Privacy Policy periodically.{'\n'}
              Material changes will be communicated through the Platform.{'\n'}
              Continued use of LokalFrnd after updates constitutes acceptance of the revised Privacy Policy.
            </AppText>

            <AppText variant="subtitle" style={styles.sectionTitle}>CONTACT US</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.text}>
              LokalFrnd Support{'\n'}
              Email: support@lokalfrnd.com{'\n'}
              Website: www.lokalfrnd.com{'\n'}
              Business Address: [Your Registered Company Address]{'\n'}
              By using LokalFrnd, you acknowledge that you have read, understood, and agreed to this Privacy Policy.
            </AppText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </WelcomeScreenbackgroungpage>
  );
};

export default PrivacyPolicyScreen;

const createStyles = (theme) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    container: { flex: 1 },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      marginBottom: spacing.sm,
    },

    headerTitle: { marginLeft: spacing.sm },

    scrollContainer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },

    card: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      padding: spacing.lg,
      marginTop: spacing.sm,
      ...theme.shadows.sm,
    },

    title: { color: colors.purple, textAlign: 'center', marginBottom: spacing.lg },

    sectionTitle: { color: colors.purple, marginTop: spacing.lg, marginBottom: spacing.sm },

    text: { lineHeight: moderateScale(22), marginBottom: spacing.xs },
  });
};