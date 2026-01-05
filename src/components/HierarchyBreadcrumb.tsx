import React from 'react';
import { ChevronRight, Home, MapPin, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface Project {
  id: string;
  title: string;
  roadmapId?: string;
}

interface Roadmap {
  id: string;
  title: string;
}

interface HierarchyBreadcrumbProps {
  selectedProjectId?: string | null;
  selectedRoadmapId?: string | null;
  onProjectSelect: (projectId: string | null) => void;
  onRoadmapSelect: (roadmapId: string | null) => void;
  userRole: 'member' | 'manager' | 'admin';
}

export function HierarchyBreadcrumb({
  selectedProjectId,
  selectedRoadmapId,
  onProjectSelect,
  onRoadmapSelect,
  userRole
}: HierarchyBreadcrumbProps) {
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  const { data: projects = [] } = useQuery({
    queryKey: ['hierarchy-projects', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from('projects')
        .select('id, name, roadmap_id')
        .eq('company_id', companyId);
      return (data || []).map(p => ({ 
        id: p.id, 
        title: p.name, 
        roadmapId: p.roadmap_id 
      }));
    },
    enabled: !!companyId
  });

  const { data: roadmaps = [] } = useQuery({
    queryKey: ['hierarchy-roadmaps', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from('roadmaps')
        .select('id, title')
        .eq('company_id', companyId);
      return data || [];
    },
    enabled: !!companyId
  });

  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;
  const selectedRoadmap = selectedRoadmapId ? roadmaps.find(r => r.id === selectedRoadmapId) : null;
  
  // If project is selected, find its parent roadmap
  const parentRoadmap = selectedProject?.roadmapId ? 
    roadmaps.find(r => r.id === selectedProject.roadmapId) : null;

  const handleHomeClick = () => {
    onProjectSelect(null);
    onRoadmapSelect(null);
  };

  const handleRoadmapClick = (roadmapId: string) => {
    onRoadmapSelect(roadmapId);
    onProjectSelect(null);
  };

  const breadcrumbItems = [];

  // Always show Home
  breadcrumbItems.push({
    label: 'Alle Aufgaben',
    icon: Home,
    onClick: handleHomeClick,
    isActive: !selectedProjectId && !selectedRoadmapId
  });

  // If roadmap is selected directly
  if (selectedRoadmap && !selectedProject) {
    breadcrumbItems.push({
      label: selectedRoadmap.title,
      icon: MapPin,
      onClick: () => handleRoadmapClick(selectedRoadmap.id),
      isActive: true
    });
  }

  // If project is selected
  if (selectedProject) {
    // Show parent roadmap if exists
    if (parentRoadmap) {
      breadcrumbItems.push({
        label: parentRoadmap.title,
        icon: MapPin,
        onClick: () => handleRoadmapClick(parentRoadmap.id),
        isActive: false
      });
    }
    
    // Show project
    breadcrumbItems.push({
      label: selectedProject.title,
      icon: Folder,
      onClick: () => {},
      isActive: true
    });
  }

  // If no selection, don't render breadcrumb
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <div className="bg-muted/50 border-b px-6 py-3">
      <div className="flex items-center space-x-2 text-sm">
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mr-2" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={item.onClick}
              className={cn(
                "h-7 px-2 text-muted-foreground hover:text-foreground",
                item.isActive && "text-foreground font-medium"
              )}
            >
              <item.icon className="h-4 w-4 mr-1" />
              {item.label}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
