import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const VideoCallScreen = () => {
  return (
    <View style={styles.container}>
      {/* Main Video */}
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e' }} 
        style={styles.mainVideo} 
      />

      {/* Small overlay video */}
      <View style={styles.overlayVideo}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1603415526960-f9e3a28d0a3d' }} 
          style={styles.overlayImage} 
        />
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <Icon name="arrow-back" size={25} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.controlButton}>
          <Icon name="person-add" size={25} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Icon name="mic-off" size={25} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, styles.endCallButton]}>
          <Icon name="call" size={25} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Icon name="videocam" size={25} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VideoCallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mainVideo: {
    width: '100%',
    height: '100%',
  },
  overlayVideo: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  overlayImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 25,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 50,
  },
  endCallButton: {
    backgroundColor: 'red',
  },
});
