import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'coach' | 'player';
  createdAt: Date;
}

export default function Dashboard() {
  const [userData, setUserData] = useState<DemoUser | null>(null);

  useEffect(() => {
    const loadDemoUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('demo_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserData(user);
        }
      } catch (error) {
        console.log('Error loading demo user:', error);
      }
    };

    loadDemoUser();
  }, []);

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCoach = userData?.role === 'coach';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome back, {userData?.displayName?.split(' ')[0]}!
            </Text>
            <Text style={styles.role}>
              {isCoach ? '🏀 Coach Dashboard' : '🏃‍♂️ Player Dashboard'}
            </Text>
          </View>
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>
              {userData?.displayName?.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Demo Banner */}
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            🎮 Demo Mode - Explore all features without authentication!
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{isCoach ? '12' : '8'}</Text>
            <Text style={styles.statLabel}>
              {isCoach ? 'Playbooks Created' : 'Plays Practiced'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{isCoach ? '45' : '24'}</Text>
            <Text style={styles.statLabel}>
              {isCoach ? 'Active Players' : 'Training Hours'}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {isCoach ? (
              <>
                <TouchableOpacity style={styles.actionCard}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="add-circle" size={24} color="#FF6B35" />
                  </View>
                  <Text style={styles.actionTitle}>Create Playbook</Text>
                  <Text style={styles.actionDescription}>
                    Design new basketball plays
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="people" size={24} color="#FF6B35" />
                  </View>
                  <Text style={styles.actionTitle}>Manage Players</Text>
                  <Text style={styles.actionDescription}>
                    View player progress
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.actionCard}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="book" size={24} color="#FF6B35" />
                  </View>
                  <Text style={styles.actionTitle}>Browse Plays</Text>
                  <Text style={styles.actionDescription}>
                    Learn new basketball plays
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard}>
                  <View style={styles.actionIcon}>
                    <Ionicons name="game-controller" size={24} color="#FF6B35" />
                  </View>
                  <Text style={styles.actionTitle}>Practice Mode</Text>
                  <Text style={styles.actionDescription}>
                    3D simulation training
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Sample Basketball Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basketball Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏀</Text>
              <View>
                <Text style={styles.featureTitle}>Interactive Playbooks</Text>
                <Text style={styles.featureDesc}>2D/3D basketball play visualization</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎮</Text>
              <View>
                <Text style={styles.featureTitle}>3D Court Simulation</Text>
                <Text style={styles.featureDesc}>Practice plays in virtual environment</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤖</Text>
              <View>
                <Text style={styles.featureTitle}>AI Coaching Feedback</Text>
                <Text style={styles.featureDesc}>Personalized performance analysis</Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <View>
                <Text style={styles.featureTitle}>Performance Analytics</Text>
                <Text style={styles.featureDesc}>Track progress and improvement areas</Text>
              </View>
            </View>
          </View>
        </View>

        {/* API Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backend Integration</Text>
          <View style={styles.apiDemo}>
            <Text style={styles.apiTitle}>✅ Basketball API Active</Text>
            <Text style={styles.apiDescription}>
              • User management system working{'\n'}
              • Playbook CRUD operations ready{'\n'}
              • AI coaching feedback via Gemini{'\n'}
              • Game session tracking enabled{'\n'}
              • Sample basketball plays loaded
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#cccccc',
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoBanner: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 1,
    borderColor: '#FF6B35',
    margin: 24,
    padding: 16,
    borderRadius: 12,
  },
  demoText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#cccccc',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#cccccc',
    textAlign: 'center',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#cccccc',
  },
  apiDemo: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    padding: 16,
    borderRadius: 12,
  },
  apiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 8,
  },
  apiDescription: {
    fontSize: 12,
    color: '#cccccc',
    lineHeight: 18,
  },
});