import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, Move, Search, Filter, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useInnovationData } from '@/hooks/useInnovationData';

interface IdeaVisualization2DProps {
  centralTheme: string;
}

export const IdeaVisualization2D: React.FC<IdeaVisualization2DProps> = ({ centralTheme }) => {
  const { ideas, loading } = useInnovationData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [hoveredIdea, setHoveredIdea] = useState<string | null>(null);

  // Filter and process ideas for visualization
  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.description && idea.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || idea.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Position ideas in a network layout with categories as clusters
  const categories = [...new Set(filteredIdeas.map(idea => idea.category).filter(Boolean))];
  const categoryPositions = categories.reduce((acc, category, index) => {
    const angle = (index / categories.length) * 2 * Math.PI;
    const radius = 200;
    acc[category] = {
      x: 400 + Math.cos(angle) * radius,
      y: 300 + Math.sin(angle) * radius
    };
    return acc;
  }, {} as Record<string, { x: number; y: number }>);

  const displayIdeas = filteredIdeas.slice(0, 20).map((idea, index) => {
    const categoryPos = categoryPositions[idea.category || 'other'] || { x: 400, y: 300 };
    const offset = 80;
    const categoryIdeas = filteredIdeas.filter(i => i.category === idea.category);
    const ideaIndex = categoryIdeas.indexOf(idea);
    const angleOffset = (ideaIndex / Math.max(categoryIdeas.length, 1)) * 2 * Math.PI;
    
    // Deterministische Position basierend auf Index statt Math.random()
    const xOffset = ((index % 5) - 2) * 10;
    const yOffset = ((index % 3) - 1) * 10;
    
    return {
      ...idea,
      x: categoryPos.x + Math.cos(angleOffset) * offset + xOffset,
      y: categoryPos.y + Math.sin(angleOffset) * offset + yOffset,
      color: getStatusColor(idea.status || 'new'),
      size: Math.max(60, Math.min(100, (idea.impact_score || 5) * 12))
    };
  });

  function getStatusColor(status: string) {
    const colors = {
      new: '#3b82f6',
      under_review: '#f59e0b', 
      approved: '#10b981',
      in_development: '#8b5cf6',
      implemented: '#059669',
      rejected: '#ef4444',
      pilot_phase: '#06b6d4'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  }

  const uniqueCategories = [...new Set(ideas.map(idea => idea.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background to-muted rounded-lg overflow-hidden border">
      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ideen suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-background/80 backdrop-blur-sm"
            />
          </div>
          <div className="flex gap-1">
            {uniqueCategories.slice(0, 5).map((category) => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className="bg-background/80 backdrop-blur-sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
          {displayIdeas.length} Ideen
        </Badge>
      </div>

      {/* Central Theme */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <div className="w-40 h-40 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-full flex items-center justify-center shadow-2xl border-4 border-background relative">
          <Target className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-pulse" />
          <span className="text-primary-foreground font-bold text-center text-sm px-2">{centralTheme}</span>
        </div>
      </motion.div>

      {/* Verbindungslinien zu Ideen */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {displayIdeas.map((idea) => (
          <motion.line
            key={`line-${idea.id}`}
            x1="50%"
            y1="50%"
            x2={`${idea.x}px`}
            y2={`${idea.y}px`}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1"
            strokeOpacity="0.3"
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        ))}
      </svg>

      {/* Ideen-Nodes */}
      {displayIdeas.map((idea, index) => (
        <motion.div
          key={idea.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 * index, duration: 0.3 }}
          className="absolute w-20 h-20 bg-card backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-border"
          style={{ 
            left: `${idea.x}px`, 
            top: `${idea.y}px`,
            backgroundColor: `${idea.color}20`,
            borderColor: idea.color
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="text-center">
            <div className="text-xs font-bold text-foreground leading-tight">
              {idea.title.length > 12 ? idea.title.substring(0, 12) + '...' : idea.title}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{idea.category || idea.status}</div>
          </div>
          
          {/* Status Indicator */}
          <div 
            className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-background"
            style={{ backgroundColor: idea.color }}
          />
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
            <div className="bg-popover text-popover-foreground px-2 py-1 rounded-md shadow-lg text-xs whitespace-nowrap border">
              {idea.title}
              {idea.status && (
                <div className="text-xs text-muted-foreground">
                  Status: {idea.status}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Add Idea Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 right-4"
      >
        <Button
          size="icon"
          className="rounded-full shadow-lg"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 text-muted-foreground text-sm">
        <p>💡 Klicke auf Ideen für Details</p>
        <p>🖱️ Ziehe Ideen zum Verschieben</p>
      </div>
    </div>
  );
};