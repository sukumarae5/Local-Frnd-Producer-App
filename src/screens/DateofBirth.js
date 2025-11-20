import { StyleSheet, Text, View, TextInput, Pressable, Platform } from 'react-native';
import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import BackgroundPagesOne from '../components/BackgroundPages/BackgroundPagesOne';
import AnimatedLogo from '../components/SampleLogo/AnimatedLogo';


const DateofBirth = ({ navigation }) => {
 const [date, setDate] = useState(new Date());
 
  const [showPicker, setShowPicker] = useState(false);

  // Format display values for month, date, year
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
const day = date.getDate().toString().padStart(2, '0');
const year = date.getFullYear().toString();

  const isFilled = year && month && day;

  const onChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios'); // On Android, close picker after selection
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };

  return (
    <BackgroundPagesOne>
      <View style={styles.logoSpace}>
        <AnimatedLogo />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>When’s your Spark day</Text>
        <Pressable onPress={showDatePicker} style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Month</Text>
            <View pointerEvents="none">
              <TextInput
                style={styles.input}
                value={month}
                editable={false}
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <View pointerEvents="none">
              <TextInput
                style={styles.input}
                value={day}
                editable={false}
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year</Text>
            <View pointerEvents="none">
              <TextInput
                style={styles.input}
                value={year}
                editable={false}
              />
            </View>
          </View>
        </Pressable>

        {showPicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            display="spinner" // or 'default' for platform default style
            onChange={onChange}
            maximumDate={new Date()}
          />
        )}

  <Pressable
  style={[styles.button, !isFilled && { opacity: 0.5 }]}
  disabled={!isFilled}
  onPress={() => navigation.navigate('GenderScreen')}  // ✅ navigation works
>
  <Text style={styles.buttonText}>Continue</Text>
</Pressable>


      </View>
    </BackgroundPagesOne>
  );
};

export default DateofBirth;

const styles = StyleSheet.create({
  logoSpace: {
    marginTop: Platform.OS === 'ios' ? 44 : 30,
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginVertical: 32,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  inputGroup: {
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    width: 56,
    height: 48,
    borderWidth: 2,
    borderColor: '#b56fff',
    borderRadius: 8,
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 2,
  },
  button: {
    width: '70%',
    height: 48,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#222',
    fontWeight: '700',
    fontSize: 18,
  },
});
