import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BackgroundPagesOne from '../components/BackgroundPages/BackgroundPagesOne';
import AnimatedLogo from '../components/SampleLogo/AnimatedLogo';


const UserScreen = () => {
    
  return (
     <BackgroundPagesOne>    
      
      <View style={styles.logoSpace}>
        <AnimatedLogo />
 
    </View>
    </BackgroundPagesOne>

  )
}

export default UserScreen

const styles = StyleSheet.create({


  logoSpace: {
    marginTop: Platform.OS === 'ios' ? 44 : 30,
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
  },
})