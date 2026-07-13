import React, { useEffect, useState, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CLEAR_UPDATE_INTERESTS } from '../features/interest/interestTypes';

import { fetchInterestsRequest, updateselectinterestsrequest } from '../features/interest/interestActions';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const EditUserInterestScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { selected = [] } = route.params || {};

  const { interests = [], updateselectedInterests, loading } = useSelector((state) => state.interest);

  const [localSelection, setLocalSelection] = useState(selected);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHandled, setIsHandled] = useState(false);

  useEffect(() => {
    dispatch(fetchInterestsRequest());
  }, [dispatch]);

  const toggleInterest = (item) => {
    setLocalSelection((prev) =>
      prev.some((i) => i.id === item.id) ? prev.filter((i) => i.id !== item.id) : [...prev, item]
    );
  };

  const handleDone = () => {
    const interestIds = localSelection.map((item) => item.id);
    setIsSubmitting(true);
    dispatch(updateselectinterestsrequest({ interests: interestIds }));
  };

  useEffect(() => {
    if (!updateselectedInterests || isHandled) return;

    const isSuccess = updateselectedInterests?.success === true;
    const safeMessage = typeof updateselectedInterests?.message === 'string' ? updateselectedInterests.message : 'Operation completed';

    setIsSubmitting(false);
    setIsHandled(true);

    Alert.alert(isSuccess ? 'Success ✅' : 'Error ❌', safeMessage, [
      {
        text: 'OK',
        onPress: () => {
          if (isSuccess) {
            dispatch({ type: CLEAR_UPDATE_INTERESTS });
            navigation.navigate('EditProfileScreen');
          }
        },
      },
    ]);
  }, [updateselectedInterests, isHandled, dispatch, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => setIsHandled(false));
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={theme.hitSlop}>
            <Icon name="chevron-back" size={moderateScale(26)} color={colors.icon} />
          </TouchableOpacity>

          <AppText variant="h4" style={styles.headerTitle}>Edit Interests</AppText>

          <TouchableOpacity onPress={handleDone} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.editPurple} size="small" />
            ) : (
              <AppText variant="subtitle" style={styles.done}>DONE</AppText>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {loading && interests.length === 0 && (
            <AppText variant="body" color="textMuted" style={styles.empty}>Loading interests...</AppText>
          )}

          {interests.map((item) => {
            const selectedItem = localSelection.some((i) => i.id === item.id);

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.row, selectedItem && styles.selectedRow]}
                onPress={() => toggleInterest(item)}
                activeOpacity={0.8}
              >
                <AppText variant="body" style={styles.text}>{item.name}</AppText>

                {selectedItem && <Icon name="checkmark-circle" size={moderateScale(20)} color={colors.editPurple} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default EditUserInterestScreen;

const createStyles = (theme) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, backgroundColor: colors.background },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },

    headerTitle: {},
    done: { color: colors.editPurple, fontWeight: '700' },

    scrollContent: { paddingBottom: spacing.xl },

    empty: { textAlign: 'center', marginTop: spacing.xxxl },

    row: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },

    selectedRow: { backgroundColor: colors.lavenderTint },

    text: { color: colors.text },
  });
};