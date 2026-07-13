import React, { useEffect, useState, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  FETCH_LIFESTYLE_REQUEST,
  FETCH_LIFESTYLE_OPTIONS_REQUEST,
  EDIT_USER_LIFESTYLE_REQUEST,
  CLEAR_LIFESTYLE_RESPONSE,
} from '../features/lifeStyle/lifestyleTypes';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

const EditUserLifestyleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { selected = [] } = route.params || {};

  const { data = [], options = [], response, loading } = useSelector((state) => state.lifestyle);

  const [openCategory, setOpenCategory] = useState(null);
  const [localSelection, setLocalSelection] = useState(selected);
  const [isHandled, setIsHandled] = useState(false);

  useEffect(() => {
    dispatch({ type: FETCH_LIFESTYLE_REQUEST });
    dispatch({ type: FETCH_LIFESTYLE_OPTIONS_REQUEST });
  }, [dispatch]);

  const getSelectedLabel = (categoryId) => {
    const found = localSelection.find((i) => i.categoryId === categoryId);
    return found ? found.name : 'Select...';
  };

  const handleSelect = (category, option) => {
    setLocalSelection((prev) => {
      const filtered = prev.filter((i) => i.categoryId !== category.id);

      return [
        ...filtered,
        {
          categoryId: category.id,
          categoryName: category.name,
          id: option.lifestyle_id,
          name: option.lifestyle_name,
        },
      ];
    });

    setOpenCategory(null);
  };

  const handleDone = () => {
    const lifestyleIds = localSelection.map((item) => Number(item.id));

    dispatch({
      type: EDIT_USER_LIFESTYLE_REQUEST,
      payload: { lifestyles: lifestyleIds },
    });
  };

  useEffect(() => {
    if (!response || isHandled) return;

    const isSuccess = response?.success === true;

    Alert.alert(isSuccess ? 'Success ✅' : 'Error ❌', response?.message || 'Operation completed', [
      {
        text: 'OK',
        onPress: () => {
          dispatch({ type: CLEAR_LIFESTYLE_RESPONSE });
          if (isSuccess) {
            navigation.navigate('EditProfileScreen');
          }
        },
      },
    ]);

    setIsHandled(true);
  }, [response, isHandled, dispatch, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => setIsHandled(false));
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={theme.hitSlop}>
          <Icon name="chevron-back" size={moderateScale(26)} color={colors.icon} />
        </TouchableOpacity>

        <AppText variant="h4" style={styles.headerTitle}>Edit Lifestyle</AppText>

        <TouchableOpacity onPress={handleDone} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.editPurple} />
          ) : (
            <AppText variant="subtitle" style={styles.doneText}>DONE</AppText>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollBg} contentContainerStyle={styles.scrollContent}>
        {data.map((category) => {
          const relatedOptions = options.filter((o) => o.category_id === category.id);

          return (
            <View key={category.id} style={styles.section}>
              <AppText variant="subtitle" style={styles.label}>{category.name}</AppText>

              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => relatedOptions.length > 0 && setOpenCategory(openCategory === category.id ? null : category.id)}
              >
                <AppText variant="bodySmall" style={styles.dropdownText}>
                  {relatedOptions.length > 0 ? getSelectedLabel(category.id) : 'Not available'}
                </AppText>

                {relatedOptions.length > 0 && <Icon name="chevron-down" size={moderateScale(18)} color={colors.iconMuted} />}
              </TouchableOpacity>

              {openCategory === category.id &&
                relatedOptions.map((opt) => {
                  const selectedItem = localSelection.some(
                    (i) => i.id === opt.lifestyle_id && i.categoryId === category.id
                  );

                  return (
                    <TouchableOpacity
                      key={opt.lifestyle_id}
                      style={[styles.optionRow, selectedItem && styles.selectedRow]}
                      onPress={() => handleSelect(category, opt)}
                    >
                      <AppText variant="bodySmall" style={styles.optionText}>{opt.lifestyle_name}</AppText>

                      {selectedItem && <Icon name="checkmark-circle" size={moderateScale(18)} color={colors.editPurple} />}
                    </TouchableOpacity>
                  );
                })}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditUserLifestyleScreen;

const createStyles = (theme) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
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
    doneText: { color: colors.editPurple, fontWeight: '700' },

    scrollBg: { backgroundColor: colors.background },
    scrollContent: { paddingBottom: spacing.xl },

    section: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },

    label: { marginBottom: spacing.xxs, color: colors.textSecondary },

    dropdown: {
      height: moderateScale(48),
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
    },

    dropdownText: { color: colors.text },

    optionRow: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    selectedRow: { backgroundColor: colors.lavenderTint },

    optionText: { color: colors.text },
  });
};