import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text as Text3D, Box, Sphere } from '@react-three/drei';
import { Suspense } from 'react';

interface PlayerPosition {
  x: number;
  y: number;
  role: string;
  responsibilities: string[];
}

interface Play {
  step_number: number;
  description: string;
  player_positions: PlayerPosition[];
  key_actions: string[];
}

interface PlaybookViewerProps {
  plays: Play[];
  title: string;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Court dimensions (proportional)
const COURT_WIDTH = screenWidth - 48;
const COURT_HEIGHT = COURT_WIDTH * 0.6;

const PlaybookViewer: React.FC<PlaybookViewerProps> = ({ plays, title, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [showPlayerPaths, setShowPlayerPaths] = useState(false);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [playerAnims] = useState(
    new Array(5).fill(0).map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      scale: new Animated.Value(1),
    }))
  );

  const currentPlay = plays[currentStep];

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= plays.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 3000 / playSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, plays.length]);

  // Animate player positions when step changes
  useEffect(() => {
    if (currentPlay) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.parallel([
          ...currentPlay.player_positions.map((player, index) => 
            Animated.parallel([
              Animated.timing(playerAnims[index].x, {
                toValue: player.x * COURT_WIDTH,
                duration: 800,
                useNativeDriver: false,
              }),
              Animated.timing(playerAnims[index].y, {
                toValue: (1 - player.y) * COURT_HEIGHT,
                duration: 800,
                useNativeDriver: false,
              }),
              Animated.sequence([
                Animated.timing(playerAnims[index].scale, {
                  toValue: 1.3,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(playerAnims[index].scale, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]),
            ])
          ),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < plays.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

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

  const getPlayerInitial = (role: string): string => {
    const initials = {
      point_guard: 'PG',
      shooting_guard: 'SG',
      small_forward: 'SF',
      power_forward: 'PF',
      center: 'C',
      guard: 'G',
      forward: 'F',
    };
    return initials[role as keyof typeof initials] || role.charAt(0).toUpperCase();
  };

  // 3D Scene Component
  const Court3D = () => (
    <group>
      {/* Court floor */}
      <Box args={[20, 0.1, 12]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      
      {/* Court lines */}
      <Box args={[20, 0.01, 0.1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="white" />
      </Box>
      <Box args={[0.1, 0.01, 12]} position={[0, 0, 0]}>
        <meshStandardMaterial color="white" />
      </Box>
      
      {/* Hoops */}
      <group position={[-9, 3, 0]}>
        <Box args={[0.1, 0.1, 1.5]}>
          <meshStandardMaterial color="orange" />
        </Box>
      </group>
      <group position={[9, 3, 0]}>
        <Box args={[0.1, 0.1, 1.5]}>
          <meshStandardMaterial color="orange" />
        </Box>
      </group>

      {/* Players */}
      {currentPlay.player_positions.map((player, index) => (
        <group key={index} position={[
          (player.x - 0.5) * 20,
          1,
          (player.y - 0.5) * 12
        ]}>
          <Sphere args={[0.5]}>
            <meshStandardMaterial color={getPlayerColor(player.role)} />
          </Sphere>
          <Text3D
            position={[0, 1.2, 0]}
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {getPlayerInitial(player.role)}
          </Text3D>
        </group>
      ))}
    </group>
  );

  const render2DView = () => (
    <View style={styles.courtContainer}>
      <Animated.View style={[styles.court, { opacity: fadeAnim }]}>
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
          
          {/* Free throw circles */}
          <Circle
            cx={COURT_WIDTH * 0.15}
            cy={COURT_HEIGHT * 0.5}
            r={COURT_HEIGHT * 0.1}
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
          />
          <Circle
            cx={COURT_WIDTH * 0.85}
            cy={COURT_HEIGHT * 0.5}
            r={COURT_HEIGHT * 0.1}
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
          />

          {/* Player movement paths (if enabled) */}
          {showPlayerPaths && currentStep > 0 && plays[currentStep - 1] && (
            <g>
              {currentPlay.player_positions.map((player, index) => {
                const prevPlayer = plays[currentStep - 1].player_positions[index];
                if (prevPlayer) {
                  return (
                    <Line
                      key={`path-${index}`}
                      x1={prevPlayer.x * COURT_WIDTH}
                      y1={(1 - prevPlayer.y) * COURT_HEIGHT}
                      x2={player.x * COURT_WIDTH}
                      y2={(1 - player.y) * COURT_HEIGHT}
                      stroke={getPlayerColor(player.role)}
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      opacity={0.7}
                    />
                  );
                }
                return null;
              })}
            </g>
          )}
        </Svg>

        {/* Animated Players */}
        {currentPlay.player_positions.map((player, index) => (
          <Animated.View
            key={index}
            style={[
              styles.player,
              {
                backgroundColor: getPlayerColor(player.role),
                left: playerAnims[index].x,
                top: playerAnims[index].y,
                transform: [{ scale: playerAnims[index].scale }],
              },
            ]}
          >
            <Text style={styles.playerText}>
              {getPlayerInitial(player.role)}
            </Text>
          </Animated.View>
        ))}
      </Animated.View>
    </View>
  );

  const render3DView = () => (
    <View style={styles.courtContainer}>
      <Canvas style={styles.canvas3D}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Court3D />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === '2D' && styles.viewModeActive]}
            onPress={() => setViewMode('2D')}
          >
            <Text style={[styles.viewModeText, viewMode === '2D' && styles.viewModeTextActive]}>
              2D
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === '3D' && styles.viewModeActive]}
            onPress={() => setViewMode('3D')}
          >
            <Text style={[styles.viewModeText, viewMode === '3D' && styles.viewModeTextActive]}>
              3D
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Step Info */}
      <View style={styles.stepInfo}>
        <Text style={styles.stepNumber}>
          Step {currentStep + 1} of {plays.length}
        </Text>
        <Text style={styles.stepDescription}>{currentPlay.description}</Text>
      </View>

      {/* Court View */}
      {viewMode === '2D' ? render2DView() : render3DView()}

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.playbackControls}>
          <TouchableOpacity
            style={[styles.controlButton, currentStep === 0 && styles.controlButtonDisabled]}
            onPress={prevStep}
            disabled={currentStep === 0}
          >
            <Ionicons 
              name="play-skip-back" 
              size={20} 
              color={currentStep === 0 ? "#666" : "#fff"} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={togglePlayPause}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, currentStep === plays.length - 1 && styles.controlButtonDisabled]}
            onPress={nextStep}
            disabled={currentStep === plays.length - 1}
          >
            <Ionicons 
              name="play-skip-forward" 
              size={20} 
              color={currentStep === plays.length - 1 ? "#666" : "#fff"} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsControls}>
          <TouchableOpacity
            style={[styles.optionButton, showPlayerPaths && styles.optionButtonActive]}
            onPress={() => setShowPlayerPaths(!showPlayerPaths)}
          >
            <Ionicons name="git-branch" size={18} color={showPlayerPaths ? "#FF6B35" : "#fff"} />
            <Text style={[styles.optionText, showPlayerPaths && styles.optionTextActive]}>
              Paths
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setPlaySpeed(playSpeed === 1 ? 2 : playSpeed === 2 ? 0.5 : 1)}
          >
            <Ionicons name="speedometer" size={18} color="#fff" />
            <Text style={styles.optionText}>
              {playSpeed === 1 ? '1x' : playSpeed === 2 ? '2x' : '0.5x'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Step Progress Indicators */}
      <View style={styles.progressContainer}>
        {plays.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive,
              index < currentStep && styles.progressDotCompleted,
            ]}
            onPress={() => setCurrentStep(index)}
          />
        ))}
      </View>
    </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginHorizontal: 16,
  },
  headerRight: {
    flexDirection: 'row',
  },
  viewModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewModeActive: {
    backgroundColor: '#FF6B35',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  viewModeTextActive: {
    color: '#ffffff',
  },
  stepInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 107, 53, 0.2)',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 22,
  },
  courtContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  court: {
    position: 'relative',
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
    marginLeft: -16,
    marginTop: -16,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  controls: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  playPauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  optionsControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  optionButtonActive: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  optionTextActive: {
    color: '#FF6B35',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressDotActive: {
    backgroundColor: '#FF6B35',
    transform: [{ scale: 1.2 }],
  },
  progressDotCompleted: {
    backgroundColor: 'rgba(255, 107, 53, 0.6)',
  },
});

export default PlaybookViewer;