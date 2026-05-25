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
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaskedView from '@react-native-masked-view/masked-view';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import {
  callRequest,
  searchingFemalesRequest,
  directCallRequest,
} from '../features/calls/callAction';
import HomeHeader from '../components/HomeHeader';
import { otherUserFetchRequest } from '../features/Otherusers/otherUserActions';
import { SocketContext } from '../socket/SocketProvider';
import BottomCallPills from '../components/BottomCallPills';

const { width } = Dimensions.get('window');
const CELL_WIDTH = width / 3 - 18;
const CHIP_WIDTH = (width - 48) / 4;
const WAVE_DISTANCE = 10;

const FilterChip = ({ active, onPress, icon, label }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={active ? ['#D51BF9', '#8C37F8'] : ['#EED4FF', '#F6ECFF']}
        style={styles.chip}
      >
        <MaterialIcons
          name={icon}
          size={15}
          color={active ? '#fff' : '#8C37F8'}
        />
        <Text
          numberOfLines={1}
          style={[
            styles.chipText,
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.screen}>
        <View style={styles.topWhiteArea}>
          <HomeHeader
            navigation={navigation}
            userdata={userdata}
            unread={0}
            imageUrl={imageUrl}
            withSpacing={true}
          />

          <MaskedView maskElement={<Text style={styles.lookText}>Local frnd</Text>}>
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

          <View style={styles.filterScrollBox}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.filterRow}
            >
              <FilterChip
                active={activeFilter === 'ONLINE'}
                onPress={setOnlineFilter}
                icon="wifi"
                label="Online"
              />

              <FilterChip
                active={activeFilter === 'AUDIO'}
                onPress={() => setTypeFilter('AUDIO')}
                icon="call"
                label="Audio"
              />

              <FilterChip
                active={activeFilter === 'VIDEO'}
                onPress={() => setTypeFilter('VIDEO')}
                icon="videocam"
                label="Video"
              />

              <FilterChip
                active={activeFilter === 'LANGUAGE'}
                onPress={setLanguageFilter}
                icon="translate"
                label="Telugu"
              />

              <FilterChip
                active={activeFilter === 'INTEREST'}
                onPress={setInterestFilter}
                icon="favorite"
                label="Party"
              />

              <FilterChip
                active={false}
                onPress={resetFilters}
                icon="refresh"
                label="Reset"
              />
            </ScrollView>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionText}>
              {activeFilter === 'ONLINE' && 'ONLINE'}
              {activeFilter === 'AUDIO' && 'AUDIO'}
              {activeFilter === 'VIDEO' && 'VIDEO'}
              {activeFilter === 'LANGUAGE' && 'LANGUAGE'}
              {activeFilter === 'INTEREST' && 'INTEREST'}
            </Text>
          </View>
        </View>

        <LinearGradient
          colors={['#ee60f3', '#8B2CE2']}
          style={styles.middlePurple}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridScrollContent}
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
                    key={item.session_id || `${item.user_id}-${index}`}
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
          </ScrollView>
        </LinearGradient>

        <View style={styles.bottomPillsContainer}>
          <BottomCallPills
            callingRandom={callingRandom}
            callingRandomVideo={callingRandomVideo}
            onRandomAudio={startRandomAudioCall}
            onRandomVideo={startRandomVideoCall}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TrainersCallPage;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },

  topWhiteArea: {
    backgroundColor: '#fff',
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 6 : 8,
    paddingBottom: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 5,
  },

  lookText: {
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'Lexend-SemiBold',
  },

  pageTitle: {
    textAlign: 'center',
    fontSize: 30,
    lineHeight: 38,
    fontFamily: 'Merienda-Bold',
    marginTop: 0,
    marginBottom: 10,
  },

  filterScrollBox: {
    width: width - 32,
    height: 44,
    overflow: 'hidden',
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 0,
    paddingRight: 16,
    paddingVertical: 4,
  },

  chip: {
    width: CHIP_WIDTH,
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    marginRight: 8,
    paddingHorizontal: 6,
  },

  chipText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },

  sectionHeader: {
    marginTop: 12,
    paddingHorizontal: 0,
    alignItems: 'flex-start',
  },

  sectionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
    marginLeft: 0,
  },

  middlePurple: {
    flex: 1,
    marginTop: -6,
    paddingTop: 14,
  },

  gridScrollContent: {
    paddingTop: 4,
    paddingBottom: 20,
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
    textAlign: 'center',
  },

  bottomPillsContainer: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'android' ? 10 : 18,
    alignItems: 'center',
  },
});