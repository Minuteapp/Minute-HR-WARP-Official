
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Star, Users, Eye, Copy, Edit, Trash2, MoreVertical, User, Building2, BookOpen, TrendingUp } from 'lucide-react';
import type { GoalTemplate } from '@/types/goalTemplates';
import { useDuplicateGoalTemplate, useDeleteGoalTemplate } from '@/hooks/useGoalTemplates';

interface GoalTemplateCardProps {
  template: GoalTemplate;
  onSelect: (template: GoalTemplate) => void;
  isPopular?: boolean;
  canEdit?: boolean;
}

export const GoalTemplateCard = ({ 
  template, 
  onSelect, 
  isPopular = false,
  canEdit = false 
}: GoalTemplateCardProps) => {
  const duplicateTemplate = useDuplicateGoalTemplate();
  const deleteTemplate = useDeleteGoalTemplate();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'personal': return User;
      case 'team': return Users;
      case 'company': return Building2;
      case 'development': return BookOpen;
      case 'performance': return TrendingUp;
      default: return Star;
    }
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'smart': return 'bg-blue-100 text-blue-800';
      case 'okr': return 'bg-purple-100 text-purple-800';
      case 'development': return 'bg-green-100 text-green-800';
      case 'performance': return 'bg-orange-100 text-orange-800';
      case 'project': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDuplicate = () => {
    duplicateTemplate.mutate({
      id: template.id,
      newName: `${template.name} (Kopie)`
    });
  };

  const handleDelete = () => {
    if (confirm('Möchten Sie dieses Template wirklich löschen?')) {
      deleteTemplate.mutate(template.id);
    }
  };

  const IconComponent = getCategoryIcon(template.category);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <IconComponent className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {template.name}
                {isPopular && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                {template.is_public && <Users className="h-4 w-4 text-green-600" />}
              </CardTitle>
              {template.description && (
                <CardDescription className="mt-1">
                  {template.description}
                </CardDescription>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSelect(template)}>
                <Eye className="h-4 w-4 mr-2" />
                Vorschau
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplizieren
              </DropdownMenuItem>
              {canEdit && (
                <>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge className={getTemplateTypeColor(template.template_type)}>
              {template.template_type.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {template.category}
            </Badge>
            {template.access_level !== 'all' && (
              <Badge variant="secondary">
                {template.access_level}
              </Badge>
            )}
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{template.usage_count}x verwendet</span>
            <span>{template.fields.length} Felder</span>
          </div>
          
          <Button 
            onClick={() => onSelect(template)} 
            className="w-full"
            variant="outline"
          >
            Template verwenden
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
