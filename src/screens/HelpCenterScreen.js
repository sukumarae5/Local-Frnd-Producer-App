import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import WelcomeScreenbackgroungpage from "../components/BackgroundPages/WelcomeScreenbackgroungpage";

const PURPLE = "#B832F9";

const FAQ_DATA = [
  {
    question: "How to swipe & match?",
    answer:
      "I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth.",
  },
  { question: "How do I edit my profile?", answer: "You can edit your profile from Edit Profile screen." },
  { question: "How to get more likes?", answer: "Improve photos and be active daily." },
  { question: "How to get more matches?", answer: "Swipe daily and complete your profile." },
  { question: "I'm out of profile to swipe through?", answer: "Wait for new users or expand distance." },
];

const HelpCenterScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("FAQ");
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <WelcomeScreenbackgroungpage>

    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab("FAQ")}
          >
          <Text
            style={[
              styles.tabText,
              activeTab === "FAQ" && styles.activeTabText,
            ]}
          >
            FAQ
          </Text>
          {activeTab === "FAQ" && <View style={styles.tabUnderline} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab("Support")}
        >
          <Text
            style={[
                styles.tabText,
                activeTab === "Support" && styles.activeTabText,
            ]}
            >
            Support
          </Text>
          {activeTab === "Support" && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {activeTab === "FAQ" ? (
            <>
            {/* SEARCH */}
            <View style={styles.searchBox}>
              <Icon name="search" size={18} color={PURPLE} />
              <TextInput
                placeholder="Search"
                style={styles.searchInput}
                />
            </View>

            {/* FAQ LIST */}
            {FAQ_DATA.map((item, index) => {
                const isOpen = openIndex === index;
                
                return (
                    <View key={index} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() =>
                        setOpenIndex(isOpen ? null : index)
                    }
                    >
                    <Text style={styles.question}>
                      {item.question}
                    </Text>
                    <Icon
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#999"
                      />
                  </TouchableOpacity>

                  {isOpen && (
                      <Text style={styles.answer}>
                      {item.answer}
                    </Text>
                  )}
                </View>
              );
            })}
          </>
        ) : (
            <>
            {/* SUPPORT FORM */}
            <Text style={styles.label}>Full Name</Text>
            <Input placeholder="Michael Dam" />

            <Text style={styles.label}>Email</Text>
            <Input placeholder="info@gmail.com" />

            <Text style={styles.label}>Phone Number</Text>
            <Input placeholder="+12678899911" />

            <Text style={styles.label}>Message</Text>
            <TextInput
              placeholder="Write Your Message"
              multiline
              style={styles.textArea}
              />

            <TouchableOpacity style={styles.submitBtn}>
              <Text style={styles.submitText}>SUBMIT</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
        </WelcomeScreenbackgroungpage>
  );
};

export default HelpCenterScreen;

/* ================= SMALL COMPONENT ================= */

const Input = ({ placeholder }) => (
  <View style={styles.inputBox}>
    <TextInput placeholder={placeholder} />
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginTop:50
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },

  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: { paddingVertical: 12 },
  tabText: { color: "#999", fontSize: 15 },
  activeTabText: { color: PURPLE, fontWeight: "600" },
  tabUnderline: {
    height: 2,
    backgroundColor: PURPLE,
    marginTop: 6,
    borderRadius: 2,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: PURPLE,
    borderRadius: 25,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 20,
  },
  searchInput: { marginLeft: 10, flex: 1 },

  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 14,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: { fontSize: 14, fontWeight: "500" },
  answer: { marginTop: 8, color: "#666", fontSize: 13 },

  label: { marginTop: 14, marginBottom: 6, color: "#444" },
  inputBox: {
    backgroundColor: "#FAFAFA",
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "#eee",
    justifyContent: "center",
  },
  textArea: {
    height: 110,
    backgroundColor: "#FAFAFA",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    textAlignVertical: "top",
  },

  submitBtn: {
    backgroundColor: PURPLE,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
