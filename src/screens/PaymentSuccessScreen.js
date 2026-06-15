import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { resetPurchase } from '../features/purchase/purchaseActions';

const PaymentSuccessScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎉</Text>

      <Text style={styles.title}>Payment Successful</Text>

      <Text style={styles.subtitle}>
        Coins added to your wallet successfully
      </Text>

      <TouchableOpacity
        style={styles.btn}
        activeOpacity={0.8}
        onPress={() => {
          dispatch(resetPurchase()); // ✅ clear everything

          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'MaleHomeTabs', // ✅ your tab navigator name
                state: {
                  routes: [{ name: 'Home' }], // open Home tab inside it
                },
              },
            ],
          });
        }}
      >
        <Text style={styles.btnText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  icon: {
    fontSize: 60,
    color: '#9333EA', // ✅ optional branding
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#000', // ✅ ADD
  },

  subtitle: {
    marginTop: 10,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  btn: {
    marginTop: 25,
    backgroundColor: '#9333EA',
    padding: 14,
    borderRadius: 10,
    width: 180,
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
