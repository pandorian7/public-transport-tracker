import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, BackHandler } from "react-native";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export default function RouteDetails() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const { start, destination } = params;
  const [isSharing, setIsSharing] = useState(false);
  const [notificationId, setNotificationId] = useState<string | undefined>();

  // Store sharing state in AsyncStorage
  const storeSharingState = async (sharing: boolean) => {
    try {
      await AsyncStorage.setItem(
        `location-sharing-${start}-${destination}`,
        JSON.stringify({
          isSharing: sharing,
          start,
          destination,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.log('Error storing sharing state:', error);
    }
  };

  // Load sharing state from AsyncStorage
  const loadSharingState = async () => {
    try {
      const storedState = await AsyncStorage.getItem(`location-sharing-${start}-${destination}`);
      if (storedState) {
        const { isSharing: stored } = JSON.parse(storedState);
        setIsSharing(stored);
      }
    } catch (error) {
      console.log('Error loading sharing state:', error);
    }
  };

  // Handle notification management
  const handleNotification = async (sharing: boolean) => {
    try {
      if (sharing) {
        // Show new notification
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Location Sharing Active',
            body: `Sharing location for route: ${start} → ${destination}`,
            data: { start, destination },
            priority: 'high',
            sticky: true,
          },
          trigger: null,
        });
        setNotificationId(id);
      }
    } catch (error) {
      console.log('Error handling notification:', error);
    }
  };

  // Load initial state
  useEffect(() => {
    loadSharingState();
    
    // Request notification permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Please enable notifications to receive location sharing updates');
      }
    };
    requestPermissions();
  }, []);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isSharing) {
        // If sharing is active, just navigate back without stopping sharing
        navigation.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isSharing, navigation]);

  // Update sharing state and notification
  useEffect(() => {
    storeSharingState(isSharing);
    handleNotification(isSharing);
  }, [isSharing]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Route Details</Text>
      <Text style={styles.label}>Start:</Text>
      <Text style={styles.value}>{start}</Text>
      <Text style={styles.label}>Destination:</Text>
      <Text style={styles.value}>{destination}</Text>

      <View style={styles.locationContainer}>
        <TouchableOpacity 
          style={[
            styles.locationButton,
            isSharing && styles.locationButtonActive
          ]}
          onPress={() => {
            setIsSharing(!isSharing);
          }}
        >
          <MaterialIcons 
            name="location-on" 
            size={80} 
            color="#fff"
          />
        </TouchableOpacity>
        <Text style={styles.sharingStatus}>
          {isSharing ? 'Location sharing is active' : 'Tap to start sharing location'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#222',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#555',
  },
  value: {
    fontSize: 18,
    color: '#333',
    marginTop: 4,
  },
  locationContainer: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '35%',
    alignItems: 'center',
  },
  locationButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  locationButtonActive: {
    backgroundColor: '#34C759', // iOS green color
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  sharingStatus: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
