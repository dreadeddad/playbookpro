import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
  const { userData } = useAuth();

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

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>
              {isCoach ? 'Playbooks Created' : 'Plays Practiced'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
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

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.emptyState}>
            <Ionicons name="basketball" size={48} color="#666666" />
            <Text style={styles.emptyStateText}>No recent activity</Text>
            <Text style={styles.emptyStateSubtext}>
              Start creating or practicing plays to see your activity here
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});