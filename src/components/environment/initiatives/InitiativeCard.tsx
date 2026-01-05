
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Calendar, Users, Pin, PinOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Initiative {
  id: string;
  title: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
  progress: number;
  responsible?: string;
  budget?: number;
  tags?: string[];
}

interface InitiativeCardProps {
  initiative: Initiative;
  onCardClick: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
}

export const InitiativeCard: React.FC<InitiativeCardProps> = ({
  initiative,
  onCardClick,
  isPinned,
  onTogglePin
}) => {
  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in-progress':
      case 'in_progress':
      case 'inprogress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'planned':
        return 'bg-amber-100 text-amber-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow relative">
      <div className="absolute top-2 right-2 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          title={isPinned ? "Lösen" : "Anheften"}
        >
          {isPinned ? 
            <PinOff className="h-4 w-4 text-gray-500" /> : 
            <Pin className="h-4 w-4 text-gray-500" />
          }
        </Button>
      </div>
      
      <div onClick={onCardClick} className="cursor-pointer h-full flex flex-col">
        <CardHeader className={cn(
          "p-4 border-b space-y-1",
          isPinned ? "bg-blue-50" : "bg-white"
        )}>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={cn("font-normal", getStatusColor(initiative.status))}>
              {initiative.status === 'in-progress' ? 'In Bearbeitung' : 
               initiative.status === 'completed' ? 'Abgeschlossen' :
               initiative.status === 'planned' ? 'Geplant' :
               initiative.status === 'archived' ? 'Archiviert' :
               initiative.status}
            </Badge>
          </div>
          <CardTitle className="text-lg">{initiative.title}</CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">{initiative.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(initiative.startDate)} - {initiative.endDate ? formatDate(initiative.endDate) : 'Fortlaufend'}</span>
              </div>
              
              {initiative.responsible && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{initiative.responsible}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 mt-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Fortschritt</span>
              <span>{initiative.progress}%</span>
            </div>
            <Progress value={initiative.progress} className="h-2" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
