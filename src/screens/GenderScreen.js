import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';

const GenderScreen = ({ navigation }) => {   // ✅ Receive navigation here
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select your gender</Text>

      {/* Example gender buttons */}
      <View style={styles.genderOptions}>
        <Pressable
          style={[
            styles.genderButton,
            selectedGender === 'Male' && styles.selected,
          ]}
          onPress={() => setSelectedGender('Male')}
        >
          <Text style={styles.genderText}>Male</Text>
        </Pressable>

        <Pressable
          style={[
            styles.genderButton,
            selectedGender === 'Female' && styles.selected,
          ]}
          onPress={() => setSelectedGender('Female')}
        >
          <Text style={styles.genderText}>Female</Text>
        </Pressable>
      </View>

      {/* Continue Button */}
      <Pressable
        style={[styles.button, !selectedGender && { opacity: 0.5 }]}
        disabled={!selectedGender}
        onPress={() => navigation.navigate('UserScreen')} // ✅ Use navigation here
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
};

export default GenderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0a13',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 40,
    fontWeight: '600',
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  genderButton: {
    borderWidth: 2,
    borderColor: '#b56fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  genderText: {
    color: '#fff',
    fontSize: 16,
  },
  selected: {
    backgroundColor: '#b56fff33',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 60,
    marginTop: 40,
  },
  buttonText: {
    color: '#222',
    fontWeight: '700',
    fontSize: 18,
  },
});
