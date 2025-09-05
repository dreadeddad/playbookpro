import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text as Text3D, Box, Sphere, useGLTF } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';

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

interface GameSimulationProps {
  plays: Play[];
  title: string;
  onClose: () => void;
  onActionLog: (action: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');

// 3D Player Component with Physics
const Player3D = ({ 
  position, 
  color, 
  role, 
  isControlled = false, 
  onInteraction 
}: {
  position: [number, number, number];
  color: string;
  role: string;
  isControlled?: boolean;
  onInteraction?: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (meshRef.current && isControlled) {
      // Add subtle floating animation for controlled player
      meshRef.current.position.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <RigidBody position={position} type="dynamic">
      <Sphere
        ref={meshRef}
        args={[0.4]}
        onClick={() => {
          setClicked(!clicked);
          onInteraction?.();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={hovered ? '#ffffff' : color}
          emissive={isControlled ? color : '#000000'}
          emissiveIntensity={isControlled ? 0.3 : 0}
        />
      </Sphere>
      
      {/* Player label */}
      <Text3D
        position={[0, 1, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {role.split('_')[0].toUpperCase()}
      </Text3D>
      
      {/* Selection indicator */}
      {(hovered || clicked) && (
        <Sphere args={[0.6]} position={[0, 0, 0]}>
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.2}
            wireframe
          />
        </Sphere>
      )}
    </RigidBody>
  );
};

// Basketball Component with Physics
const Basketball = ({ 
  position, 
  onInteraction 
}: { 
  position: [number, number, number];
  onInteraction?: () => void;
}) => {
  const ballRef = useRef<THREE.Mesh>(null);
  const [bouncing, setBouncing] = useState(false);

  useFrame(() => {
    if (ballRef.current && bouncing) {
      // Simple bounce physics
      ballRef.current.rotation.x += 0.1;
      ballRef.current.rotation.z += 0.05;
    }
  });

  return (
    <RigidBody position={position} type="dynamic">
      <Sphere
        ref={ballRef}
        args={[0.2]}
        onClick={() => {
          setBouncing(!bouncing);
          onInteraction?.();
        }}
      >
        <meshStandardMaterial 
          color="#FF8C00"
          roughness={0.8}
        />
      </Sphere>
    </RigidBody>
  );
};

// 3D Court Component
const Court3D = () => (
  <group>
    {/* Court floor */}
    <RigidBody type="fixed">
      <Box args={[24, 0.2, 15]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
    </RigidBody>
    
    {/* Court boundaries */}
    <group>
      {/* Sidelines */}
      <Box args={[24, 0.05, 0.1]} position={[0, 0, 7.5]}>
        <meshStandardMaterial color="white" />
      </Box>
      <Box args={[24, 0.05, 0.1]} position={[0, 0, -7.5]}>
        <meshStandardMaterial color="white" />
      </Box>
      
      {/* Baselines */}
      <Box args={[0.1, 0.05, 15]} position={[12, 0, 0]}>
        <meshStandardMaterial color="white" />
      </Box>
      <Box args={[0.1, 0.05, 15]} position={[-12, 0, 0]}>
        <meshStandardMaterial color="white" />
      </Box>
      
      {/* Center line */}
      <Box args={[0.1, 0.05, 15]} position={[0, 0, 0]}>
        <meshStandardMaterial color="white" />
      </Box>
      
      {/* Center circle */}
      <group position={[0, 0.05, 0]}>
        {Array.from({ length: 32 }).map((_, i) => {
          const angle = (i / 32) * Math.PI * 2;
          const x = Math.cos(angle) * 2;
          const z = Math.sin(angle) * 2;
          return (
            <Box key={i} args={[0.2, 0.02, 0.1]} position={[x, 0, z]}>
              <meshStandardMaterial color="white" />
            </Box>
          );
        })}
      </group>
    </group>

    {/* Basketball hoops */}
    <group position={[-10, 3, 0]}>
      <Box args={[0.2, 0.2, 1.8]}>
        <meshStandardMaterial color="orange" />
      </Box>
      <Box args={[1.2, 0.1, 0.1]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="orange" />
      </Box>
    </group>
    <group position={[10, 3, 0]}>
      <Box args={[0.2, 0.2, 1.8]}>
        <meshStandardMaterial color="orange" />
      </Box>
      <Box args={[1.2, 0.1, 0.1]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="orange" />
      </Box>
    </group>

    {/* Three-point lines */}
    <group>
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 19) * Math.PI;
        const x = Math.cos(angle) * 7 - 10;
        const z = Math.sin(angle) * 7;
        return (
          <Box key={`left-${i}`} args={[0.1, 0.02, 0.2]} position={[x, 0.05, z]}>
            <meshStandardMaterial color="white" />
          </Box>
        );
      })}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 19) * Math.PI;
        const x = -Math.cos(angle) * 7 + 10;
        const z = Math.sin(angle) * 7;
        return (
          <Box key={`right-${i}`} args={[0.1, 0.02, 0.2]} position={[x, 0.05, z]}>
            <meshStandardMaterial color="white" />
          </Box>
        );
      })}
    </group>
  </group>
);

const GameSimulation: React.FC<GameSimulationProps> = ({
  plays,
  title,
  onClose,
  onActionLog,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [gameMode, setGameMode] = useState<'practice' | 'simulation'>('practice');
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [gameTime, setGameTime] = useState(0);
  const [ballPosition, setBallPosition] = useState<[number, number, number]>([0, 1, 0]);
  const [gameLog, setGameLog] = useState<string[]>([]);

  const currentPlay = plays[currentStep];

  // Game timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameMode === 'simulation') {
      timer = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameMode]);

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

  const handlePlayerInteraction = (playerIndex: number) => {
    setSelectedPlayer(playerIndex);
    const player = currentPlay.player_positions[playerIndex];
    const action = `Selected ${player.role.replace('_', ' ')} at position (${(player.x * 100).toFixed(0)}%, ${((1 - player.y) * 100).toFixed(0)}%)`;
    
    setGameLog(prev => [...prev.slice(-4), action]);
    onActionLog(action);

    // Show player options
    Alert.alert(
      'Player Action',
      `What should the ${player.role.replace('_', ' ')} do?`,
      [
        { text: 'Pass Ball', onPress: () => handleAction('pass', playerIndex) },
        { text: 'Shoot', onPress: () => handleAction('shoot', playerIndex) },
        { text: 'Move', onPress: () => handleAction('move', playerIndex) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAction = (action: string, playerIndex: number) => {
    const player = currentPlay.player_positions[playerIndex];
    let logMessage = '';
    
    switch (action) {
      case 'pass':
        logMessage = `${player.role.replace('_', ' ')} passes the ball`;
        setBallPosition([Math.random() * 20 - 10, 1, Math.random() * 12 - 6]);
        break;
      case 'shoot':
        const shootSuccess = Math.random() > 0.4;
        if (shootSuccess) {
          setScore(prev => ({ ...prev, player: prev.player + 2 }));
          logMessage = `${player.role.replace('_', ' ')} scores! +2 points`;
        } else {
          logMessage = `${player.role.replace('_', ' ')} misses the shot`;
        }
        break;
      case 'move':
        logMessage = `${player.role.replace('_', ' ')} moves to new position`;
        break;
    }
    
    setGameLog(prev => [...prev.slice(-4), logMessage]);
    onActionLog(logMessage);
  };

  const handleBallInteraction = () => {
    const actions = ['Dribble', 'Pick up', 'Steal attempt'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const logMessage = `Ball interaction: ${randomAction}`;
    
    setGameLog(prev => [...prev.slice(-4), logMessage]);
    onActionLog(logMessage);
  };

  const nextPlay = () => {
    if (currentStep < plays.length - 1) {
      setCurrentStep(currentStep + 1);
      setGameLog(prev => [...prev.slice(-4), `Starting play: ${plays[currentStep + 1].description}`]);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title} - Simulation</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.modeButton, gameMode === 'practice' && styles.modeButtonActive]}
            onPress={() => setGameMode('practice')}
          >
            <Text style={[styles.modeText, gameMode === 'practice' && styles.modeTextActive]}>
              Practice
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, gameMode === 'simulation' && styles.modeButtonActive]}
            onPress={() => setGameMode('simulation')}
          >
            <Text style={[styles.modeText, gameMode === 'simulation' && styles.modeTextActive]}>
              Live
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Game Stats */}
      <View style={styles.gameStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Player Score</Text>
          <Text style={styles.statValue}>{score.player}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{formatTime(gameTime)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>AI Score</Text>
          <Text style={styles.statValue}>{score.ai}</Text>
        </View>
      </View>

      {/* 3D Game View */}
      <View style={styles.gameView}>
        <Canvas>
          <Suspense fallback={null}>
            <Physics>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <spotLight position={[0, 20, 0]} angle={0.3} penumbra={1} intensity={0.8} />
              
              <Court3D />
              
              {/* Players */}
              {currentPlay.player_positions.map((player, index) => (
                <Player3D
                  key={index}
                  position={[
                    (player.x - 0.5) * 24,
                    1,
                    (player.y - 0.5) * 15
                  ]}
                  color={getPlayerColor(player.role)}
                  role={player.role}
                  isControlled={selectedPlayer === index}
                  onInteraction={() => handlePlayerInteraction(index)}
                />
              ))}
              
              {/* Basketball */}
              <Basketball
                position={ballPosition}
                onInteraction={handleBallInteraction}
              />
              
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={10}
                maxDistance={50}
                maxPolarAngle={Math.PI / 2.2}
              />
            </Physics>
          </Suspense>
        </Canvas>
      </View>

      {/* Game Log */}
      <View style={styles.gameLog}>
        <Text style={styles.logTitle}>Game Log</Text>
        {gameLog.slice(-3).map((log, index) => (
          <Text key={index} style={styles.logText}>
            • {log}
          </Text>
        ))}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={nextPlay}>
          <Ionicons name="play-forward" size={20} color="#fff" />
          <Text style={styles.controlText}>Next Play</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => {
            setScore({ player: 0, ai: 0 });
            setGameTime(0);
            setGameLog([]);
            setBallPosition([0, 1, 0]);
          }}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.controlText}>Reset</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginHorizontal: 12,
  },
  headerRight: {
    flexDirection: 'row',
  },
  modeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeButtonActive: {
    backgroundColor: '#FF6B35',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  modeTextActive: {
    color: '#ffffff',
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  gameView: {
    flex: 1,
  },
  gameLog: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  logTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  logText: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    gap: 6,
  },
  controlText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default GameSimulation;