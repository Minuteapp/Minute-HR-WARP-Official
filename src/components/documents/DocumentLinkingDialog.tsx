
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FolderOpen, CheckSquare, Link } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreateDocumentProjectLink, useCreateDocumentTaskLink } from '@/hooks/useDocumentLinking';

interface DocumentLinkingDialogProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentLinkingDialog: React.FC<DocumentLinkingDialogProps> = ({
  documentId,
  open,
  onOpenChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  
  const createProjectLink = useCreateDocumentProjectLink();
  const createTaskLink = useCreateDocumentTaskLink();

  // Projekte suchen
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects-search', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('id, name, description, status')
        .eq('status', 'active');

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    },
    enabled: open && activeTab === 'projects'
  });

  // Aufgaben suchen
  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks-search', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('id, title, description, status, priority')
        .neq('status', 'done');

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    },
    enabled: open && activeTab === 'tasks'
  });

  const handleLinkToProject = (projectId: string) => {
    createProjectLink.mutate(
      { documentId, projectId },
      {
        onSuccess: () => {
          onOpenChange(false);
        }
      }
    );
  };

  const handleLinkToTask = (taskId: string) => {
    createTaskLink.mutate(
      { documentId, taskId },
      {
        onSuccess: () => {
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Dokument verknüpfen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Suchfeld */}
          <div>
            <Label htmlFor="search">Suchen</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Nach Projekten oder Aufgaben suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs für Projekte und Aufgaben */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Projekte
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Aufgaben
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-3">
              {loadingProjects ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-3 border rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  {searchQuery ? 'Keine Projekte gefunden' : 'Keine aktiven Projekte verfügbar'}
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-medium">{project.name}</h4>
                        {project.description && (
                          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                        )}
                        <Badge variant="outline" className="mt-1 text-xs">
                          {project.status}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleLinkToProject(project.id)}
                        disabled={createProjectLink.isPending}
                      >
                        Verknüpfen
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tasks" className="space-y-3">
              {loadingTasks ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-3 border rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  {searchQuery ? 'Keine Aufgaben gefunden' : 'Keine offenen Aufgaben verfügbar'}
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {task.status}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              task.priority === 'high' ? 'text-red-600' :
                              task.priority === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleLinkToTask(task.id)}
                        disabled={createTaskLink.isPending}
                      >
                        Verknüpfen
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
