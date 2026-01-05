import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Loader2 } from 'lucide-react';

interface ProjectSelectProps {
  value: string;
  onChange: (project: string) => void;
  placeholder?: string;
}

export function ProjectSelect({ value, onChange, placeholder = "Projekt auswählen..." }: ProjectSelectProps) {
  // Echte Projekte aus Supabase laden
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, status')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'planning': return 'Planung';
      case 'completed': return 'Abgeschlossen';
      case 'on-hold': return 'Pausiert';
      default: return status;
    }
  };

  if (error) {
    console.error('Fehler beim Laden der Projekte:', error);
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Lade Projekte..." : placeholder}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {value && projects && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{projects.find(p => p.id === value)?.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{project.name}</span>
                </div>
                <Badge variant="outline" className={`text-xs ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
            </SelectItem>
          ))
        ) : (
          <SelectItem value="" disabled>
            {isLoading ? "Lade Projekte..." : "Keine Projekte verfügbar"}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}