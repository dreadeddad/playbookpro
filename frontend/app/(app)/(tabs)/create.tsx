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
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Create() {
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Play Details, 3: Preview
  const [loading, setLoading] = useState(false);
  
  // Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('offense');
  
  // Play Details
  const [playTitle, setPlayTitle] = useState('');
  const [playDescription, setPlayDescription] = useState('');
  const [keyActions, setKeyActions] = useState(['', '', '']);

  const categories = [
    { id: 'offense', name: 'Offense', icon: '⚡' },
    { id: 'defense', name: 'Defense', icon: '🛡️' },
    { id: 'transition', name: 'Transition', icon: '🏃‍♂️' },
  ];

  const samplePositions = [
    { x: 0.5, y: 0.8, role: 'point_guard', responsibilities: ['Control ball', 'Read defense'] },
    { x: 0.4, y: 0.6, role: 'center', responsibilities: ['Set screen', 'Roll to basket'] },
    { x: 0.1, y: 0.4, role: 'forward', responsibilities: ['Space the floor', 'Be ready for pass'] },
    { x: 0.9, y: 0.4, role: 'forward', responsibilities: ['Space the floor', 'Help side support'] },
    { x: 0.7, y: 0.2, role: 'guard', responsibilities: ['Spot up for three', 'Be ready to help'] },
  ];

  const createPlaybook = async () => {
    if (!title.trim() || !description.trim() || !playTitle.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Get demo user data
      const storedUser = await AsyncStorage.getItem('demo_user');
      let coachId = 'demo_coach';
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        coachId = user.uid;
      }

      const playbookData = {
        title: title.trim(),
        description: description.trim(),
        category,
        is_public: true,
        plays: [
          {
            step_number: 1,
            description: playDescription.trim() || 'Execute the play as designed',
            player_positions: samplePositions,
            key_actions: keyActions.filter(action => action.trim() !== '')
          }
        ]
      };

      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/playbooks?coach_id=${coachId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playbookData),
      });

      if (response.ok) {
        Alert.alert(
          'Success!', 
          'Your basketball playbook has been created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setTitle('');
                setDescription('');
                setPlayTitle('');
                setPlayDescription('');
                setKeyActions(['', '', '']);
                setStep(1);
              }
            }
          ]
        );
      } else {
        throw new Error('Failed to create playbook');
      }
    } catch (error) {
      console.error('Error creating playbook:', error);
      Alert.alert('Error', 'Failed to create playbook. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>📋 Basic Information</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Playbook Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Advanced Pick and Roll"
          placeholderTextColor="#666666"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the purpose and strategy of this playbook..."
          placeholderTextColor="#666666"
          multiline={true}
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                category === cat.id && styles.categoryButtonActive
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[
                styles.categoryText,
                category === cat.id && styles.categoryTextActive
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.nextButton, (!title.trim() || !description.trim()) && styles.nextButtonDisabled]}
        onPress={() => title.trim() && description.trim() && setStep(2)}
        disabled={!title.trim() || !description.trim()}
      >
        <Text style={styles.nextButtonText}>Next: Play Details</Text>
        <Ionicons name="chevron-forward" size={20} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>🏀 Play Details</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Play Name *</Text>
        <TextInput
          style={styles.input}
          value={playTitle}
          onChangeText={setPlayTitle}
          placeholder="e.g., Screen and Roll"
          placeholderTextColor="#666666"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Play Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={playDescription}
          onChangeText={setPlayDescription}
          placeholder="Describe how to execute this play..."
          placeholderTextColor="#666666"
          multiline={true}
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Key Actions</Text>
        {keyActions.map((action, index) => (
          <TextInput
            key={index}
            style={styles.input}
            value={action}
            onChangeText={(text) => {
              const newActions = [...keyActions];
              newActions[index] = text;
              setKeyActions(newActions);
            }}
            placeholder={`Key action ${index + 1}...`}
            placeholderTextColor="#666666"
          />
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, !playTitle.trim() && styles.nextButtonDisabled]}
          onPress={() => playTitle.trim() && setStep(3)}
          disabled={!playTitle.trim()}
        >
          <Text style={styles.nextButtonText}>Preview</Text>
          <Ionicons name="chevron-forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>👁️ Preview & Create</Text>
      
      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>{title}</Text>
        <View style={styles.previewCategory}>
          <Text style={styles.previewCategoryText}>
            {categories.find(c => c.id === category)?.icon} {categories.find(c => c.id === category)?.name}
          </Text>
        </View>
        <Text style={styles.previewDescription}>{description}</Text>
        
        <View style={styles.playPreview}>
          <Text style={styles.playPreviewTitle}>📋 {playTitle}</Text>
          {playDescription && (
            <Text style={styles.playPreviewDesc}>{playDescription}</Text>
          )}
          
          <View style={styles.actionsPreview}>
            <Text style={styles.actionsTitle}>Key Actions:</Text>
            {keyActions.filter(action => action.trim()).map((action, index) => (
              <Text key={index} style={styles.actionPreview}>✓ {action}</Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={createPlaybook}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.createButtonText}>Create Playbook</Text>
              <Ionicons name="checkmark" size={20} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Playbook</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Step {step} of 3</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
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
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#cccccc',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderColor: '#FF6B35',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FF6B35',
  },
  nextButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    flex: 1,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    flex: 2,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  previewCategory: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  previewCategoryText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  previewDescription: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
    marginBottom: 16,
  },
  playPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  playPreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  playPreviewDesc: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 12,
    lineHeight: 18,
  },
  actionsPreview: {
    marginTop: 8,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  actionPreview: {
    fontSize: 12,
    color: '#22c55e',
    marginBottom: 4,
  },
});
