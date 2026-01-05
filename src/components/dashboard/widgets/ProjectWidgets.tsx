import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, TrendingUp, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  owner_id: string | null;
}

export const ProjectStatusWidget: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .or(`owner_id.eq.${user.id},team_members.cs.["${user.id}"]`)
          .neq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error('Fehler beim Laden der Projekte:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'planning': return 'secondary';
      case 'on_hold': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="h-3 w-3" />;
      case 'on_hold': return <AlertTriangle className="h-3 w-3" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'planning': return 'Planung';
      case 'on_hold': return 'Pausiert';
      case 'completed': return 'Abgeschlossen';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Projekt-Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Folder className="h-4 w-4" />
          Projekt-Status ({projects.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.length === 0 ? (
          <p className="text-muted-foreground text-sm">Keine aktiven Projekte</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium line-clamp-1">{project.name}</h4>
                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {project.description}
                    </p>
                  )}
                </div>
                <Badge variant={getStatusColor(project.status)} className="text-xs">
                  {getStatusIcon(project.status)}
                  <span className="ml-1">{getStatusText(project.status)}</span>
                </Badge>
              </div>
              
              {project.progress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Fortschritt</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1" />
                </div>
              )}
              
              {project.end_date && (
                <p className="text-xs text-muted-foreground">
                  Deadline: {format(new Date(project.end_date), 'dd.MM.yyyy', { locale: de })}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};