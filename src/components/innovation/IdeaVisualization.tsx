import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Box, Map, Plus, Sparkles } from 'lucide-react';
import SolarSystemView from './SolarSystemView';
import MindmapView from './MindmapView';
import IdeaSubmissionForm from './IdeaSubmissionForm';

export type IdeaData = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'draft' | 'submitted' | 'in-review' | 'approved' | 'rejected';
  tags: string[];
  votes: number;
  roiPotential: number;
  position?: { x: number; y: number; z: number };
  subIdeas?: IdeaData[];
  connections?: string[];
};

const IdeaVisualization = () => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [ideas, setIdeas] = useState<IdeaData[]>([]);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const handleIdeaSubmission = (formData: any) => {
    const ideaIndex = ideas.length;
    const newIdea: IdeaData = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      status: 'submitted',
      tags: formData.tags,
      votes: 0,
      roiPotential: 0, // Wird später berechnet
      position: {
        x: (ideaIndex % 3 - 1) * 2,
        y: (Math.floor(ideaIndex / 3) % 3 - 1) * 2,
        z: (Math.floor(ideaIndex / 9) % 3 - 1) * 2
      }
    };
    
    setIdeas(prev => [...prev, newIdea]);
    setShowSubmissionForm(false);
  };

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Ansichtsmodus</h3>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === '2d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('2d')}
              className="transition-all duration-300"
            >
              <Map className="h-4 w-4 mr-2" />
              2D Mindmap
            </Button>
            <Button
              variant={viewMode === '3d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('3d')}
              className="transition-all duration-300"
            >
              <Box className="h-4 w-4 mr-2" />
              3D Sonnensystem
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowSubmissionForm(true)}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neue Idee
          </Button>
          
          <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
            <Sparkles className="h-4 w-4 mr-2" />
            KI-Analyse
          </Button>
        </div>
      
        {/* Stats */}
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-cyan-50 border-cyan-200 text-cyan-700">
            {ideas.length} Ideen
          </Badge>
          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
            {ideas.filter(idea => idea.status === 'approved').length} Genehmigt
          </Badge>
          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
            {ideas.filter(idea => idea.status === 'in-review').length} In Prüfung
          </Badge>
        </div>
      </div>

      {/* Visualization Container */}
      <div className="relative w-full h-[600px] bg-gradient-to-br from-slate-900 via-blue-900 to-black rounded-lg overflow-hidden border border-gray-200 shadow-inner">
        {viewMode === '3d' ? (
          <SolarSystemView ideas={ideas} />
        ) : (
          <MindmapView ideas={ideas} />
        )}
      </div>

      {/* Controls Info */}
      <div className="flex items-center justify-center text-sm text-gray-500">
        {viewMode === '3d' ? (
          <p>🖱️ Maus: Drehen | 🔍 Scroll: Zoomen | 🖱️ Klick: Fokussieren</p>
        ) : (
          <p>🖱️ Drag & Drop zum Verschieben | 🖱️ Klick für Details</p>
        )}
      </div>
      {/* Submission Form Modal */}
      {showSubmissionForm && (
        <IdeaSubmissionForm 
          onSubmit={handleIdeaSubmission}
          onClose={() => setShowSubmissionForm(false)}
        />
      )}
    </div>
  );
};

export default IdeaVisualization;