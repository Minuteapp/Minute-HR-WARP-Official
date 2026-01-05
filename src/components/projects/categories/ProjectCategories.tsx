
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Tag, X, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface ProjectCategoriesProps {
  projectId: string;
}

export const ProjectCategories: React.FC<ProjectCategoriesProps> = ({ projectId }) => {
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project-categories', projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from('projects')
        .select('id, tags')
        .eq('id', projectId)
        .single();
      return data;
    },
    enabled: !!projectId
  });

  const updateCategoriesMutation = useMutation({
    mutationFn: async (categories: string[]) => {
      const { error } = await supabase
        .from('projects')
        .update({ tags: categories })
        .eq('id', projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-categories', projectId] });
      toast.success('Kategorien aktualisiert');
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren der Kategorien');
    }
  });

  const categories = (project?.tags as string[]) || [];

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      updateCategoriesMutation.mutate([...categories, newCategory.trim()]);
      setNewCategory('');
      setIsAddingCategory(false);
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    updateCategoriesMutation.mutate(categories.filter(cat => cat !== categoryToRemove));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Projekt-Kategorien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Projekt-Kategorien
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.length === 0 && !isAddingCategory ? (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Keine Kategorien vorhanden</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {category}
                  <button
                    onClick={() => handleRemoveCategory(category)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {isAddingCategory ? (
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Neue Kategorie"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button size="sm" onClick={handleAddCategory}>
                Hinzufügen
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategory('');
                }}
              >
                Abbrechen
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAddingCategory(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Kategorie hinzufügen
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
