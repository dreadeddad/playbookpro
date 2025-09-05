import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Create() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Playbook</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Coming Soon */}
        <View style={styles.comingSoon}>
          <Ionicons name="add-circle" size={64} color="#666666" />
          <Text style={styles.comingSoonTitle}>Playbook Creator Coming Soon</Text>
          <Text style={styles.comingSoonDescription}>
            Advanced playbook creation tools for coaches to design custom basketball strategies
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.feature}>
              <Ionicons name="brush" size={20} color="#FF6B35" />
              <Text style={styles.featureText}>Drag & Drop Play Designer</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="document" size={20} color="#FF6B35" />
              <Text style={styles.featureText}>PDF Playbook Upload</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="share" size={20} color="#FF6B35" />
              <Text style={styles.featureText}>Share with Players</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="analytics" size={20} color="#FF6B35" />
              <Text style={styles.featureText}>Performance Analytics</Text>
            </View>
          </View>
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
    paddingBottom: 24,
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