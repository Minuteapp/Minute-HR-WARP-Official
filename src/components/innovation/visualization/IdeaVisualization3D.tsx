import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float, Trail, Stars, PointMaterial, Points, Sparkles, ContactShadows, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { RotateCw, Plus, Focus, Menu, Edit, MessageCircle, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

import * as THREE from 'three';

interface IdeaVisualization3DProps {
  centralTheme: string;
  ideas?: Array<{
    id: string;
    title: string;
    status?: string;
  }>;
}

// Prioritätsstufen für Farben und Größen
const getPriorityData = (status?: string, priority: number = 5) => {
  const priorityColors = {
    high: '#ef4444', // Rot für hohe Priorität
    medium: '#f59e0b', // Orange für mittlere Priorität
    low: '#10b981', // Grün für niedrige Priorität
  };
  
  const statusColors = {
    new: '#3b82f6',
    approved: '#10b981', 
    in_development: '#f59e0b',
    pilot_phase: '#8b5cf6',
    implemented: '#059669',
    rejected: '#6b7280'
  };
  
  const priorityLevel = priority >= 8 ? 'high' : priority >= 5 ? 'medium' : 'low';
  const size = Math.max(0.3, Math.min(0.8, priority * 0.1));
  
  return {
    color: priorityColors[priorityLevel] || statusColors[status as keyof typeof statusColors] || '#6b7280',
    size,
    priority: priorityLevel
  };
};

// Partikel-System für Ambiente
const ParticleField: React.FC = () => {
  const count = 1000;
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 100;
      temp[i * 3 + 1] = (Math.random() - 0.5) * 100;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <Points ref={particlesRef} positions={particles} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.05}
        sizeAttenuation
        opacity={0.6}
      />
    </Points>
  );
};

// Erweiterte zentrale Sonne mit dynamischen Lichteffekten
const CentralSun: React.FC<{ 
  centralTheme: string; 
  onFocus?: () => void;
  focused?: boolean;
}> = ({ centralTheme, onFocus, focused }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
    }
    
    // Dynamische Lichtintensität
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      {/* Lichtstrahlen */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 0]}
        intensity={3}
        color="#ff6b00"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Corona-Effekt */}
      <mesh scale={focused ? 1.5 : 1.2}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshStandardMaterial
          color="#ff4500"
          transparent
          opacity={0.2}
          emissive="#ff6b00"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Hauptsonne */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onDoubleClick={onFocus}
        scale={hovered || focused ? 1.1 : 1}
      >
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#ff6b00"
          emissive="#ff4500" 
          emissiveIntensity={focused ? 0.8 : 0.5}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Funkelnde Partikel um die Sonne */}
      <Sparkles count={50} scale={6} size={3} speed={0.5} color="#ffaa00" />
      
      <Text
        fontSize={focused ? 0.4 : 0.3}
        position={[0, 0, focused ? 3 : 2.5]}
        anchorX="center"
        anchorY="middle"
        color="#ffffff"
        outlineColor="#000000"
        outlineWidth={0.02}
      >
        {centralTheme}
      </Text>
    </Float>
  );
};

// Erweiterte kreisende Ideen mit Kontextmenüs und Animationen
const OrbitingIdea: React.FC<{
  idea: { id: string; title: string; status?: string; priority?: number };
  radius: number;
  speed: number;
  offset: number;
  onEdit?: () => void;
  onComment?: () => void;
  onFocus?: () => void;
  focused?: boolean;
  isAnimatingIn?: boolean;
}> = ({ idea, radius, speed, offset, onEdit, onComment, onFocus, focused, isAnimatingIn }) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const { color, size, priority } = getPriorityData(idea.status, idea.priority);

  useFrame((state) => {
    if (groupRef.current && !focused) {
      groupRef.current.rotation.y = state.clock.elapsedTime * speed + offset;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.02;
      
      // Pulsieren für hohe Priorität
      if (priority === 'high') {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
        planetRef.current.scale.setScalar(pulse);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group position={focused ? [0, 0, 0] : [radius, 0, 0]}>
        {/* Orbital-Trail */}
        <Trail 
          width={priority === 'high' ? 1 : 0.5} 
          length={priority === 'high' ? 30 : 20} 
          color={color} 
          attenuation={(t) => t * t}
        >
          <Float speed={priority === 'high' ? 4 : 3} rotationIntensity={0.3}>
            <mesh
              ref={planetRef}
              onPointerOver={() => setHovered(true)}
              onPointerOut={() => setHovered(false)}
              onDoubleClick={onFocus}
              onClick={onEdit}
              scale={hovered || focused ? 1.4 : 1}
            >
              <sphereGeometry args={[size, 32, 32]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={focused ? 0.4 : 0.2}
                roughness={0.3}
                metalness={0.8}
                envMapIntensity={1}
              />
            </mesh>
            
            {/* Glow-Effekt für hohe Priorität */}
            {priority === 'high' && (
              <mesh scale={1.5}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshStandardMaterial
                  color={color}
                  transparent
                  opacity={0.3}
                  emissive={color}
                  emissiveIntensity={0.5}
                />
              </mesh>
            )}
          </Float>
        </Trail>
        
        <Text
          fontSize={focused ? 0.2 : 0.15}
          position={[0, focused ? 1.2 : 0.8, 0]}
          anchorX="center"
          anchorY="middle"
          color="#ffffff"
          outlineColor="#000000"
          outlineWidth={0.01}
        >
          {idea.title.length > (focused ? 20 : 10) 
            ? idea.title.substring(0, focused ? 20 : 10) + '...' 
            : idea.title}
        </Text>
        
        {/* Prioritäts-Indikator */}
        <mesh position={[0, -0.8, 0]}>
          <ringGeometry args={[0.1, 0.15, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  );
};

// Kometen-Animation
const Comet: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [start] = useState(() => Math.random() * 100);

  useFrame((state) => {
    if (meshRef.current) {
      const t = (state.clock.elapsedTime + start) * 0.5;
      meshRef.current.position.x = position[0] + Math.sin(t) * 20;
      meshRef.current.position.y = position[1] + Math.cos(t) * 10;
      meshRef.current.position.z = position[2] + Math.sin(t * 0.7) * 15;
    }
  });

  return (
    <Trail width={2} length={30} color="#ffffff" attenuation={(t) => t * t}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#87ceeb"
          emissiveIntensity={0.5}
        />
      </mesh>
    </Trail>
  );
};

const EnhancedAsteroid: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <dodecahedronGeometry args={[0.1, 1]} />
      <meshStandardMaterial 
        color="#666666" 
        roughness={0.9} 
        metalness={0.1}
        envMapIntensity={0.5}
      />
    </mesh>
  );
};

export const IdeaVisualization3D: React.FC<IdeaVisualization3DProps> = ({ centralTheme, ideas = [] }) => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [focusedIdea, setFocusedIdea] = useState<string | null>(null);
  const [showComets, setShowComets] = useState(true);
  
  // Verwende echte Ideen oder erweiterte Fallback-Daten mit Prioritäten
  const displayIdeas = ideas.length > 0 ? ideas.slice(0, 8) : [
    { id: '1', title: 'KI-Innovation', status: 'new', priority: 9 },
    { id: '2', title: 'Automation', status: 'approved', priority: 7 },
    { id: '3', title: 'Digital Hub', status: 'in_development', priority: 8 },
    { id: '4', title: 'Smart Process', status: 'pilot_phase', priority: 6 },
    { id: '5', title: 'Cloud Lösung', status: 'new', priority: 5 },
    { id: '6', title: 'Blockchain', status: 'approved', priority: 9 },
    { id: '7', title: 'IoT Platform', status: 'new', priority: 4 },
    { id: '8', title: 'Data Analytics', status: 'in_development', priority: 8 }
  ];

  // Asteroiden und Kometen-Positionen generieren
  const asteroids = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => [
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 40
    ] as [number, number, number])
  , []);

  const comets = useMemo(() => 
    Array.from({ length: 3 }, (_, i) => [
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 60
    ] as [number, number, number])
  , []);

  // Tastenkombinationen
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'r':
          setFocusedIdea(null);
          setAutoRotate(true);
          break;
        case 'f':
          if (displayIdeas.length > 0) {
            const randomIdea = displayIdeas[Math.floor(Math.random() * displayIdeas.length)];
            setFocusedIdea(randomIdea.id);
          }
          break;
        case 'c':
          setShowComets(!showComets);
          break;
        case ' ':
          event.preventDefault();
          setAutoRotate(!autoRotate);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [autoRotate, showComets, displayIdeas]);

  const handleIdeaFocus = useCallback((ideaId: string) => {
    setFocusedIdea(ideaId === focusedIdea ? null : ideaId);
    setAutoRotate(false);
  }, [focusedIdea]);

  const handleEdit = useCallback((ideaId: string) => {
    console.log('Edit idea:', ideaId);
    // Hier würde die Edit-Logic implementiert werden
  }, []);

  const handleComment = useCallback((ideaId: string) => {
    console.log('Comment on idea:', ideaId);
    // Hier würde die Comment-Logic implementiert werden
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg overflow-hidden border">
      <Canvas
        camera={{ position: [0, 8, 20], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
        shadows
      >
        {/* Erweiterte Weltraum-Ambiente */}
        <color attach="background" args={['#0a0a0a']} />
        <Stars radius={120} depth={80} count={8000} factor={6} saturation={0} fade speed={1} />
        <ParticleField />
        
        {/* Erweiterte Beleuchtung */}
        <ambientLight intensity={0.1} />
        <directionalLight 
          position={[20, 20, 10]} 
          intensity={0.8} 
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Zentrale Sonne mit Fokus-Funktionalität */}
        <CentralSun 
          centralTheme={centralTheme} 
          onFocus={() => setFocusedIdea(null)}
          focused={focusedIdea === null}
        />
        
        {/* Kreisende Ideen mit erweiterten Features */}
        {displayIdeas.map((idea, index) => (
          <OrbitingIdea
            key={idea.id}
            idea={idea}
            radius={focusedIdea === idea.id ? 0 : 6 + index * 1.8}
            speed={focusedIdea === idea.id ? 0 : 0.4 - index * 0.04}
            offset={index * (Math.PI * 2) / displayIdeas.length}
            onEdit={() => handleEdit(idea.id)}
            onComment={() => handleComment(idea.id)}
            onFocus={() => handleIdeaFocus(idea.id)}
            focused={focusedIdea === idea.id}
          />
        ))}
        
        {/* Verbesserte Asteroiden */}
        {asteroids.map((position, index) => (
          <EnhancedAsteroid key={index} position={position} />
        ))}
        
        {/* Kometen-Animationen */}
        {showComets && comets.map((position, index) => (
          <Comet key={index} position={position} />
        ))}
        
        {/* Schatten-Effekte */}
        <ContactShadows 
          opacity={0.2} 
          scale={50} 
          blur={2} 
          far={50}
          resolution={256}
          color="#000000"
        />
        
        {/* Erweiterte Orbit Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={autoRotate && !focusedIdea}
          autoRotateSpeed={0.3}
          minDistance={focusedIdea ? 3 : 10}
          maxDistance={60}
          dampingFactor={0.05}
          enableDamping
          target={focusedIdea ? [0, 0, 0] : undefined}
        />
      </Canvas>

      {/* Erweiterte UI Overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="text-white/70 hover:text-white bg-black/20 backdrop-blur-sm"
          onClick={() => setAutoRotate(!autoRotate)}
          title="Auto-Rotation (Leertaste)"
        >
          <RotateCw className={`w-5 h-5 ${autoRotate ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-white/70 hover:text-white bg-black/20 backdrop-blur-sm"
          onClick={() => setFocusedIdea(null)}
          title="Ansicht zurücksetzen (R)"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-white/70 hover:text-white bg-black/20 backdrop-blur-sm"
          onClick={() => setShowComets(!showComets)}
          title="Kometen ein/aus (C)"
        >
          <Focus className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          className="rounded-full shadow-lg bg-primary text-primary-foreground"
          title="Neue Idee hinzufügen"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Erweiterte Anweisungen */}
      <div className="absolute top-4 left-4 text-white/80 text-sm bg-black/20 backdrop-blur-sm rounded-lg p-3">
        <p className="flex items-center gap-2">🌌 3D Sonnensystem</p>
        <p className="flex items-center gap-2">🖱️ Doppelklick: Fokussieren</p>
        <p className="flex items-center gap-2">🖱️ Rechtsklick: Kontextmenü</p>
        <p className="flex items-center gap-2">⌨️ R: Reset, F: Zufällig, Space: Rotation</p>
      </div>

      {/* Erweiterte Legende */}
      <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg p-3 text-white/80 text-xs">
        <h4 className="font-bold mb-2">Prioritäts-System:</h4>
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Hohe Priorität (8+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Mittlere Priorität (5-7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Niedrige Priorität (1-4)</span>
          </div>
        </div>
        <h4 className="font-bold mb-2">Status:</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Neu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Pilot Phase</span>
          </div>
        </div>
      </div>

      {/* Fokus-Indikator */}
      {focusedIdea && (
        <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm rounded-lg p-3 text-white">
          <p className="text-sm font-semibold">Fokus-Modus aktiv</p>
          <p className="text-xs text-white/70">
            Idee: {displayIdeas.find(i => i.id === focusedIdea)?.title}
          </p>
        </div>
      )}
    </div>
  );
};