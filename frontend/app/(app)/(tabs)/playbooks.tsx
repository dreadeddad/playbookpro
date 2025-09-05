import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PlaybookViewer from '../../../components/PlaybookViewer';
import PlayerDetailsPanel from '../../../components/PlayerDetailsPanel';
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

export default function Playbooks() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'viewer' | 'simulation'>('list');
  const [showPlayerDetails, setShowPlayerDetails] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number | undefined>(undefined);
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

  const selectPlaybook = (playbook: Playbook, mode: 'viewer' | 'simulation' = 'viewer') => {
    setSelectedPlaybook(playbook);
    setViewMode(mode);
  };

  const handlePlayerDetails = (playerIndex?: number) => {
    setSelectedPlayer(playerIndex);
    setShowPlayerDetails(true);
  };

  const handleActionLog = (action: string) => {
    setGameLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${action}`]);
  };

  const closeViewer = () => {
    setSelectedPlaybook(null);
    setViewMode('list');
    setSelectedPlayer(undefined);
    setGameLog([]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading basketball playbooks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render Advanced 2D/3D Playbook Viewer
  if (selectedPlaybook && viewMode === 'viewer') {
    return (
      <>
        <PlaybookViewer
          plays={selectedPlaybook.plays}
          title={selectedPlaybook.title}
          onClose={closeViewer}
        />
        <PlayerDetailsPanel
          players={selectedPlaybook.plays[0]?.player_positions || []}
          visible={showPlayerDetails}
          onClose={() => setShowPlayerDetails(false)}
          selectedPlayer={selectedPlayer}
        />
      </>
    );
  }

  // Render 3D Game Simulation
  if (selectedPlaybook && viewMode === 'simulation') {
    return (
      <GameSimulation
        plays={selectedPlaybook.plays}
        title={selectedPlaybook.title}
        onClose={closeViewer}
        onActionLog={handleActionLog}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Basketball Playbooks</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {playbooks.length > 0 ? (
          <View style={styles.playbooksContainer}>
            {playbooks.map((playbook) => (
              <TouchableOpacity
                key={playbook.id}
                style={styles.playbookCard}
                onPress={() => selectPlaybook(playbook)}
              >
                <View style={styles.playbookHeader}>
                  <Text style={styles.playbookTitle}>{playbook.title}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{playbook.category}</Text>
                  </View>
                </View>
                
                <Text style={styles.playbookDescription}>{playbook.description}</Text>
                
                <View style={styles.playbookFooter}>
                  <Text style={styles.playCount}>
                    📋 {playbook.plays.length} step{playbook.plays.length !== 1 ? 's' : ''}
                  </Text>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View Play</Text>
                    <Ionicons name="chevron-forward" size={16} color="#FF6B35" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="book" size={64} color="#666666" />
            <Text style={styles.emptyTitle}>No Playbooks Available</Text>
            <Text style={styles.emptyDescription}>
              Loading sample basketball playbooks...
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  playbooksContainer: {
    gap: 16,
    paddingBottom: 20,
  },
  playbookCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  playbookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  playbookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  playbookDescription: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
    marginBottom: 16,
  },
  playbookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playCount: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 16,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  // Play viewer styles
  playHeader: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  stepIndicator: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  playDescription: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    lineHeight: 24,
  },
  courtContainer: {
    marginBottom: 24,
  },
  courtTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  court: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(139, 69, 19, 0.3)',
    borderRadius: 12,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  centerLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  freeThrowLine: {
    position: 'absolute',
    bottom: 30,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  threePointLine: {
    position: 'absolute',
    bottom: 15,
    left: '15%',
    right: '15%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  player: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -12,
    marginTop: -12,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  playerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  playerRole: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
  },
  responsibility: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 4,
    paddingLeft: 8,
  },
  actionItem: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    gap: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  controlText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  controlTextDisabled: {
    color: '#666666',
  },
});
