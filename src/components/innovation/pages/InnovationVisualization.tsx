import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Box, RotateCw, ZoomIn, ZoomOut, Maximize, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IdeaVisualization2D } from '../visualization/IdeaVisualization2D';
import { IdeaVisualization3D } from '../visualization/IdeaVisualization3D';

export const InnovationVisualization: React.FC = () => {
  const [is3D, setIs3D] = useState(false);
  const [centralTheme, setCentralTheme] = useState('KI-Innovation');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Ideen-Visualisierung
          </h1>
          <p className="text-white/70 text-lg">
            Visualisiere deine Ideen in 2D oder 3D und erkunde Verbindungen.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-white" />
            <span className="text-white text-sm">2D</span>
            <Switch
              checked={is3D}
              onCheckedChange={setIs3D}
              className="data-[state=checked]:bg-[hsl(var(--innovation-neon-turquoise))]"
            />
            <span className="text-white text-sm">3D</span>
            <RotateCw className="w-5 h-5 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Visualization Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="h-[600px]"
      >
        <Card className="h-full bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden">
          <motion.div
            key={is3D ? '3d' : '2d'} // Force re-render when switching
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {is3D ? (
              <IdeaVisualization3D centralTheme={centralTheme} />
            ) : (
              <IdeaVisualization2D centralTheme={centralTheme} />
            )}
          </motion.div>
        </Card>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Steuerung & Einstellungen</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="ghost"
                className="h-16 flex-col gap-2 text-white hover:bg-white/10"
              >
                <ZoomIn className="w-5 h-5" />
                <span className="text-sm">Zoom In</span>
              </Button>
              <Button
                variant="ghost"
                className="h-16 flex-col gap-2 text-white hover:bg-white/10"
              >
                <ZoomOut className="w-5 h-5" />
                <span className="text-sm">Zoom Out</span>
              </Button>
              <Button
                variant="ghost"
                className="h-16 flex-col gap-2 text-white hover:bg-white/10"
              >
                <Maximize className="w-5 h-5" />
                <span className="text-sm">Vollbild</span>
              </Button>
              <Button
                variant="ghost"
                className="h-16 flex-col gap-2 text-white hover:bg-white/10"
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm">Einstellungen</span>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};