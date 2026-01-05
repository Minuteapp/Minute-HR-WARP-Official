import React from 'react';
import { Filter, Users, Map, FolderOpen, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { UserRole } from './hooks/useEnhancedTasks';
import { useProjectsAndRoadmaps } from './hooks/useProjectsAndRoadmaps';

interface EnhancedTaskFiltersProps {
  userRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export function EnhancedTaskFilters({ userRole, onRoleChange }: EnhancedTaskFiltersProps) {
  const { roadmaps, projects } = useProjectsAndRoadmaps();

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'member': return 'Mitarbeiter';
      case 'manager': return 'Manager';
      case 'admin': return 'Administrator';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'member': return <Users className="h-4 w-4" />;
      case 'manager': return <FolderOpen className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Role Selector (for demo purposes) */}
      {onRoleChange && (
        <div className="flex items-center space-x-2">
          {getRoleIcon(userRole)}
          <select 
            value={userRole} 
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="member">Mitarbeiter</option>
            <option value="manager">Manager</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      )}

      {/* Advanced Filters Info */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Info
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Rolleninformationen</h4>
            
            {/* Current Role Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {getRoleIcon(userRole)}
                <span>Ansicht als: {getRoleLabel(userRole)}</span>
              </div>
              <p className="text-xs text-gray-500">
                {userRole === 'member' && 'Sie sehen nur Ihre zugewiesenen Aufgaben'}
                {userRole === 'manager' && 'Sie sehen alle Aufgaben mit vollständigem Projekt-Kontext'}
                {userRole === 'admin' && 'Sie haben Vollzugriff auf alle Aufgaben und können Strukturen bearbeiten'}
              </p>
            </div>

            {/* Available Roadmaps */}
            {['manager', 'admin'].includes(userRole) && roadmaps && roadmaps.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Map className="h-4 w-4 mr-2" />
                  Verfügbare Roadmaps
                </label>
                <div className="space-y-1">
                  {roadmaps.map((roadmap) => (
                    <div key={roadmap.id} className="flex items-center space-x-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        roadmap.status === 'in-progress' ? 'bg-blue-500' :
                        roadmap.status === 'completed' ? 'bg-green-500' :
                        roadmap.status === 'at-risk' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <span>{roadmap.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {roadmap.quarter} {roadmap.year}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Projects */}
            {['manager', 'admin'].includes(userRole) && projects && projects.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Verfügbare Projekte
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center space-x-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        project.status === 'active' ? 'bg-green-500' :
                        project.status === 'completed' ? 'bg-blue-500' :
                        project.status === 'on-hold' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <span className="truncate">{project.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {project.progress}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}