import React, { useContext, useRef, useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaskedView from '@react-native-masked-view/masked-view';
import { useDispatch, useSelector } from 'react-redux';

import {
  callRequest,
  searchingFemalesRequest,
  directCallRequest,
} from '../features/calls/callAction';
import HomeHeader from '../components/HomeHeader';
import { otherUserFetchRequest } from '../features/Otherusers/otherUserActions';
import { SocketContext } from '../socket/SocketProvider';
import { useFocusEffect } from '@react-navigation/native';
import BottomCallPills from '../components/BottomCallPills';

const { width } = Dimensions.get('window');
const CELL_WIDTH = width / 3 - 18;
const WAVE_DISTANCE = 10;

const FilterChip = ({ active, onPress, icon, label }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={
          active
            ? ['#D51BF9', '#8C37F8'] // strong
            : ['#EED4FF', '#F6ECFF'] // light gradient
        }
        style={styles.chip}
      >
        <MaterialIcons
          name={icon}
          size={16}
          color={active ? '#fff' : '#8C37F8'}
        />
        <Text
          style={[
            styles.chipTextActive,
            { color: active ? '#fff' : '#8C37F8' },
          ]}
        >
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const TrainersCallPage = ({ navigation }) => {
  const dispatch = useDispatch();
  const socketCtx = useContext(SocketContext);

  const { userdata } = useSelector(state => state.user);
  const users = useSelector(state => state.calls.searchingFemales || []);

  const imageUrl = userdata?.images?.profile_image
    ? { uri: userdata.images.profile_image }
    : require('../assets/boy1.jpg');

  const connected = socketCtx?.connected;

  const animRefs = useRef([]);

  const [callingRandom, setCallingRandom] = useState(false);
  const [callingRandomVideo, setCallingRandomVideo] = useState(false);
  const [callingDirect, setCallingDirect] = useState(false);

  const [filters, setFilters] = useState({
    online: 1,
    type: null,
    language: null,
    interest_id: null,
  });

  const [activeFilter, setActiveFilter] = useState('ONLINE');

  useEffect(() => {
    dispatch(searchingFemalesRequest(filters));

    const interval = setInterval(() => {
      dispatch(searchingFemalesRequest(filters));
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch, filters]);

  const setOnlineFilter = () => {
    setFilters({
      online: 1,
      type: null,
      language: null,
      interest_id: null,
    });
    setActiveFilter('ONLINE');
  };

  const setTypeFilter = type => {
    setFilters(prev => ({
      ...prev,
      type,
      language: null,
      interest_id: null,
    }));
    setActiveFilter(type);
  };

  const setLanguageFilter = () => {
    setFilters(prev => ({
      ...prev,
      type: null,
      language: userdata?.language_id || null,
      interest_id: null,
    }));
    setActiveFilter('LANGUAGE');
  };

  const setInterestFilter = () => {
    const interestId = userdata?.interest_ids?.[0] || null;

    setFilters(prev => ({
      ...prev,
      type: null,
      language: null,
      interest_id: interestId,
    }));
    setActiveFilter('INTEREST');
  };

  const resetFilters = () => {
    setFilters({
      online: 1,
      type: null,
      language: null,
      interest_id: null,
    });
    setActiveFilter('ONLINE');
  };

  useEffect(() => {
    animRefs.current = users.map(() => new Animated.Value(0));

    users.forEach((_, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animRefs.current[index], {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(animRefs.current[index], {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, [users]);

  const startRandomAudioCall = () => {
    if (!connected) return;

    setCallingRandom(true);

    dispatch(callRequest({ call_type: 'AUDIO' }));

    navigation.navigate('CallStatusScreen', {
      call_type: 'AUDIO',
      role: 'male',
    });
  };

  const startRandomVideoCall = () => {
    if (!connected) return;

    setCallingRandomVideo(true);

    dispatch(callRequest({ call_type: 'VIDEO' }));

    navigation.navigate('CallStatusScreen', {
      call_type: 'VIDEO',
      role: 'male',
    });
  };

  const startDirectCall = item => {
    console.log('Starting direct call with', item);

    if (!connected) return;

    setCallingDirect(true);

    dispatch(
      directCallRequest({
        female_id: item.user_id,
        call_type: item.type,
      }),
    );

    navigation.navigate('CallStatusScreen', {
      call_type: item.type,
      role: 'caller',
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      setCallingRandom(false);
      setCallingRandomVideo(false);
      setCallingDirect(false);
    }, []),
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.topWhiteArea}>
        <HomeHeader
          navigation={navigation}
          userdata={userdata}
          unread={0} // or from redux if you have
          imageUrl={imageUrl}
          withSpacing={true}
        />
        <MaskedView
          maskElement={<Text style={styles.lookText}>Local frnd</Text>}
        >
          <LinearGradient
            colors={['#D51BF9', '#8C37F8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.lookText, { opacity: 0 }]}>Local frnd</Text>
          </LinearGradient>
        </MaskedView>

        <MaskedView
          maskElement={<Text style={styles.pageTitle}>Connecting Room</Text>}
        >
          <LinearGradient
            colors={['#D51BF9', '#8C37F8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.pageTitle, { opacity: 0 }]}>
              Connecting Room
            </Text>
          </LinearGradient>
        </MaskedView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {/* ONLINE */}
          <TouchableOpacity
            style={[
              styles.chip,
              activeFilter === 'ONLINE' && styles.chipActive,
            ]}
            onPress={setOnlineFilter}
          >
            <MaterialIcons
              name="wifi"
              size={16}
              color={activeFilter === 'ONLINE' ? '#fff' : '#111111'}
            />
            <Text
              style={[
                styles.chipText,
                activeFilter === 'ONLINE' && styles.chipTextActive,
              ]}
            >
              Online
            </Text>
          </TouchableOpacity>

          {/* AUDIO */}
          <TouchableOpacity
            style={[styles.chip, activeFilter === 'AUDIO' && styles.chipActive]}
            onPress={() => setTypeFilter('AUDIO')}
          >
            <MaterialIcons
              name="call"
              size={16}
              color={activeFilter === 'AUDIO' ? '#fff' : '#111111'}
            />
            <Text
              style={[
                styles.chipText,
                activeFilter === 'AUDIO' && styles.chipTextActive,
              ]}
            >
              Audio
            </Text>
          </TouchableOpacity>

          {/* VIDEO */}
          <TouchableOpacity
            style={[styles.chip, activeFilter === 'VIDEO' && styles.chipActive]}
            onPress={() => setTypeFilter('VIDEO')}
          >
            <MaterialIcons
              name="videocam"
              size={16}
              color={activeFilter === 'VIDEO' ? '#fff' : '#111111'}
            />
            <Text
              style={[
                styles.chipText,
                activeFilter === 'VIDEO' && styles.chipTextActive,
              ]}
            >
              Video
            </Text>
          </TouchableOpacity>

          {/* LANGUAGE */}
          <TouchableOpacity
            style={[
              styles.chip,
              activeFilter === 'LANGUAGE' && styles.chipActive,
            ]}
            onPress={setLanguageFilter}
          >
            <MaterialIcons
              name="translate"
              size={16}
              color={activeFilter === 'LANGUAGE' ? '#fff' : '#111111'}
            />
            <Text
              style={[
                styles.chipText,
                activeFilter === 'LANGUAGE' && styles.chipTextActive,
              ]}
            >
              Telugu
            </Text>
          </TouchableOpacity>

          {/* INTEREST */}
          <TouchableOpacity
            style={[
              styles.chip,
              activeFilter === 'INTEREST' && styles.chipActive,
            ]}
            onPress={setInterestFilter}
          >
            <MaterialIcons
              name="favorite"
              size={16}
              color={activeFilter === 'INTEREST' ? '#fff' : '#111111'}
            />
            <Text
              style={[
                styles.chipText,
                activeFilter === 'INTEREST' && styles.chipTextActive,
              ]}
            >
              Party
            </Text>
          </TouchableOpacity>

          {/* RESET */}
          <TouchableOpacity style={styles.chip} onPress={resetFilters}>
            <MaterialIcons name="refresh" size={16} color="#111111" />
            <Text style={styles.chipText}>Reset</Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionText}>
            {activeFilter === 'ONLINE' && 'ONLINE'}
            {activeFilter === 'AUDIO' && 'AUDIO '}
            {activeFilter === 'VIDEO' && 'VIDEO '}
            {activeFilter === 'LANGUAGE' && 'LANGUAGE '}
            {activeFilter === 'INTEREST' && 'INTEREST'}
          </Text>
        </View>
      </View>

      {/* USERS GRID */}
      <LinearGradient
        colors={['#ee60f3', '#8B2CE2']}
        style={styles.middlePurple}
      >
        <View style={styles.gridWrapper}>
          {users.map((item, index) => {
            const translateY =
              animRefs.current[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -WAVE_DISTANCE],
              }) || 0;

            return (
              <Animated.View
                key={item.session_id}
                style={[styles.itemCell, { transform: [{ translateY }] }]}
              >
                <TouchableOpacity
                  style={styles.userCard}
                  onPress={() => startDirectCall(item)}
                  onLongPress={() => {
                    dispatch(otherUserFetchRequest(item.user_id));
                    navigation.navigate('AboutScreen', {
                      userId: item.user_id,
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.avatarOuter}>
                    <Image
                      source={require('../assets/boy1.jpg')}
                      style={styles.avatar}
                    />

                    <View style={styles.callBadge}>
                      <MaterialIcons
                        name={item.type === 'VIDEO' ? 'videocam' : 'call'}
                        size={12}
                        color="#fff"
                      />
                    </View>
                  </View>

                  <Text style={styles.userText}>User #{item.user_id}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </LinearGradient>

      {/* CALL BUTTONS */}
      <BottomCallPills
        callingRandom={callingRandom}
        callingRandomVideo={callingRandomVideo}
        onRandomAudio={startRandomAudioCall}
        onRandomVideo={startRandomVideoCall}
      />
    </SafeAreaView>
  );
};

export default TrainersCallPage;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  topWhiteArea: {
    backgroundColor: '#fff',
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 16, // ✅ more breathing space
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  lookText: {
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 30,
    fontFamily: 'Lexend-SemiBold',
  },
  pageTitle: {
    textAlign: 'center',
    fontSize: 30,
    lineHeight: 30,
    fontFamily: 'Merienda-Bold',
    marginTop: 4,
    marginBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    height: 34.56,
    paddingHorizontal: 12,

    backgroundColor: '#FFE9F3',
    borderRadius: 30,
    marginHorizontal: 6,
  },

  chipActive: {
    backgroundColor: '#C2185B',
  },

  chipText: {
    fontSize: 12,
    color: '#111111',
    fontWeight: '600',
    marginLeft: 6,
  },

  chipTextActive: {
    color: '#fff',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    marginTop: 0, // small gap only
  },

  filterChip: {
    backgroundColor: '#EFE6FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },

  filterChipActive: {
    backgroundColor: '#f5a1ea',
  },

  filterText: {
    fontSize: 12,
    color: '#8B2CE2',
    fontWeight: '700',
  },

  filterTextActive: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },

  middlePurple: {
    flex: 0.85,
    paddingTop: 8,
    marginBottom: 0,
  },

  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },

  itemCell: {
    width: CELL_WIDTH,
    marginBottom: 14,
  },
  sectionHeader: {
    marginTop: 14, // ✅ more space
    paddingHorizontal: 10,
  },

  sectionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  userCard: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  avatarOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#bb6acf',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#ee6adc',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 10,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },

  callBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#44b62d',
    alignItems: 'center',
    justifyContent: 'center',
  },

  userText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
});
