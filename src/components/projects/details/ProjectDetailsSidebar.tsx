
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  CheckSquare, 
  Users, 
  FileText, 
  Target,
  Settings,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface ProjectDetailsSidebarProps {
  project: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ProjectDetailsSidebar: React.FC<ProjectDetailsSidebarProps> = ({
  project,
  activeTab,
  setActiveTab
}) => {
  const menuItems = [
    { id: 'overview', label: 'Übersicht', icon: BarChart3 },
    { id: 'tasks', label: 'Aufgaben', icon: CheckSquare },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'documents', label: 'Dokumente', icon: FileText },
    { id: 'milestones', label: 'Meilensteine', icon: Target },
    { id: 'modules', label: 'Andere Module', icon: TrendingUp },
    { id: 'details', label: 'Einstellungen', icon: Settings }
  ];

  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-1 p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>

        {/* Projekt-Info */}
        <div className="p-4 border-t space-y-3">
          <div>
            <span className="text-sm text-gray-600">Status</span>
            <Badge 
              variant={project.status === 'active' ? 'default' : 'secondary'}
              className="ml-2"
            >
              {project.status === 'active' ? 'Aktiv' : project.status}
            </Badge>
          </div>
          
          <div>
            <span className="text-sm text-gray-600">Fortschritt</span>
            <div className="flex items-center mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{project.progress}%</span>
            </div>
          </div>

          {project.dueDate && (
            <div>
              <span className="text-sm text-gray-600">Fällig am</span>
              <p className="text-sm font-medium">
                {new Date(project.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
