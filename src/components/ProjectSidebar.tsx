import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, FolderOpen, Folder, Target, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  roadmapId?: string;
  taskCount?: number;
}

interface Roadmap {
  id: string;
  title: string;
  projects?: Project[];
}

interface ProjectSidebarProps {
  selectedProjectId?: string | null;
  selectedRoadmapId?: string | null;
  onProjectSelect: (projectId: string | null) => void;
  onRoadmapSelect: (roadmapId: string | null) => void;
  userRole: 'member' | 'manager' | 'admin';
}

export function ProjectSidebar({
  selectedProjectId,
  selectedRoadmapId,
  onProjectSelect,
  onRoadmapSelect,
  userRole
}: ProjectSidebarProps) {
  // Mock data - in real app this would come from useProjectsAndRoadmaps hook
  const roadmaps: Roadmap[] = [
    {
      id: 'roadmap-1',
      title: 'Product Roadmap 2025',
      projects: [
        { id: 'project-1', title: 'Mobile App Development', taskCount: 12, roadmapId: 'roadmap-1' },
        { id: 'project-2', title: 'API Enhancement', taskCount: 8, roadmapId: 'roadmap-1' }
      ]
    },
    {
      id: 'roadmap-2', 
      title: 'Infrastructure Upgrade',
      projects: [
        { id: 'project-3', title: 'Cloud Migration', taskCount: 15, roadmapId: 'roadmap-2' },
        { id: 'project-4', title: 'Security Improvements', taskCount: 6, roadmapId: 'roadmap-2' }
      ]
    }
  ];

  const standaloneProjects: Project[] = [
    { id: 'project-5', title: 'Website Redesign', taskCount: 9 },
    { id: 'project-6', title: 'Marketing Campaign', taskCount: 4 }
  ];

  const [expandedRoadmaps, setExpandedRoadmaps] = React.useState<string[]>([]);

  const toggleRoadmap = (roadmapId: string) => {
    setExpandedRoadmaps(prev => 
      prev.includes(roadmapId) 
        ? prev.filter(id => id !== roadmapId)
        : [...prev, roadmapId]
    );
  };

  const handleRoadmapClick = (roadmapId: string) => {
    onRoadmapSelect(selectedRoadmapId === roadmapId ? null : roadmapId);
    onProjectSelect(null); // Clear project selection when selecting roadmap
  };

  const handleProjectClick = (projectId: string) => {
    onProjectSelect(selectedProjectId === projectId ? null : projectId);
    onRoadmapSelect(null); // Clear roadmap selection when selecting project
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <FolderOpen className="h-5 w-5 mr-2 text-blue-600" />
          Projekte & Roadmaps
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* All Tasks Button */}
          <Button
            variant={!selectedProjectId && !selectedRoadmapId ? "default" : "ghost"}
            className="w-full justify-start h-auto p-3"
            onClick={() => {
              onProjectSelect(null);
              onRoadmapSelect(null);
            }}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                <span>Alle Aufgaben</span>
              </div>
            </div>
          </Button>

          {/* Roadmaps */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Roadmaps
            </h3>
            {roadmaps.map((roadmap) => (
              <Collapsible
                key={roadmap.id}
                open={expandedRoadmaps.includes(roadmap.id)}
                onOpenChange={() => toggleRoadmap(roadmap.id)}
              >
                <div className="space-y-1">
                  <div className="flex items-center">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                        <ChevronRight 
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedRoadmaps.includes(roadmap.id) && "rotate-90"
                          )} 
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <Button
                      variant={selectedRoadmapId === roadmap.id ? "secondary" : "ghost"}
                      className="flex-1 justify-start h-8 px-2 ml-1"
                      onClick={() => handleRoadmapClick(roadmap.id)}
                    >
                      <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                      <span className="truncate">{roadmap.title}</span>
                    </Button>
                  </div>
                  <CollapsibleContent className="ml-7">
                    <div className="space-y-1">
                      {roadmap.projects?.map((project) => (
                        <Button
                          key={project.id}
                          variant={selectedProjectId === project.id ? "secondary" : "ghost"}
                          className="w-full justify-start h-8 px-2"
                          onClick={() => handleProjectClick(project.id)}
                        >
                          <Folder className="h-4 w-4 mr-2 text-blue-600" />
                          <span className="truncate flex-1 text-left">{project.title}</span>
                          <Badge variant="outline" className="ml-2">
                            {project.taskCount}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>

          {/* Standalone Projects */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Einzelprojekte
            </h3>
            {standaloneProjects.map((project) => (
              <Button
                key={project.id}
                variant={selectedProjectId === project.id ? "secondary" : "ghost"}
                className="w-full justify-start h-8 px-2"
                onClick={() => handleProjectClick(project.id)}
              >
                <Folder className="h-4 w-4 mr-2 text-blue-600" />
                <span className="truncate flex-1 text-left">{project.title}</span>
                <Badge variant="outline" className="ml-2">
                  {project.taskCount}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}