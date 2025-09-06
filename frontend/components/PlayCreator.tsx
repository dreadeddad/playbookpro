import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Svg, { 
  Circle, 
  Line, 
  Path, 
  Rect, 
  Text as SvgText, 
  Defs, 
  Marker, 
  ArrowHead 
} from 'react-native-svg';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text as Text3D, Box, Sphere } from '@react-three/drei';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Lazy load heavy 3D components
const Court3DPreview = lazy(() => import('./Court3DPreview'));

interface PlayerPosition {
  id: string;
  x: number;
  y: number;
  role: string;
  color: string;
}

interface PlayStep {
  id: string;
  from: string; // player id
  to: { x: number; y: number };
  type: 'move' | 'pass' | 'screen' | 'cut';
  description: string;
}

interface PlayCreatorProps {
  onSave: (playData: any) => void;
  onCancel: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const COURT_WIDTH = screenWidth - 48;
const COURT_HEIGHT = COURT_WIDTH * 0.6;

const PLAYER_ROLES = [
  { id: 'point_guard', name: 'Point Guard', color: '#3B82F6', icon: 'basketball' },
  { id: 'shooting_guard', name: 'Shooting Guard', color: '#8B5CF6', icon: 'flash' },
  { id: 'small_forward', name: 'Small Forward', color: '#10B981', icon: 'trending-up' },
  { id: 'power_forward', name: 'Power Forward', color: '#F59E0B', icon: 'fitness' },
  { id: 'center', name: 'Center', color: '#EF4444', icon: 'shield' },
];

const STEP_TYPES = [
  { id: 'move', name: 'Move', color: '#3B82F6', icon: 'walk' },
  { id: 'pass', name: 'Pass', color: '#10B981', icon: 'arrow-forward' },
  { id: 'screen', name: 'Screen', color: '#F59E0B', icon: 'stop' },
  { id: 'cut', name: 'Cut', color: '#EF4444', icon: 'flash' },
];

const PlayCreator: React.FC<PlayCreatorProps> = ({ onSave, onCancel }) => {
  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('offense');
  
  // Play design data
  const [players, setPlayers] = useState<PlayerPosition[]>([]);
  const [steps, setSteps] = useState<PlayStep[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedStepType, setSelectedStepType] = useState('move');
  
  // UI states
  const [currentStep, setCurrentStep] = useState(0);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [loading, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize default player positions
  React.useEffect(() => {
    const defaultPositions: PlayerPosition[] = PLAYER_ROLES.map((role, index) => ({
      id: `player_${index}`,
      x: 0.2 + (index * 0.15),
      y: 0.8,
      role: role.id,
      color: role.color,
    }));
    setPlayers(defaultPositions);
  }, []);

  // Drag handlers for players
  const handlePlayerDrag = useCallback((playerId: string, x: number, y: number) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, x: x / COURT_WIDTH, y: (COURT_HEIGHT - y) / COURT_HEIGHT }
        : player
    ));
  }, []);

  // Step creation
  const addStep = useCallback((fromPlayerId: string, toX: number, toY: number) => {
    const newStep: PlayStep = {
      id: `step_${Date.now()}`,
      from: fromPlayerId,
      to: { x: toX / COURT_WIDTH, y: (COURT_HEIGHT - toY) / COURT_HEIGHT },
      type: selectedStepType as any,
      description: `${selectedStepType} to position`,
    };
    setSteps(prev => [...prev, newStep]);
  }, [selectedStepType]);

  // Validation
  const validatePlay = useCallback((): string[] => {
    const errors: string[] = [];
    
    if (!title.trim()) errors.push('Play title is required');
    if (!description.trim()) errors.push('Play description is required');
    if (players.length === 0) errors.push('At least one player position is required');
    if (steps.length === 0) errors.push('At least one step is required');
    
    return errors;
  }, [title, description, players, steps]);

  // Save play
  const handleSave = useCallback(async () => {
    const errors = validatePlay();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSaving(true);
    setValidationErrors([]);

    try {
      // Get current user data
      const userDataStr = await AsyncStorage.getItem('demo_user');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const coachId = userData?.uid || 'demo_coach';

      // Format play data for API
      const playData = {
        title: title.trim(),
        description: description.trim(),
        category,
        is_public: false,
        plays: [{
          step_number: 1,
          description: description.trim(),
          player_positions: players.map(player => ({
            x: player.x,
            y: player.y,
            role: player.role,
            responsibilities: [`Position for ${title}`],
          })),
          key_actions: steps.map(step => `${step.type}: ${step.description}`),
        }],
      };

      // Save to backend
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/playbooks?coach_id=${coachId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playData),
      });

      if (!response.ok) {
        throw new Error('Failed to save playbook');
      }

      const savedPlay = await response.json();
      console.log('Play saved:', savedPlay);

      Alert.alert(
        'Success!',
        'Your custom play has been saved successfully.',
        [{ text: 'OK', onPress: () => onSave(savedPlay) }]
      );

    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(
        'Error',
        'Failed to save your play. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  }, [title, description, category, players, steps, onSave, validatePlay]);

  // Court touch handler for placing steps
  const handleCourtTouch = useCallback((event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    
    if (selectedPlayer && isDrawingPath) {
      addStep(selectedPlayer, locationX, locationY);
      setIsDrawingPath(false);
    }
  }, [selectedPlayer, isDrawingPath, addStep]);

  // Draggable Player Component
  const DraggablePlayer = ({ player }: { player: PlayerPosition }) => {
    const pan = React.useRef(new Animated.ValueXY()).current;
    const role = PLAYER_ROLES.find(r => r.id === player.role);

    const panResponder = React.useMemo(() => 
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          setSelectedPlayer(player.id);
          pan.setOffset({
            x: (pan.x as any)._value,
            y: (pan.y as any)._value,
          });
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gestureState) => {
          pan.flattenOffset();
          const newX = Math.max(0, Math.min(COURT_WIDTH, player.x * COURT_WIDTH + gestureState.dx));
          const newY = Math.max(0, Math.min(COURT_HEIGHT, (1 - player.y) * COURT_HEIGHT + gestureState.dy));
          handlePlayerDrag(player.id, newX, COURT_HEIGHT - newY);
        },
      }), [player, handlePlayerDrag]
    );

    return (
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.player,
          {
            backgroundColor: player.color,
            left: player.x * COURT_WIDTH - 16,
            top: (1 - player.y) * COURT_HEIGHT - 16,
            borderColor: selectedPlayer === player.id ? '#ffffff' : player.color,
            borderWidth: selectedPlayer === player.id ? 3 : 2,
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
            ],
          },
        ]}
      >
        <Ionicons 
          name={role?.icon as any || 'person'} 
          size={16} 
          color="#ffffff" 
        />
      </Animated.View>
    );
  };

  // 2D Court View
  const render2DView = () => (
    <View style={styles.courtContainer}>
      <View style={styles.court} onTouchEnd={handleCourtTouch}>
        <Svg width={COURT_WIDTH} height={COURT_HEIGHT} style={styles.courtSvg}>
          {/* Court outline */}
          <Rect
            width={COURT_WIDTH}
            height={COURT_HEIGHT}
            fill="rgba(139, 69, 19, 0.3)"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="2"
            rx="8"
          />
          
          {/* Center line */}
          <Line
            x1={COURT_WIDTH / 2}
            y1={0}
            x2={COURT_WIDTH / 2}
            y2={COURT_HEIGHT}
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="2"
          />
          
          {/* Center circle */}
          <Circle
            cx={COURT_WIDTH / 2}
            cy={COURT_HEIGHT / 2}
            r={COURT_HEIGHT * 0.15}
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
          />
          
          {/* Three-point lines */}
          <Path
            d={`M ${COURT_WIDTH * 0.15} ${COURT_HEIGHT * 0.15} 
                Q ${COURT_WIDTH * 0.15} ${COURT_HEIGHT * 0.5} 
                ${COURT_WIDTH * 0.15} ${COURT_HEIGHT * 0.85}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
          />
          <Path
            d={`M ${COURT_WIDTH * 0.85} ${COURT_HEIGHT * 0.15} 
                Q ${COURT_WIDTH * 0.85} ${COURT_HEIGHT * 0.5} 
                ${COURT_WIDTH * 0.85} ${COURT_HEIGHT * 0.85}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
          />

          {/* Arrow marker definition */}
          <Defs>
            <Marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <Path
                d="M 0 0 L 10 3.5 L 0 7 z"
                fill="#FF6B35"
              />
            </Marker>
          </Defs>

          {/* Steps/Arrows */}
          {steps.map((step, index) => {
            const fromPlayer = players.find(p => p.id === step.from);
            if (!fromPlayer) return null;
            
            const stepType = STEP_TYPES.find(t => t.id === step.type);
            
            return (
              <Line
                key={step.id}
                x1={fromPlayer.x * COURT_WIDTH}
                y1={(1 - fromPlayer.y) * COURT_HEIGHT}
                x2={step.to.x * COURT_WIDTH}
                y2={(1 - step.to.y) * COURT_HEIGHT}
                stroke={stepType?.color || '#FF6B35'}
                strokeWidth="3"
                strokeDasharray={step.type === 'pass' ? '5,5' : '0'}
                markerEnd="url(#arrowhead)"
              />
            );
          })}
        </Svg>

        {/* Draggable Players */}
        {players.map((player) => (
          <DraggablePlayer key={player.id} player={player} />
        ))}
      </View>
    </View>
  );

  // 3D Court Preview
  const render3DView = () => (
    <View style={styles.courtContainer}>
      <Suspense fallback={
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading 3D Preview...</Text>
        </View>
      }>
        <Canvas style={styles.canvas3D}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          
          {/* Court */}
          <Box args={[20, 0.1, 12]} position={[0, -0.05, 0]}>
            <meshStandardMaterial color="#8B4513" />
          </Box>
          
          {/* Players */}
          {players.map((player) => (
            <Sphere
              key={player.id}
              args={[0.4]}
              position={[
                (player.x - 0.5) * 20,
                1,
                (player.y - 0.5) * 12
              ]}
            >
              <meshStandardMaterial color={player.color} />
            </Sphere>
          ))}
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={30}
          />
        </Canvas>
      </Suspense>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Custom Play</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Play Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Pick and Roll Variation"
            placeholderTextColor="#666666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the play execution and key points..."
            placeholderTextColor="#666666"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryButtons}>
            {['offense', 'defense', 'transition'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  category === cat && styles.categoryButtonTextActive,
                ]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Court Designer */}
      <View style={styles.designerSection}>
        <View style={styles.designerHeader}>
          <Text style={styles.sectionTitle}>Design Court</Text>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === '2D' && styles.toggleButtonActive]}
              onPress={() => setViewMode('2D')}
            >
              <Text style={[styles.toggleText, viewMode === '2D' && styles.toggleTextActive]}>2D</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === '3D' && styles.toggleButtonActive]}
              onPress={() => setViewMode('3D')}
            >
              <Text style={[styles.toggleText, viewMode === '3D' && styles.toggleTextActive]}>3D</Text>
            </TouchableOpacity>
          </View>
        </View>

        {viewMode === '2D' ? render2DView() : render3DView()}
      </View>

      {/* Tools */}
      <View style={styles.toolsSection}>
        <Text style={styles.sectionTitle}>Design Tools</Text>
        
        {/* Step Types */}
        <View style={styles.stepTypes}>
          <Text style={styles.toolLabel}>Add Movement:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {STEP_TYPES.map((stepType) => (
              <TouchableOpacity
                key={stepType.id}
                style={[
                  styles.stepTypeButton,
                  { borderColor: stepType.color },
                  selectedStepType === stepType.id && { backgroundColor: stepType.color + '20' },
                ]}
                onPress={() => setSelectedStepType(stepType.id)}
              >
                <Ionicons name={stepType.icon as any} size={20} color={stepType.color} />
                <Text style={[styles.stepTypeText, { color: stepType.color }]}>
                  {stepType.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>How to Use:</Text>
          <Text style={styles.instruction}>1. Drag players to position them on the court</Text>
          <Text style={styles.instruction}>2. Select a player, choose movement type, then tap destination</Text>
          <Text style={styles.instruction}>3. Use 2D/3D toggle to preview your play</Text>
        </View>
      </View>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <View style={styles.errorContainer}>
          {validationErrors.map((error, index) => (
            <Text key={index} style={styles.errorText}>• {error}</Text>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="checkmark" size={20} color="#ffffff" />
          )}
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Play'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginHorizontal: 16,
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cccccc',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  designerSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  designerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#FF6B35',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cccccc',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  courtContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  court: {
    position: 'relative',
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  courtSvg: {
    backgroundColor: 'transparent',
  },
  canvas3D: {
    width: COURT_WIDTH,
    height: COURT_HEIGHT,
  },
  player: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toolsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  stepTypes: {
    marginBottom: 20,
  },
  toolLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  stepTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  stepTypeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  instructions: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 4,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(255, 107, 53, 0.5)',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loadingContainer: {
    width: COURT_WIDTH,
    height: COURT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#cccccc',
    marginTop: 12,
  },
});

export default PlayCreator;