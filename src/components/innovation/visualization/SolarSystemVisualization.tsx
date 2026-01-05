import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { Vector3, Color } from 'three';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Settings,
  Eye,
  EyeOff,
  Lightbulb,
  Brain,
  Star
} from 'lucide-react';

interface Idea {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status?: string;
  ai_score?: number;
  subIdeas?: SubIdea[];
  position?: { angle: number; distance: number };
}

interface SubIdea {
  id: string;
  title: string;
  parentId: string;
  position?: { angle: number; distance: number };
}

interface SolarSystemVisualizationProps {
  centralTheme: string;
  ideas: Idea[];
  onIdeaClick?: (idea: Idea) => void;
  onAddIdea?: () => void;
}

// Zentrale Sonne Komponente
const CentralSun: React.FC<{ theme: string; onClick?: () => void }> = ({ theme, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      // Sanfter Pulseffekt
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group onClick={onClick}>
      <Sphere ref={meshRef} args={[1.5, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#06B6D4" 
          emissive="#06B6D4"
          emissiveIntensity={0.3}
          transparent
          opacity={0.9}
        />
      </Sphere>
      {/* Glüheffekt */}
      <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial 
          color="#06B6D4" 
          transparent 
          opacity={0.1}
        />
      </Sphere>
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={8}
      >
        {theme}
      </Text>
    </group>
  );
};

// Ideen-Planet Komponente
const IdeaPlanet: React.FC<{ 
  idea: Idea; 
  angle: number; 
  distance: number; 
  onClick?: (idea: Idea) => void;
  isSelected?: boolean;
}> = ({ idea, angle, distance, onClick, isSelected }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Orbit um die Sonne
      const orbitSpeed = 0.002;
      const currentAngle = angle + state.clock.elapsedTime * orbitSpeed;
      meshRef.current.position.x = Math.cos(currentAngle) * distance;
      meshRef.current.position.z = Math.sin(currentAngle) * distance;
      
      // Eigenrotation
      meshRef.current.rotation.y += 0.01;
      
      // Hover-Effekt
      if (hovered) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
        meshRef.current.scale.setScalar(scale);
      } else {
        meshRef.current.scale.setScalar(isSelected ? 1.2 : 1);
      }
    }
  });

  const getIdeaColor = (status?: string) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'in_development': return '#F59E0B';
      case 'implemented': return '#06B6D4';
      case 'rejected': return '#EF4444';
      default: return '#FFFFFF';
    }
  };

  // Orbit-Linie
  const orbitPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(new Vector3(
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance
      ));
    }
    return points;
  }, [distance]);

  return (
    <group>
      {/* Orbit-Linie */}
      <Line
        points={orbitPoints}
        color="#374151"
        lineWidth={1}
        transparent
        opacity={0.3}
      />
      
      {/* Verbindungslinie zur Sonne */}
      <Line
        points={[new Vector3(0, 0, 0), new Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance)]}
        color="#6B7280"
        lineWidth={2}
        transparent
        opacity={0.5}
      />
      
      {/* Planet */}
      <Sphere 
        ref={meshRef} 
        args={[0.3, 16, 16]} 
        position={[Math.cos(angle) * distance, 0, Math.sin(angle) * distance]}
        onClick={() => onClick?.(idea)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={getIdeaColor(idea.status)}
          emissive={getIdeaColor(idea.status)}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </Sphere>
      
      {/* Ideen-Titel */}
      <Text
        position={[Math.cos(angle) * distance, -0.8, Math.sin(angle) * distance]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
      >
        {idea.title}
      </Text>
      
      {/* KI-Score */}
      {idea.ai_score && (
        <Text
          position={[Math.cos(angle) * distance, 0.6, Math.sin(angle) * distance]}
          fontSize={0.12}
          color="#F59E0B"
          anchorX="center"
          anchorY="middle"
        >
          AI: {idea.ai_score}/10
        </Text>
      )}
    </group>
  );
};

// Unterideen-Monde Komponente
const SubIdeaMoon: React.FC<{
  subIdea: SubIdea;
  parentPosition: Vector3;
  angle: number;
  distance: number;
}> = ({ subIdea, parentPosition, angle, distance }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const orbitSpeed = 0.01;
      const currentAngle = angle + state.clock.elapsedTime * orbitSpeed;
      meshRef.current.position.x = parentPosition.x + Math.cos(currentAngle) * distance;
      meshRef.current.position.y = parentPosition.y;
      meshRef.current.position.z = parentPosition.z + Math.sin(currentAngle) * distance;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[0.1, 8, 8]}>
        <meshStandardMaterial color="#D1D5DB" />
      </Sphere>
      <Text
        position={[parentPosition.x + Math.cos(angle) * distance, parentPosition.y - 0.4, parentPosition.z + Math.sin(angle) * distance]}
        fontSize={0.08}
        color="#9CA3AF"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.5}
      >
        {subIdea.title}
      </Text>
    </group>
  );
};

// Partikel-System für Hintergrund
const StarField: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    
    return positions;
  }, []);
  
  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        color="white" 
        size={0.1} 
        transparent 
        opacity={0.6}
      />
    </points>
  );
};

// 3D-Szene Komponente
const Scene3D: React.FC<{
  centralTheme: string;
  ideas: Idea[];
  selectedIdea?: Idea;
  onIdeaClick?: (idea: Idea) => void;
}> = ({ centralTheme, ideas, selectedIdea, onIdeaClick }) => {
  return (
    <>
      {/* Beleuchtung */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 0, 0]} intensity={1} color="#06B6D4" />
      
      {/* Sternenfeld */}
      <StarField />
      
      {/* Zentrale Sonne */}
      <CentralSun theme={centralTheme} />
      
      {/* Ideen als Planeten */}
      {ideas.map((idea, index) => {
        const distance = 4 + index * 1.5;
        const angle = (index / ideas.length) * Math.PI * 2;
        
        return (
          <IdeaPlanet
            key={idea.id}
            idea={idea}
            angle={angle}
            distance={distance}
            onClick={onIdeaClick}
            isSelected={selectedIdea?.id === idea.id}
          />
        );
      })}
      
      {/* Kamera-Kontrollen */}
      <OrbitControls 
        enablePan 
        enableZoom 
        enableRotate
        minDistance={5}
        maxDistance={30}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

// Haupt-Komponente
export const SolarSystemVisualization: React.FC<SolarSystemVisualizationProps> = ({
  centralTheme,
  ideas,
  onIdeaClick,
  onAddIdea
}) => {
  const [selectedIdea, setSelectedIdea] = useState<Idea | undefined>();
  const [showControls, setShowControls] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);

  const handleIdeaClick = (idea: Idea) => {
    setSelectedIdea(idea);
    onIdeaClick?.(idea);
  };

  return (
    <div className="relative w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [10, 5, 10], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #0F172A, #1E293B)' }}
      >
        <Scene3D
          centralTheme={centralTheme}
          ideas={ideas}
          selectedIdea={selectedIdea}
          onIdeaClick={handleIdeaClick}
        />
      </Canvas>

      {/* Steuerung */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4"
        >
          <Card className="p-4 bg-black/70 backdrop-blur-sm border-gray-700">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRotate(!autoRotate)}
                  className="bg-transparent border-gray-600 text-white hover:bg-gray-800"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Auto-Rotation
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddIdea}
                  className="bg-transparent border-gray-600 text-white hover:bg-gray-800"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Idee hinzufügen
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                  <Star className="w-3 h-3 mr-1" />
                  {ideas.length} Ideen
                </Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowControls(!showControls)}
                  className="text-gray-400 hover:text-white"
                >
                  {showControls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Anweisungen */}
            <div className="mt-3 text-sm text-gray-400">
              <p>🖱️ <strong>Maus ziehen:</strong> Ansicht drehen | 🖱️ <strong>Scrollrad:</strong> Zoomen | 👆 <strong>Klick:</strong> Idee auswählen</p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Ideen-Details Panel */}
      {selectedIdea && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="absolute top-4 right-4 w-80"
        >
          <Card className="p-4 bg-black/80 backdrop-blur-sm border-gray-700 text-white">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-lg">{selectedIdea.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIdea(undefined)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
            
            {selectedIdea.description && (
              <p className="text-gray-300 text-sm mb-3">{selectedIdea.description}</p>
            )}
            
            <div className="flex items-center gap-2 mb-3">
              {selectedIdea.status && (
                <Badge variant="secondary" className="bg-gray-800">
                  {selectedIdea.status}
                </Badge>
              )}
              {selectedIdea.ai_score && (
                <Badge variant="secondary" className="bg-blue-900 text-blue-200">
                  <Brain className="w-3 h-3 mr-1" />
                  KI-Score: {selectedIdea.ai_score}/10
                </Badge>
              )}
            </div>

            <Button
              className="w-full bg-cyan-600 hover:bg-cyan-700"
              onClick={() => console.log('Open idea details')}
            >
              Details anzeigen
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Toggle für Controls */}
      {!showControls && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowControls(true)}
          className="absolute bottom-4 right-4 bg-black/50 text-white hover:bg-black/70"
        >
          <Settings className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};