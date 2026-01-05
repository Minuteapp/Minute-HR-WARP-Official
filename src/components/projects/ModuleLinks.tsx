import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ModuleLink } from '@/types/project.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'lucide-react';

interface ModuleLinksProps {
  projectId: string;
}

const ModuleLinks = ({ projectId }: ModuleLinksProps) => {
  const { data: moduleLinks, isLoading } = useQuery({
    queryKey: ['projectModules', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_module_links')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ModuleLink[];
    },
  });

  if (isLoading) {
    return <div>Loading module links...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verknüpfte Module</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {moduleLinks?.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              Keine verknüpften Module gefunden
            </div>
          ) : (
            moduleLinks?.map((moduleLink) => (
              <div
                key={moduleLink.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Link className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{moduleLink.module_type}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(moduleLink.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleLinks;
