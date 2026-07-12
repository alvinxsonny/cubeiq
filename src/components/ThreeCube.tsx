import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { CubeState, CubeColor, FaceName } from '@/lib/cubeState';

interface ThreeCubeProps {
  cubeState: CubeState;
  currentMove: string | null;
  onMoveComplete: () => void;
  animationSpeed: number; // 0.5 to 8
  onStickerClick?: (face: FaceName, index: number) => void;
  isEditMode?: boolean;
  className?: string;
}

// Maps CubeColor to hex colors
const COLOR_HEX: Record<CubeColor, string> = {
  white: '#F5F5F5',
  yellow: '#FFD600',
  green: '#43A047',
  blue: '#2962FF',
  red: '#E53935',
  orange: '#FB8C00',
};

// Map moves to axes, filters, and angles
interface MoveConfig {
  axis: 'x' | 'y' | 'z';
  filter: (x: number, y: number, z: number) => boolean;
  angle: number;
}

function getMoveConfig(move: string): MoveConfig {
  const base = move[0] as FaceName;
  const isPrime = move.includes("'");
  const isDouble = move.includes('2');

  let axis: 'x' | 'y' | 'z' = 'y';
  let filter = (x: number, y: number, z: number) => false;
  let baseAngle = -Math.PI / 2; // Default CCW looking at the face

  switch (base) {
    case 'U':
      axis = 'y';
      filter = (x, y, z) => y > 0.5;
      baseAngle = -Math.PI / 2;
      break;
    case 'D':
      axis = 'y';
      filter = (x, y, z) => y < -0.5;
      baseAngle = Math.PI / 2;
      break;
    case 'R':
      axis = 'x';
      filter = (x, y, z) => x > 0.5;
      baseAngle = -Math.PI / 2;
      break;
    case 'L':
      axis = 'x';
      filter = (x, y, z) => x < -0.5;
      baseAngle = Math.PI / 2;
      break;
    case 'F':
      axis = 'z';
      filter = (x, y, z) => z > 0.5;
      baseAngle = -Math.PI / 2;
      break;
    case 'B':
      axis = 'z';
      filter = (x, y, z) => z < -0.5;
      baseAngle = Math.PI / 2;
      break;
  }

  let multiplier = 1;
  if (isPrime) multiplier = -1;
  if (isDouble) multiplier = 2;

  return {
    axis,
    filter,
    angle: baseAngle * multiplier,
  };
}

// Subcomponent representing the 27 cubies
interface RubiksCubeGroupProps {
  cubeState: CubeState;
  currentMove: string | null;
  onMoveComplete: () => void;
  animationSpeed: number;
  onStickerClick?: (face: FaceName, index: number) => void;
  isEditMode: boolean;
}

function RubiksCubeGroup({
  cubeState,
  currentMove,
  onMoveComplete,
  animationSpeed,
  onStickerClick,
  isEditMode,
}: RubiksCubeGroupProps) {
  const [activeMove, setActiveMove] = useState<{
    axis: 'x' | 'y' | 'z';
    filter: (x: number, y: number, z: number) => boolean;
    targetAngle: number;
    currentAngle: number;
    elapsed: number;
    duration: number;
  } | null>(null);

  const activeMoveRef = useRef(activeMove);
  activeMoveRef.current = activeMove;

  const processedMoveRef = useRef<string | null>(null);

  // Handle new move requests
  useEffect(() => {
    if (currentMove && currentMove !== processedMoveRef.current && !activeMove) {
      processedMoveRef.current = currentMove;
      const config = getMoveConfig(currentMove);
      const speed = 6 * animationSpeed;
      const duration = Math.abs(config.angle) / speed;
      setActiveMove({
        axis: config.axis,
        filter: config.filter,
        targetAngle: config.angle,
        currentAngle: 0,
        elapsed: 0,
        duration: duration > 0 ? duration : 0.05,
      });
    } else if (!currentMove) {
      processedMoveRef.current = null;
    }
  }, [currentMove, activeMove, animationSpeed]);

  // Frame loop for turns
  useFrame((state, delta) => {
    if (activeMoveRef.current) {
      const move = { ...activeMoveRef.current };
      move.elapsed += delta;

      let progress = move.elapsed / move.duration;
      if (progress >= 1) {
        progress = 1;
      }

      // Cosine ease-in-out interpolation for fluid, organic turns
      const easedProgress = (1 - Math.cos(progress * Math.PI)) / 2;
      const currentAngle = easedProgress * move.targetAngle;

      if (progress >= 1) {
        setActiveMove(null);
        // Timeout to let parent update logic colors and clear currentMove
        setTimeout(() => {
          onMoveComplete();
        }, 20);
      } else {
        setActiveMove({
          ...move,
          currentAngle,
        });
      }
    }
  });

  // Calculate facelet index mappings
  const getStickerColorAndIndex = (
    x: number,
    y: number,
    z: number,
    face: FaceName
  ): { color: CubeColor; index: number } | null => {
    let index = -1;

    switch (face) {
      case 'U':
        if (y > 0.5) {
          index = (Math.round(z) + 1) * 3 + (Math.round(x) + 1);
        }
        break;
      case 'D':
        if (y < -0.5) {
          index = (1 - Math.round(z)) * 3 + (Math.round(x) + 1);
        }
        break;
      case 'F':
        if (z > 0.5) {
          index = (1 - Math.round(y)) * 3 + (Math.round(x) + 1);
        }
        break;
      case 'B':
        if (z < -0.5) {
          index = (1 - Math.round(y)) * 3 + (1 - Math.round(x));
        }
        break;
      case 'L':
        if (x < -0.5) {
          index = (1 - Math.round(y)) * 3 + (Math.round(z) + 1);
        }
        break;
      case 'R':
        if (x > 0.5) {
          index = (1 - Math.round(y)) * 3 + (1 - Math.round(z));
        }
        break;
    }

    if (index >= 0 && index < 9) {
      return { color: cubeState[face][index], index };
    }
    return null;
  };

  // Helper to render a sticker mesh
  const renderSticker = (
    cx: number,
    cy: number,
    cz: number,
    face: FaceName,
    rotation: [number, number, number],
    positionOffset: [number, number, number]
  ) => {
    const data = getStickerColorAndIndex(cx, cy, cz, face);
    if (!data) return null;

    const hexColor = COLOR_HEX[data.color];

    const handleClick = (e: any) => {
      e.stopPropagation();
      if (isEditMode && onStickerClick) {
        onStickerClick(face, data.index);
      }
    };

    return (
      <mesh
        position={positionOffset}
        rotation={rotation}
        onClick={handleClick}
      >
        {/* Rounded sticker using thin RoundedBox */}
        <RoundedBox
          args={[0.82, 0.82, 0.015]}
          radius={0.06}
          smoothness={3}
        >
          <meshStandardMaterial
            color={hexColor}
            roughness={0.15}
            metalness={0.05}
            envMapIntensity={1}
          />
        </RoundedBox>
      </mesh>
    );
  };

  // Build the 27 cubies
  const cubies: React.ReactNode[] = [];

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        // Core doesn't need to be rendered
        if (x === 0 && y === 0 && z === 0) continue;

        // Apply rotation if this cubie is in the active turning layer
        let rx = 0;
        let ry = 0;
        let rz = 0;
        let pos: [number, number, number] = [x, y, z];

        if (activeMove && activeMove.filter(x, y, z)) {
          const angle = activeMove.currentAngle;
          if (activeMove.axis === 'x') {
            rx = angle;
            // Rotate position vector around X-axis
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            pos = [x, y * cos - z * sin, y * sin + z * cos];
          } else if (activeMove.axis === 'y') {
            ry = angle;
            // Rotate position vector around Y-axis
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            pos = [x * cos + z * sin, y, -x * sin + z * cos];
          } else if (activeMove.axis === 'z') {
            rz = angle;
            // Rotate position vector around Z-axis
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            pos = [x * cos - y * sin, x * sin + y * cos, z];
          }
        }

        cubies.push(
          <group
            key={`cubie-${x}-${y}-${z}`}
            position={pos}
            rotation={[rx, ry, rz]}
          >
            {/* Main black plastic cubie body */}
            <RoundedBox
              args={[0.96, 0.96, 0.96]}
              radius={0.04}
              smoothness={2}
            >
              <meshStandardMaterial
                color="#121212"
                roughness={0.5}
                metalness={0.2}
              />
            </RoundedBox>

            {/* Stickers on outer faces */}
            {y === 1 && renderSticker(x, y, z, 'U', [Math.PI / 2, 0, 0], [0, 0.485, 0])}
            {y === -1 && renderSticker(x, y, z, 'D', [-Math.PI / 2, 0, 0], [0, -0.485, 0])}
            {x === -1 && renderSticker(x, y, z, 'L', [0, -Math.PI / 2, 0], [-0.485, 0, 0])}
            {x === 1 && renderSticker(x, y, z, 'R', [0, Math.PI / 2, 0], [0.485, 0, 0])}
            {z === 1 && renderSticker(x, y, z, 'F', [0, 0, 0], [0, 0, 0.485])}
            {z === -1 && renderSticker(x, y, z, 'B', [0, Math.PI, 0], [0, 0, -0.485])}
          </group>
        );
      }
    }
  }

  return <group>{cubies}</group>;
}

export default function ThreeCube({
  cubeState,
  currentMove,
  onMoveComplete,
  animationSpeed,
  onStickerClick,
  isEditMode = false,
  className = "w-full h-[400px] md:h-[500px] relative rounded-3xl overflow-hidden bg-charcoal/5 border border-borders/50 glass-card",
}: ThreeCubeProps) {
  const [autoRotate, setAutoRotate] = useState(true);

  // Stop auto-rotating once user triggers a cube move
  useEffect(() => {
    if (currentMove) {
      setAutoRotate(false);
    }
  }, [currentMove]);

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [4, 4, 6], fov: 48 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.2} />
        
        {/* Soft studio lights */}
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.6} />
        <directionalLight position={[0, -5, 0]} intensity={0.4} />

        <RubiksCubeGroup
          cubeState={cubeState}
          currentMove={currentMove}
          onMoveComplete={onMoveComplete}
          animationSpeed={animationSpeed}
          onStickerClick={onStickerClick}
          isEditMode={isEditMode}
        />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={3.5}
          maxDistance={12}
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={1.0}
          onStart={() => setAutoRotate(false)}
        />
      </Canvas>

      {/* Floating UX hint */}
      <div className="absolute bottom-3 right-3 px-3 py-1 bg-charcoal/85 backdrop-blur-md rounded-full border border-white/10 pointer-events-none select-none shadow-sm">
        <span className="text-[8px] text-white/80 font-geist tracking-wider uppercase font-semibold">
          {isEditMode ? 'Edit Mode • Drag to rotate' : 'Drag to rotate • Scroll to zoom'}
        </span>
      </div>
    </div>
  );
}
