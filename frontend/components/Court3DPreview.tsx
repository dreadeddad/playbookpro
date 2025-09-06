import React from 'react';
import { Box, Sphere, Text as Text3D } from '@react-three/drei';

interface Court3DPreviewProps {
  players: Array<{
    id: string;
    x: number;
    y: number;
    color: string;
    role: string;
  }>;
}

const Court3DPreview: React.FC<Court3DPreviewProps> = ({ players }) => {
  return (
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
      
      {/* Basketball hoops */}
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
      {players.map((player) => (
        <group key={player.id} position={[
          (player.x - 0.5) * 20,
          1,
          (player.y - 0.5) * 12
        ]}>
          <Sphere args={[0.5]}>
            <meshStandardMaterial color={player.color} />
          </Sphere>
          <Text3D
            position={[0, 1.2, 0]}
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {player.role.split('_')[0].charAt(0).toUpperCase()}
          </Text3D>
        </group>
      ))}
    </group>
  );
};

export default Court3DPreview;