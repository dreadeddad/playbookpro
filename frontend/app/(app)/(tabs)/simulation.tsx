import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GameSimulation from '../../../components/GameSimulation';

interface Play {
  step_number: number;
  description: string;
  player_positions: Array<{
    x: number;
    y: number;
    role: string;
    responsibilities: string[];
  }>;
  key_actions: string[];
}

interface Playbook {
  id: string;
  coach_id: string;
  title: string;
  description: string;
  category: string;
  plays: Play[];
  created_at: string;
  is_public: boolean;
}

export default function Simulation() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);

  useEffect(() => {
    loadPlaybooks();
  }, []);

  const loadPlaybooks = async () => {
    try {
      // First create sample data if it doesn't exist
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/sample-data`, {
        method: 'POST',
      });

      // Then fetch all public playbooks
      const playbooksResponse = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/playbooks?public_only=true`);
      
      if (playbooksResponse.ok) {
        const data = await playbooksResponse.json();
        setPlaybooks(data);
      }
    } catch (error) {
      console.error('Error loading playbooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectPlaybook = (playbook: Playbook) => {
    setSelectedPlaybook(playbook);
  };

  const handleActionLog = (action: string) => {
    setGameLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${action}`]);
  };

  const closeSimulation = () => {
    setSelectedPlaybook(null);
    setGameLog([]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading simulations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render Game Simulation
  if (selectedPlaybook) {
    return (
      <GameSimulation
        plays={selectedPlaybook.plays}
        title={selectedPlaybook.title}
        onClose={closeSimulation}
        onActionLog={handleActionLog}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>3D Simulation</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Features Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🏀 Interactive 3D Basketball Simulation</Text>
          <Text style={styles.bannerDescription}>
            Experience realistic gameplay with physics-based interactions and AI opponents
          </Text>
        </View>

        {/* Available Simulations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Simulations</Text>
          
          {playbooks.length > 0 ? (
            <View style={styles.playbooksContainer}>
              {playbooks.map((playbook) => (
                <TouchableOpacity
                  key={playbook.id}
                  style={styles.playbookCard}
                  onPress={() => selectPlaybook(playbook)}
                >
                  <View style={styles.playbookHeader}>
                    <View style={styles.playbookIcon}>
                      <Ionicons 
                        name={playbook.category === 'offense' ? 'basketball' : 
                              playbook.category === 'defense' ? 'shield' : 'flash'} 
                        size={24} 
                        color="#FF6B35" 
                      />
                    </View>
                    <View style={styles.playbookInfo}>
                      <Text style={styles.playbookTitle}>{playbook.title}</Text>
                      <Text style={styles.playbookCategory}>{playbook.category.toUpperCase()}</Text>
                    </View>
                    <View style={styles.playbookMeta}>
                      <Text style={styles.playCount}>{playbook.plays.length} plays</Text>
                      <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
                    </View>
                  </View>
                  
                  <Text style={styles.playbookDescription} numberOfLines={2}>
                    {playbook.description}
                  </Text>
                  
                  <View style={styles.simulationFeatures}>
                    <View style={styles.feature}>
                      <Ionicons name="cube" size={16} color="#10B981" />
                      <Text style={styles.featureText}>3D Physics</Text>
                    </View>
                    <View style={styles.feature}>
                      <Ionicons name="people" size={16} color="#8B5CF6" />
                      <Text style={styles.featureText}>AI Players</Text>
                    </View>
                    <View style={styles.feature}>
                      <Ionicons name="stats-chart" size={16} color="#F59E0B" />
                      <Text style={styles.featureText}>Analytics</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="game-controller" size={64} color="#666666" />
              <Text style={styles.emptyTitle}>No Simulations Available</Text>
              <Text style={styles.emptyDescription}>
                Create or import playbooks to run 3D simulations
              </Text>
            </View>
          )}
        </View>

        {/* Feature Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Simulation Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureCard}>
              <Ionicons name="cube-outline" size={32} color="#FF6B35" />
              <Text style={styles.featureCardTitle}>3D Court Physics</Text>
              <Text style={styles.featureCardDescription}>
                Realistic ball physics and player movement in 3D space
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="people-outline" size={32} color="#10B981" />
              <Text style={styles.featureCardTitle}>AI Opposition</Text>
              <Text style={styles.featureCardDescription}>
                Smart AI players that adapt to your strategies
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="analytics-outline" size={32} color="#8B5CF6" />
              <Text style={styles.featureCardTitle}>Performance Analytics</Text>
              <Text style={styles.featureCardDescription}>
                Detailed analysis of your gameplay decisions
              </Text>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  comingSoon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 16,
  },
  comingSoonDescription: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
    marginBottom: 40,
  },
  featuresList: {
    alignSelf: 'stretch',
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
});