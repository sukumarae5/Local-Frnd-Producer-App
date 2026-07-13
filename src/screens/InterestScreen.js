import React, { useEffect, useState, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInterestsRequest, selectInterestsRequest } from '../features/interest/interestActions';
import ContinueButton from '../components/Common/ContinueButton';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const InterestScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const { height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, height), [theme, height]);

  const { interests, message, selectedInterests } = useSelector((state) => state.interest);

  const [selected, setSelected] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResponseHandled, setIsResponseHandled] = useState(false);

  useEffect(() => {
    dispatch(fetchInterestsRequest());
  }, [dispatch]);

  const toggleSelect = (item) => {
    setSelected((prev) => (prev.includes(item.id) ? prev.filter((v) => v !== item.id) : [...prev, item.id]));
  };

  useEffect(() => {
    if (!message || isResponseHandled) return;

    const isSuccess = selectedInterests?.success === true;

    setIsSubmitting(false);
    setIsResponseHandled(true);

    Alert.alert(isSuccess ? 'Success ✅' : 'Error ❌', message, [
      {
        text: 'OK',
        onPress: () => {
          if (isSuccess) navigation.navigate('GenderScreen');
        },
      },
    ]);
  }, [message, selectedInterests, isResponseHandled, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => setIsResponseHandled(false));
    return unsubscribe;
  }, [navigation]);

  const handleSubmit = () => {
    if (selected.length === 0) return;
    setIsSubmitting(true);
    dispatch(selectInterestsRequest({ interests: selected }));
  };

  return (
    <WelcomeScreenbackgroundgpage>
      <SafeAreaView style={styles.flex} edges={[]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={theme.hitSlop}>
              <Icon name="chevron-back" size={moderateScale(26)} color={colors.icon} />
            </TouchableOpacity>
            <AppText variant="h4" style={styles.headerTitle}>Select Your Interest</AppText>
          </View>

          <AppText variant="bodySmall" color="textSecondary" style={styles.subText}>
            Select your interests to match with soul mate who have similar things in common
          </AppText>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.tagsWrapper}>
              {interests?.map((item) => {
                const active = selected.includes(item.id);

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => toggleSelect(item)}
                    style={[styles.tag, active && styles.tagActive]}
                  >
                    <AppText variant="bodySmall" style={[styles.tagText, active && styles.tagTextActive]}>
                      {item.name}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={styles.bottomFixed}>
          <ContinueButton disabled={selected.length === 0} loading={isSubmitting} onPress={handleSubmit} />
        </View>
      </SafeAreaView>
    </WelcomeScreenbackgroundgpage>
  );
};

export default InterestScreen;

const createStyles = (theme, height) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    flex: { flex: 1 },

    container: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },

    header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xxl },
    headerTitle: { marginLeft: spacing.sm },

    subText: { marginBottom: spacing.xxl, lineHeight: moderateScale(20) },

    scrollContent: { paddingBottom: height * 0.12 },

    tagsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },

    tag: {
      borderWidth: 1,
      borderColor: '#E3D4FF',
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: '#FFEFFE',
      marginTop: spacing.sm,
    },

    tagActive: {
      backgroundColor: colors.accentViolet,
      borderColor: colors.accentViolet,
    },

    tagText: { color: '#4c4c4c', fontWeight: '500' },
    tagTextActive: { color: '#FFFFFF' },

    bottomFixed: {
      position: 'absolute',
      bottom: spacing.lg,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
  });
};