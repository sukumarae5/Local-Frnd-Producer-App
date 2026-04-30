import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import WelcomeScreenbackgroungpage from '../components/BackgroundPages/WelcomeScreenbackgroungpage';
import ContinueButton from '../components/Common/ContinueButton';

const { width, height } = Dimensions.get('window');
const scale = size => (width / 375) * size;

const FAQ_DATA = [
  {
    question: 'How to swipe & match?',
    answer: 'I will give you a complete account.',
  },
  {
    question: 'How do I edit my profile?',
    answer: 'Edit from profile screen.',
  },
  { question: 'How to get more likes?', answer: 'Use better photos.' },
  { question: 'How to get more matches?', answer: 'Be active daily.' },
  { question: "I'm out of profiles?", answer: 'Expand distance.' },
];

const HelpCenterScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('FAQ');
  const [openIndex, setOpenIndex] = useState(0);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isMessageFocused, setIsMessageFocused] = useState(false);

  return (
    <WelcomeScreenbackgroungpage>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={scale(24)} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help Center</Text>
        </View>

        {/* TABS */}
        <View style={styles.tabRow}>
          {['FAQ', 'Support'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>

              {activeTab === tab && (
                <LinearGradient
                  colors={['#D51BF9', '#8C37F8']}
                  style={styles.tabUnderline}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {activeTab === 'FAQ' ? (
            <>
              {/* SEARCH */}
              <LinearGradient
                colors={['#D51BF9', '#8C37F8']}
                style={styles.searchGradient}
              >
                <View style={styles.searchBox}>
                  <Icon name="search" size={scale(18)} color="#D51BF9" />
                  <TextInput placeholder="Search" style={styles.searchInput} />
                </View>
              </LinearGradient>

              {/* FAQ */}
              {FAQ_DATA.map((item, index) => {
                const isOpen = openIndex === index;

                return (
                  <View key={index} style={styles.faqItem}>
                    <TouchableOpacity
                      style={styles.faqHeader}
                      onPress={() => setOpenIndex(isOpen ? null : index)}
                    >
                      <Text style={styles.question}>{item.question}</Text>
                      <Icon
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={scale(18)}
                        color="#999"
                      />
                    </TouchableOpacity>

                    {isOpen && <Text style={styles.answer}>{item.answer}</Text>}
                  </View>
                );
              })}
            </>
          ) : (
            <>
              {/* FORM */}
              <Text style={styles.label}>Full Name</Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Michael Dam"
              />

              <Text style={styles.label}>Email</Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="info@gmail.com"
              />

              <Text style={styles.label}>Phone Number</Text>
              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder="+12678899911"
              />

              <Text style={styles.label}>Message</Text>

              <View
                style={[
                  styles.textAreaWrapper,
                  (isMessageFocused || message) && styles.inputActive,
                ]}
              >
                <TextInput
                  placeholder="Write Your Message"
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

        {/* 🔥 FIXED BUTTON */}
        {activeTab === 'Support' && (
          <View style={styles.bottomFixed}>
            <ContinueButton
              title="SUBMIT"
              onPress={() => console.log('Submit')}
            />
          </View>
        )}
      </View>
    </WelcomeScreenbackgroungpage>
  );
};

export default HelpCenterScreen;

/* ================= SMALL COMPONENT ================= */

const Input = ({ placeholder, value, onChangeText }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.inputBox, (isFocused || value) && styles.inputActive]}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};
/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingTop: height * 0.03, // 🔥 SafeArea replacement
    marginBottom: scale(10),
  },

  headerTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    marginLeft: scale(10),
  },

  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  tab: { paddingVertical: scale(12) },

  tabText: {
    color: '#999',
    fontSize: scale(14),
  },

  activeTabText: {
    fontWeight: '600',
  },

  tabUnderline: {
    height: 2,
    marginTop: scale(6),
    borderRadius: 2,
  },
  scroll: {
    padding: scale(16),
    paddingBottom: scale(120), // 🔥 prevents overlap
  },

  searchGradient: {
    borderRadius: scale(25),
    padding: 1.5,
    marginBottom: scale(20),
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: scale(25),
    paddingHorizontal: scale(14),
    height: scale(46),
  },
  searchInput: {
    marginLeft: scale(10),
    flex: 1,
  },

  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: scale(14),
  },

  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  question: {
    fontSize: scale(14),
    fontWeight: '500',
  },
  textAreaWrapper: {
    borderRadius: scale(18),
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#FAFAFA',
  },

  answer: {
    marginTop: scale(8),
    color: '#666',
    fontSize: scale(13),
  },

  label: {
    marginTop: scale(14),
    marginBottom: scale(6),
    color: '#444',
  },

  inputBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: scale(25),
    paddingHorizontal: scale(16),
    height: scale(48),
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
  },
  inputActive: {
    borderColor: '#D51BF9',
    borderWidth: 1.5,
  },
  textArea: {
    height: scale(110),
    padding: scale(12),
    textAlignVertical: 'top',
  },

  bottomFixed: {
    position: 'absolute',
    bottom: scale(25),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
