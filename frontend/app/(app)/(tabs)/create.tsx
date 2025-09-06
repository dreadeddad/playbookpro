import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PlayCreator from '../../../components/PlayCreator';

export default function Create() {
  const [showCreator, setShowCreator] = useState(false);

  const handleSavePlay = (playData: any) => {
    Alert.alert(
      'Success!',
      'Your custom basketball play has been created successfully!',
      [{ text: 'OK', onPress: () => setShowCreator(false) }]
    );
  };

  const handleCancel = () => {
    setShowCreator(false);
  };

  if (showCreator) {
    return (
      <PlayCreator
        onSave={handleSavePlay}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Playbook</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🎨</Text>
          <Text style={styles.heroTitle}>Drag & Drop Play Designer</Text>
          <Text style={styles.heroDescription}>
            Create custom basketball plays with our advanced visual designer
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Ionicons name="move" size={24} color="#FF6B35" />
            <Text style={styles.featureTitle}>Drag & Drop Players</Text>
            <Text style={styles.featureDescription}>
              Position players anywhere on the court with intuitive drag gestures
            </Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="trending-up" size={24} color="#10B981" />
            <Text style={styles.featureTitle}>Movement Paths</Text>
            <Text style={styles.featureDescription}>
              Add passes, cuts, screens, and movement arrows to your plays
            </Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="cube" size={24} color="#8B5CF6" />
            <Text style={styles.featureTitle}>2D & 3D Preview</Text>
            <Text style={styles.featureDescription}>
              Switch between 2D design view and 3D preview mode
            </Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="save" size={24} color="#3B82F6" />
            <Text style={styles.featureTitle}>Save & Share</Text>
            <Text style={styles.featureDescription}>
              Save your custom plays and share them with your team
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.startButton} onPress={() => setShowCreator(true)}>
          <Ionicons name="brush" size={24} color="#ffffff" />
          <Text style={styles.startButtonText}>Start Creating</Text>
        </TouchableOpacity>

        {/* Quick Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Quick Tips:</Text>
          <Text style={styles.tip}>• Drag players to position them on the court</Text>
          <Text style={styles.tip}>• Select movement type then tap destination</Text>
          <Text style={styles.tip}>• Use 2D/3D toggle to preview your design</Text>
          <Text style={styles.tip}>• Fill in play details and save when ready</Text>
        </View>
      </View>
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
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  helpButton: {
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
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginVertical: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 16,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#cccccc',
    marginLeft: 16,
    lineHeight: 20,
    flex: 1,
  },
  startButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginVertical: 24,
    gap: 12,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
    lineHeight: 20,
  },
});
