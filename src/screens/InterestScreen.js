import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import WelcomeScreenbackgroundgpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage.js';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInterestsRequest,
  selectInterestsRequest,
} from '../features/interest/interestActions';
import ContinueButton from '../components/Common/ContinueButton';
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

const InterestScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  // ✅ CORRECT REDUCER DATA
  const { interests, loading, message, selectedInterests } = useSelector(
    state => state.interest,
  );

  // local state
  const [selected, setSelected] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResponseHandled, setIsResponseHandled] = useState(false);

  // fetch interests
  useEffect(() => {
    dispatch(fetchInterestsRequest());
  }, [dispatch]);

  // toggle interest
  const toggleSelect = item => {
    setSelected(prev =>
      prev.includes(item.id)
        ? prev.filter(v => v !== item.id)
        : [...prev, item.id],
    );
  };

  // ✅ SINGLE, CORRECT BACKEND RESPONSE HANDLER
  useEffect(() => {
    if (!message || isResponseHandled) return;

    const isSuccess = selectedInterests?.success === true;

    setIsSubmitting(false);
    setIsResponseHandled(true);

    Alert.alert(isSuccess ? 'Success ✅' : 'Error ❌', message, [
      {
        text: 'OK',
        onPress: () => {
          if (isSuccess) {
            navigation.navigate('GenderScreen');
          }
        },
      },
    ]);
  }, [message, selectedInterests, isResponseHandled, navigation]);

  // reset alert guard when screen opens again
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsResponseHandled(false);
    });
    return unsubscribe;
  }, [navigation]);

  // submit handler
  const handleSubmit = () => {
    if (selected.length === 0) return;

    setIsSubmitting(true);

    dispatch(
      selectInterestsRequest({
        interests: selected,
      }),
    );
  };

  return (
    <WelcomeScreenbackgroundgpage>
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="chevron-back" size={26} color="#000" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Select Your Interest</Text>
          </View>

          {/* SUB TEXT */}
          <Text style={styles.subText}>
            Select your interests to match with soul mate who have similar
            things in common
          </Text>

          {/* TAG LIST */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: height * 0.12 }}
          >
            <View style={styles.tagsWrapper}>
              {interests?.map(item => {
                const active = selected.includes(item.id);

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => toggleSelect(item)}
                    style={[styles.tag, active && styles.tagActive]}
                  >
                    <Text
                      style={[styles.tagText, active && styles.tagTextActive]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* 🔥 FIXED BUTTON */}
        <View style={styles.bottomFixed}>
          <ContinueButton
            disabled={selected.length === 0}
            loading={isSubmitting}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </WelcomeScreenbackgroundgpage>
  );
};

export default InterestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  headerTitle: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: '#000',
    marginLeft: width * 0.03,
  },

  subText: {
    fontSize: width * 0.035,
    marginBottom: height * 0.04,
    lineHeight: 20,
  },

  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: width * 0.02, // 🔥 responsive gap
  },
  tag: {
    borderWidth: 1,
    borderColor: '#E3D4FF',
    borderRadius: width * 0.025,
    paddingHorizontal: width * 0.035,
    paddingVertical: height * 0.01,
    backgroundColor: '#FFEFFE',
    marginTop: height * 0.01,
  },
  tagActive: {
    backgroundColor: '#8A2DFF',
    borderColor: '#8A2DFF',
  },
  tagText: {
    color: '#4c4c4c',
    fontSize: width * 0.032,
    fontWeight: '500',
  },
  tagTextActive: {
    color: '#FFFFFF',
  },

  bottomFixed: {
    position: 'absolute',
    bottom: height * 0.03,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
