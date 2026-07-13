import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import ContinueButton from '../components/Common/ContinueButton';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const FAQ_DATA = [
  { question: 'How to swipe & match?', answer: 'I will give you a complete account.' },
  { question: 'How do I edit my profile?', answer: 'Edit from profile screen.' },
  { question: 'How to get more likes?', answer: 'Use better photos.' },
  { question: 'How to get more matches?', answer: 'Be active daily.' },
  { question: "I'm out of profiles?", answer: 'Expand distance.' },
];

const HelpCenterScreen = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const { height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, height), [theme, height]);

  const [activeTab, setActiveTab] = useState('FAQ');
  const [openIndex, setOpenIndex] = useState(0);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isMessageFocused, setIsMessageFocused] = useState(false);

  return (
    <WelcomeScreenbackgroungpage>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={theme.hitSlop}>
            <Icon name="chevron-back" size={moderateScale(24)} color={colors.icon} />
          </TouchableOpacity>
          <AppText variant="h4" style={styles.headerTitle}>Help Center</AppText>
        </View>

        <View style={styles.tabRow}>
          {['FAQ', 'Support'].map((tab) => (
            <TouchableOpacity key={tab} style={styles.tab} onPress={() => setActiveTab(tab)}>
              <AppText variant="bodySmall" style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </AppText>

              {activeTab === tab && (
                <LinearGradient colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]} style={styles.tabUnderline} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {activeTab === 'FAQ' ? (
            <>
              <LinearGradient colors={[colors.gradientPurpleStart, colors.gradientPurpleEnd]} style={styles.searchGradient}>
                <View style={styles.searchBox}>
                  <Icon name="search" size={moderateScale(18)} color={colors.gradientPurpleStart} />
                  <TextInput
                    placeholder="Search"
                    placeholderTextColor={colors.placeholder}
                    style={styles.searchInput}
                  />
                </View>
              </LinearGradient>

              {FAQ_DATA.map((item, index) => {
                const isOpen = openIndex === index;

                return (
                  <View key={index} style={styles.faqItem}>
                    <TouchableOpacity style={styles.faqHeader} onPress={() => setOpenIndex(isOpen ? null : index)}>
                      <AppText variant="subtitle" style={styles.question}>{item.question}</AppText>
                      <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={moderateScale(18)} color={colors.iconMuted} />
                    </TouchableOpacity>

                    {isOpen && <AppText variant="bodySmall" color="textMuted" style={styles.answer}>{item.answer}</AppText>}
                  </View>
                );
              })}
            </>
          ) : (
            <>
              <AppText variant="bodySmall" style={styles.label}>Full Name</AppText>
              <Input value={name} onChangeText={setName} placeholder="Michael Dam" styles={styles} colors={colors} />

              <AppText variant="bodySmall" style={styles.label}>Email</AppText>
              <Input value={email} onChangeText={setEmail} placeholder="info@gmail.com" styles={styles} colors={colors} />

              <AppText variant="bodySmall" style={styles.label}>Phone Number</AppText>
              <Input value={phone} onChangeText={setPhone} placeholder="+12678899911" styles={styles} colors={colors} />

              <AppText variant="bodySmall" style={styles.label}>Message</AppText>

              <View style={[styles.textAreaWrapper, (isMessageFocused || message) && styles.inputActive]}>
                <TextInput
                  placeholder="Write Your Message"
                  placeholderTextColor={colors.placeholder}
                  multiline
                  value={message}
                  onChangeText={setMessage}
                  onFocus={() => setIsMessageFocused(true)}
                  onBlur={() => setIsMessageFocused(false)}
                  style={styles.textArea}
                />
              </View>
            </>
          )}
        </ScrollView>

        {activeTab === 'Support' && (
          <View style={styles.bottomFixed}>
            <ContinueButton title="SUBMIT" onPress={() => console.log('Submit')} />
          </View>
        )}
      </SafeAreaView>
    </WelcomeScreenbackgroungpage>
  );
};

export default HelpCenterScreen;

const Input = ({ placeholder, value, onChangeText, styles, colors }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.inputBox, (isFocused || value) && styles.inputActive]}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{ color: colors.text }}
      />
    </View>
  );
};

const createStyles = (theme, height) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      marginBottom: spacing.sm,
    },

    headerTitle: { marginLeft: spacing.sm },

    tabRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },

    tab: { paddingVertical: spacing.md },

    tabText: { color: colors.textMuted },

    activeTabText: { fontWeight: '600', color: colors.text },

    tabUnderline: { height: 2, marginTop: spacing.xs, borderRadius: 2 },

    scroll: { padding: spacing.lg, paddingBottom: moderateScale(120) },

    searchGradient: { borderRadius: radius.xl, padding: 1.5, marginBottom: spacing.xl },

    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      paddingHorizontal: spacing.md,
      height: moderateScale(46),
    },

    searchInput: { marginLeft: spacing.sm, flex: 1, color: colors.text },

    faqItem: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider, paddingVertical: spacing.md },

    faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    question: {},

    textAreaWrapper: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },

    answer: { marginTop: spacing.xs },

    label: { marginTop: spacing.md, marginBottom: spacing.xs },

    inputBox: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      paddingHorizontal: spacing.md,
      height: moderateScale(48),
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
    },

    inputActive: { borderColor: colors.gradientPurpleStart, borderWidth: 1.5 },

    textArea: { height: moderateScale(110), padding: spacing.sm, textAlignVertical: 'top', color: colors.text },

    bottomFixed: { position: 'absolute', bottom: spacing.lg, left: 0, right: 0, alignItems: 'center' },
  });
};