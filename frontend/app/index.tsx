import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();

  const selectRole = async (role: 'coach' | 'player') => {
    console.log('🏀 Selected role:', role);
    
    try {
      // Create a demo user with the selected role
      const demoUser = {
        uid: `demo_${role}_${Date.now()}`,
        email: `demo@${role}.com`,
        displayName: role === 'coach' ? 'Demo Coach' : 'Demo Player',
        role: role,
        createdAt: new Date()
      };
      
      console.log('🏀 Storing demo user:', demoUser);
      // Store demo user data
      await AsyncStorage.setItem('demo_user', JSON.stringify(demoUser));
      
      console.log('🏀 Navigating to dashboard...');
      // Navigate to dashboard
      router.replace('/(app)/(tabs)/dashboard');
    } catch (error) {
      console.error('🏀 Error in selectRole:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🏀</Text>
          <Text style={styles.title}>Playbook Pro</Text>
          <Text style={styles.subtitle}>Choose your role to explore the basketball coaching platform</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => selectRole('coach')}
          >
            <Text style={styles.roleIcon}>👨‍🏫</Text>
            <Text style={styles.roleTitle}>I'm a Coach</Text>
            <Text style={styles.roleDescription}>
              Create and manage basketball playbooks, view player progress, and access AI coaching insights
            </Text>
            <View style={styles.featuresList}>
              <Text style={styles.feature}>• Create custom playbooks</Text>
              <Text style={styles.feature}>• Manage player reports</Text>
              <Text style={styles.feature}>• AI performance analysis</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => selectRole('player')}
          >
            <Text style={styles.roleIcon}>🏃‍♂️</Text>
            <Text style={styles.roleTitle}>I'm a Player</Text>
            <Text style={styles.roleDescription}>
              Learn basketball plays, practice with 3D simulations, and improve with AI feedback
            </Text>
            <View style={styles.featuresList}>
              <Text style={styles.feature}>• Browse interactive playbooks</Text>
              <Text style={styles.feature}>• 3D court simulation</Text>
              <Text style={styles.feature}>• Personalized coaching tips</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Demo Mode - No login required!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  roleContainer: {
    flex: 1,
    gap: 24,
  },
  roleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 12,
  },
  roleDescription: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  featuresList: {
    alignSelf: 'stretch',
  },
  feature: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 4,
    paddingLeft: 8,
  },
  footer: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
  },
});