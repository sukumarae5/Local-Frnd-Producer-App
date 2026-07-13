import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { FETCH_COUNTRIES_REQUEST } from '../features/Countries/locationTypes';
import { fetchStatesRequest } from '../features/Countries/locationActions';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import { newUserDataRequest } from '../features/user/userAction';
import ContinueButton from '../components/Common/ContinueButton';
import { useAppTheme } from '../theme';
import { AppText } from '../components';

// One-off accent for this picker screen only.
const countryAccent = '#B45BFA';

export default function SelectYourCountryScreen({ navigation }) {
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const { colors, spacing, radius } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const location = useSelector((state) => state.location ?? {});
  const countries = location.countries ?? [];
  const loading = location.loading ?? false;
  const error = location.error ?? null;

  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch({ type: FETCH_COUNTRIES_REQUEST });
    dispatch(newUserDataRequest());
  }, []);

  const filteredData = countries.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <WelcomeScreenbackgroungpage>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.container} edges={[]}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={theme.hitSlop}>
                <Icon name="chevron-back" size={moderateScale(26)} color={colors.icon} />
              </TouchableOpacity>
              <AppText variant="h3" style={styles.title}>Select Your Country</AppText>
            </View>

            <View style={styles.searchBox}>
              <Icon name="search-outline" size={moderateScale(20)} color={colors.iconMuted} style={styles.searchIcon} />
              <TextInput
                placeholder="Search"
                placeholderTextColor={colors.placeholder}
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
              />
            </View>

            {loading && <ActivityIndicator size="large" color={countryAccent} style={styles.loader} />}

            {!loading && error && (
              <AppText variant="body" color="error" style={styles.errorText}>{error}</AppText>
            )}

            {!loading && !error && (
              <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.row, selected?.id === item.id && styles.rowActive]}
                    onPress={() => setSelected(item)}
                  >
                    <Image source={{ uri: item.flag_url }} style={styles.flag} />
                    <AppText variant="body" style={styles.countryName}>{item.name}</AppText>

                    <View style={styles.radioOuter}>
                      {selected?.id === item.id && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View style={styles.bottomFixed}>
        <ContinueButton
          title="CONTINUE"
          disabled={!selected}
          onPress={() => {
            if (!selected) return;
            dispatch(fetchStatesRequest(selected.id));
            navigation.navigate('FillYourProfileScreen', { country_id: selected.id });
          }}
        />
      </View>
    </WelcomeScreenbackgroungpage>
  );
}

const createStyles = (theme) => {
  const { colors, spacing, radius } = theme;

  return StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1, paddingHorizontal: spacing.xl },

    header: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.xl },
    title: { marginLeft: spacing.sm },

    searchBox: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: radius.sm,
      height: moderateScale(48),
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      borderWidth: 1,
      borderColor: '#E3D8FF',
      marginBottom: spacing.xl,
    },

    searchIcon: { marginLeft: spacing.xs },
    searchInput: { flex: 1, marginLeft: spacing.xxs, color: colors.text },

    loader: { marginTop: moderateScale(50) },
    errorText: { textAlign: 'center', marginTop: spacing.lg },

    listContent: { paddingBottom: moderateScale(120) },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      height: moderateScale(54),
      borderRadius: radius.sm,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderWidth: 1,
      borderColor: '#E3D8FF',
    },

    rowActive: { borderColor: countryAccent, backgroundColor: '#F8F0FF' },

    flag: { width: moderateScale(32), height: moderateScale(24), borderRadius: radius.xs, marginRight: spacing.sm },

    countryName: { flex: 1, color: colors.text },

    radioOuter: {
      width: moderateScale(20),
      height: moderateScale(20),
      borderRadius: moderateScale(10),
      borderWidth: 2,
      borderColor: countryAccent,
      alignItems: 'center',
      justifyContent: 'center',
    },

    radioInner: { width: moderateScale(10), height: moderateScale(10), backgroundColor: countryAccent, borderRadius: moderateScale(5) },

    bottomFixed: { position: 'absolute', bottom: moderateScale(30), left: 0, right: 0, alignItems: 'center' },
  });
};