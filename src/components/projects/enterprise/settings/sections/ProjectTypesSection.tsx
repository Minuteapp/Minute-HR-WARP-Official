import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProjectTypeRow from './ProjectTypeRow';

interface ProjectType {
  id: string;
  name: string;
  color: string;
  projectCount: number;
  isActive: boolean;
}

const typeColors: Record<string, string> = {
  'HR': 'bg-blue-500',
  'IT': 'bg-green-500',
  'ESG': 'bg-green-500',
  'Compliance': 'bg-yellow-500',
  'Innovation': 'bg-purple-500',
  'Business': 'bg-pink-500'
};

const ProjectTypesSection = () => {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);

  useEffect(() => {
    const fetchProjectTypes = async () => {
      const { data: projects } = await supabase
        .from('projects')
        .select('category');

      const typeCounts: Record<string, number> = {};
      projects?.forEach(project => {
        const cat = project.category || 'Andere';
        typeCounts[cat] = (typeCounts[cat] || 0) + 1;
      });

      const types: ProjectType[] = Object.entries(typeCounts).map(([name, count], index) => ({
        id: `type-${index}`,
        name,
        color: typeColors[name] || 'bg-gray-500',
        projectCount: count,
        isActive: true
      }));

      setProjectTypes(types);
    };

    fetchProjectTypes();
  }, []);

  const handleToggle = (id: string, value: boolean) => {
    setProjectTypes(prev =>
      prev.map(type =>
        type.id === id ? { ...type, isActive: value } : type
      )
    );
  };

  const handleEdit = (id: string) => {
    console.log('Edit project type:', id);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Projekttypen</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Verwalten Sie die verfügbaren Projekttypen
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Typ
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {projectTypes.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            Keine Projekttypen konfiguriert
          </p>
        ) : (
          <div>
            {projectTypes.map(type => (
              <ProjectTypeRow
                key={type.id}
                name={type.name}
                color={type.color}
                projectCount={type.projectCount}
                isActive={type.isActive}
                onToggleChange={(value) => handleToggle(type.id, value)}
                onEdit={() => handleEdit(type.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectTypesSection;
