
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectCategory } from '@/types/project.types';

export const useProjectCategories = () => {
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['project-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as ProjectCategory[];
    },
  });

  return {
    categories,
    isLoading,
    error,
  };
};
