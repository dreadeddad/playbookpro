import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PlayerPosition {
  x: number;
  y: number;
  role: string;
  responsibilities: string[];
}

interface PlayerDetailsPanelProps {
  players: PlayerPosition[];
  visible: boolean;
  onClose: () => void;
  selectedPlayer?: number;
}

const PlayerDetailsPanel: React.FC<PlayerDetailsPanelProps> = ({
  players,
  visible,
  onClose,
  selectedPlayer,
}) => {
  const [activePlayerIndex, setActivePlayerIndex] = useState(selectedPlayer || 0);

  const getPlayerColor = (role: string): string => {
    const colors = {
      point_guard: '#3B82F6',
      shooting_guard: '#8B5CF6',
      small_forward: '#10B981',
      power_forward: '#F59E0B',
      center: '#EF4444',
      guard: '#6366F1',
      forward: '#059669',
    };
    return colors[role as keyof typeof colors] || '#FF6B35';
  };

  const getPlayerName = (role: string): string => {
    const names = {
      point_guard: 'Point Guard',
      shooting_guard: 'Shooting Guard',
      small_forward: 'Small Forward',
      power_forward: 'Power Forward',
      center: 'Center',
      guard: 'Guard',
      forward: 'Forward',
    };
    return names[role as keyof typeof names] || role.replace('_', ' ').toUpperCase();
  };

  const getPlayerIcon = (role: string): string => {
    const icons = {
      point_guard: 'basketball',
      shooting_guard: 'rocket',
      small_forward: 'flash',
      power_forward: 'fitness',
      center: 'shield',
      guard: 'eye',
      forward: 'arrow-forward',
    };
    return icons[role as keyof typeof icons] || 'person';
  };

  const activePlayer = players[activePlayerIndex];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.panel}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Player Details</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Player Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.playerTabs}
          >
            {players.map((player, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.playerTab,
                  { backgroundColor: getPlayerColor(player.role) },
                  activePlayerIndex === index && styles.playerTabActive,
                ]}
                onPress={() => setActivePlayerIndex(index)}
              >
                <Ionicons 
                  name={getPlayerIcon(player.role) as any} 
                  size={20} 
                  color="#ffffff" 
                />
                <Text style={styles.playerTabText}>
                  {player.role.split('_')[0].charAt(0).toUpperCase()}
                  {player.role.split('_')[1]?.charAt(0).toUpperCase() || ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Active Player Details */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={[getPlayerColor(activePlayer.role) + '20', 'transparent']}
              style={styles.playerCard}
            >
              <View style={styles.playerHeader}>
                <View style={[styles.playerAvatar, { backgroundColor: getPlayerColor(activePlayer.role) }]}>
                  <Ionicons 
                    name={getPlayerIcon(activePlayer.role) as any} 
                    size={32} 
                    color="#ffffff" 
                  />
                </View>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>
                    {getPlayerName(activePlayer.role)}
                  </Text>
                  <Text style={styles.playerPosition}>
                    Position: ({(activePlayer.x * 100).toFixed(0)}%, {((1 - activePlayer.y) * 100).toFixed(0)}%)
                  </Text>
                </View>
              </View>

              {/* Responsibilities */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Responsibilities</Text>
                {activePlayer.responsibilities.map((responsibility, index) => (
                  <View key={index} style={styles.responsibilityItem}>
                    <View style={[styles.responsibilityDot, { backgroundColor: getPlayerColor(activePlayer.role) }]} />
                    <Text style={styles.responsibilityText}>{responsibility}</Text>
                  </View>
                ))}
              </View>

              {/* Position Analysis */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Position Analysis</Text>
                <View style={styles.analysisGrid}>
                  <View style={styles.analysisItem}>
                    <Text style={styles.analysisLabel}>Zone</Text>
                    <Text style={styles.analysisValue}>
                      {activePlayer.y > 0.7 ? 'Backcourt' : 
                       activePlayer.y > 0.3 ? 'Mid-court' : 'Frontcourt'}
                    </Text>
                  </View>
                  <View style={styles.analysisItem}>
                    <Text style={styles.analysisLabel}>Side</Text>
                    <Text style={styles.analysisValue}>
                      {activePlayer.x < 0.3 ? 'Left' : 
                       activePlayer.x > 0.7 ? 'Right' : 'Center'}
                    </Text>
                  </View>
                  <View style={styles.analysisItem}>
                    <Text style={styles.analysisLabel}>Range</Text>
                    <Text style={styles.analysisValue}>
                      {Math.sqrt(Math.pow(activePlayer.x - 0.5, 2) + Math.pow(activePlayer.y - 0.1, 2)) < 0.3 
                        ? 'Close' : 'Far'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Strategic Tips */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Strategic Tips</Text>
                <View style={styles.tipsContainer}>
                  {getStrategicTips(activePlayer.role).map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Ionicons name="bulb" size={16} color="#FFD700" />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const getStrategicTips = (role: string): string[] => {
  const tips = {
    point_guard: [
      'Maintain court vision at all times',
      'Call out defensive switches',
      'Control game tempo and pace',
    ],
    shooting_guard: [
      'Stay ready for quick release shots',
      'Create separation from defender',
      'Support ball handler on drives',
    ],
    small_forward: [
      'Be versatile in offensive positioning',
      'Switch between inside and outside play',
      'Help with rebounds and transitions',
    ],
    power_forward: [
      'Establish strong post position',
      'Set solid screens for guards',
      'Control the paint on defense',
    ],
    center: [
      'Dominate the paint area',
      'Protect the rim on defense',
      'Create space for teammates',
    ],
    guard: [
      'Stay alert for passing lanes',
      'Move without the ball',
      'Communicate with teammates',
    ],
    forward: [
      'Be ready for rebounds',
      'Stretch the defense',
      'Support both inside and outside play',
    ],
  };
  
  return tips[role as keyof typeof tips] || [
    'Stay focused on your role',
    'Communicate with teammates',
    'Execute the play as designed',
  ];
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerTabs: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  playerTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  playerTabActive: {
    transform: [{ scale: 1.05 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playerTabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  playerCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  playerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  playerPosition: {
    fontSize: 14,
    color: '#cccccc',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  responsibilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  responsibilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  responsibilityText: {
    fontSize: 14,
    color: '#cccccc',
    flex: 1,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analysisItem: {
    flex: 1,
    minWidth: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  analysisLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  analysisValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tipsContainer: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#cccccc',
    flex: 1,
    lineHeight: 20,
  },
});

export default PlayerDetailsPanel;