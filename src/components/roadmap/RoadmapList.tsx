
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Target, Users, MoreHorizontal, Edit, Eye, Trash2 } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { EditRoadmapDialog } from './EditRoadmapDialog';

interface RoadmapListProps {
  onSelectRoadmap: (roadmapId: string) => void;
}

export const RoadmapList = ({ onSelectRoadmap }: RoadmapListProps) => {
  const { roadmaps, isLoading, deleteRoadmap } = useRoadmaps();
  const [editingRoadmap, setEditingRoadmap] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'draft': return 'Entwurf';
      case 'archived': return 'Archiviert';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Roadmaps gefunden</h3>
          <p className="text-gray-500">Erstellen Sie Ihre erste Roadmap, um loszulegen.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roadmaps.map((roadmap) => (
        <Card key={roadmap.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold mb-2">
                  {roadmap.title}
                </CardTitle>
                {roadmap.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {roadmap.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(roadmap.status)}>
                  {getStatusLabel(roadmap.status)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {roadmap.vision && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Vision</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{roadmap.vision}</p>
                </div>
              )}

              {roadmap.mission && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mission</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{roadmap.mission}</p>
                </div>
              )}

              {(roadmap.start_date || roadmap.end_date) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {roadmap.start_date && new Date(roadmap.start_date).toLocaleDateString('de-DE')}
                    {roadmap.start_date && roadmap.end_date && ' - '}
                    {roadmap.end_date && new Date(roadmap.end_date).toLocaleDateString('de-DE')}
                  </span>
                </div>
              )}

              {roadmap.strategic_objectives && roadmap.strategic_objectives.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="h-4 w-4" />
                  <span>{roadmap.strategic_objectives.length} strategische Ziele</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Erstellt am {new Date(roadmap.created_at).toLocaleDateString('de-DE')}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onSelectRoadmap(roadmap.id)}
                >
                  Visuelle Planung
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSelectRoadmap(roadmap.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Anzeigen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditingRoadmap(roadmap)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteRoadmap.mutate(roadmap.id)} 
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {editingRoadmap && (
        <EditRoadmapDialog 
          roadmap={editingRoadmap}
          open={!!editingRoadmap}
          onOpenChange={(open) => !open && setEditingRoadmap(null)}
        />
      )}
    </div>
  );
};
