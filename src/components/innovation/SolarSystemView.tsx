import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { IdeaData } from './IdeaVisualization';

interface IdeaSphereProps {
  idea: IdeaData;
  onClick: (idea: IdeaData) => void;
  isSelected: boolean;
}

const IdeaSphere: React.FC<IdeaSphereProps> = ({ idea, onClick, isSelected }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !isSelected) {
      meshRef.current.rotation.y += 0.01;
      // Orbital motion around center
      const time = state.clock.elapsedTime;
      const radius = Math.sqrt(idea.position!.x ** 2 + idea.position!.z ** 2);
      meshRef.current.position.x = Math.cos(time * 0.2) * radius;
      meshRef.current.position.z = Math.sin(time * 0.2) * radius;
    }
  });

  const getColorByPriority = (priority: string) => {
    switch (priority) {
      case 'high': return '#10B981'; // Emerald
      case 'medium': return '#F59E0B'; // Amber
      case 'low': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  const getSizeByROI = (roi: number) => {
    return Math.max(0.3, Math.min(1.2, roi / 50000));
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[idea.position!.x, idea.position!.y, idea.position!.z]}
        onClick={() => onClick(idea)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={isSelected ? 1.5 : hovered ? 1.2 : 1}
      >
        <sphereGeometry args={[getSizeByROI(idea.roiPotential), 32, 32]} />
        <meshPhongMaterial 
          color={getColorByPriority(idea.priority)}
          emissive={isSelected ? 0x444444 : 0x111111}
          transparent
          opacity={isSelected ? 1 : 0.8}
        />
        
        {/* Glow effect */}
        <mesh scale={[1.1, 1.1, 1.1]}>
          <sphereGeometry args={[getSizeByROI(idea.roiPotential), 32, 32]} />
          <meshBasicMaterial 
            color={getColorByPriority(idea.priority)}
            transparent
            opacity={0.2}
          />
        </mesh>
      </mesh>

      {/* Text label */}
      {(hovered || isSelected) && (
        <Html position={[idea.position!.x, idea.position!.y + 1, idea.position!.z]}>
          <div className="bg-black/80 text-white px-2 py-1 rounded text-xs max-w-32 text-center">
            <div className="font-semibold">{idea.title}</div>
            <div className="text-xs opacity-75">€{idea.roiPotential.toLocaleString()}</div>
            <div className="text-xs opacity-75">{idea.votes} Stimmen</div>
          </div>
        </Html>
      )}

      {/* Sub-ideas as moons */}
      {idea.subIdeas?.map((subIdea, index) => (
        <SubIdeaMoon 
          key={subIdea.id} 
          subIdea={subIdea} 
          parentPosition={[idea.position!.x, idea.position!.y, idea.position!.z]}
          orbitRadius={1.5}
          orbitSpeed={0.5 + index * 0.2}
        />
      ))}
    </group>
  );
};

interface SubIdeaMoonProps {
  subIdea: IdeaData;
  parentPosition: [number, number, number];
  orbitRadius: number;
  orbitSpeed: number;
}

const SubIdeaMoon: React.FC<SubIdeaMoonProps> = ({ 
  subIdea, 
  parentPosition, 
  orbitRadius, 
  orbitSpeed 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.x = parentPosition[0] + Math.cos(time * orbitSpeed) * orbitRadius;
      meshRef.current.position.y = parentPosition[1] + Math.sin(time * orbitSpeed * 0.5) * 0.5;
      meshRef.current.position.z = parentPosition[2] + Math.sin(time * orbitSpeed) * orbitRadius;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshPhongMaterial color="#D1D5DB" />
    </mesh>
  );
};

const CentralSun = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshPhongMaterial 
          color="#06B6D4" 
          emissive="#06B6D4"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Glow effect */}
      <mesh scale={[1.3, 1.3, 1.3]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial 
          color="#06B6D4"
          transparent
          opacity={0.1}
        />
      </mesh>

      <Text
        position={[0, -2.5, 0]}
        fontSize={0.5}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        Innovation Hub
      </Text>
    </group>
  );
};

interface SolarSystemViewProps {
  ideas: IdeaData[];
}

const SolarSystemView: React.FC<SolarSystemViewProps> = ({ ideas }) => {
  const [selectedIdea, setSelectedIdea] = useState<IdeaData | null>(null);

  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={1} color="#06B6D4" />
        <pointLight position={[10, 10, 10]} intensity={0.5} />

        {/* Space background */}
        <Stars 
          radius={100} 
          depth={50} 
          count={1000} 
          factor={4} 
          saturation={0} 
          fade 
        />

        {/* Central Sun */}
        <CentralSun />

        {/* Idea spheres */}
        {ideas.map((idea) => (
          <IdeaSphere
            key={idea.id}
            idea={idea}
            onClick={setSelectedIdea}
            isSelected={selectedIdea?.id === idea.id}
          />
        ))}

        {/* Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
        />
      </Suspense>

      {/* Selected idea details */}
      {selectedIdea && (
        <Html position={[8, 8, 0]}>
          <div className="bg-black/90 text-white p-4 rounded-lg max-w-64 border border-cyan-500">
            <h3 className="font-bold text-cyan-400 mb-2">{selectedIdea.title}</h3>
            <p className="text-sm mb-2">{selectedIdea.description}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedIdea.tags.map(tag => (
                <span key={tag} className="bg-cyan-600 px-2 py-1 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-xs space-y-1">
              <div>Priorität: <span className="font-semibold">{selectedIdea.priority}</span></div>
              <div>Status: <span className="font-semibold">{selectedIdea.status}</span></div>
              <div>ROI: <span className="font-semibold">€{selectedIdea.roiPotential.toLocaleString()}</span></div>
              <div>Stimmen: <span className="font-semibold">{selectedIdea.votes}</span></div>
            </div>
            <button 
              onClick={() => setSelectedIdea(null)}
              className="mt-2 bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded text-xs"
            >
              Schließen
            </button>
          </div>
        </Html>
      )}
    </Canvas>
  );
};

export default SolarSystemView;