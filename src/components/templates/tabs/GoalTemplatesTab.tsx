
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGoalTemplates } from '@/hooks/useGoalTemplates';
import { Eye, Edit, Copy, Trash2, Target, MoreVertical, Star } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface GoalTemplatesTabProps {
  searchTerm: string;
  selectedCategory: string | null;
}

export const GoalTemplatesTab = ({ searchTerm }: GoalTemplatesTabProps) => {
  const { data: templates = [], isLoading } = useGoalTemplates();

  const normalizedTemplates = (templates || []).map((t: any) => ({
    ...t,
    is_system_template: t?.is_system_template ?? false,
    usage_count: t?.usage_count ?? 0,
    rating: t?.rating ?? 0,
    last_updated: t?.last_updated ?? t?.updated_at ?? t?.updatedAt ?? new Date().toISOString(),
    description: t?.description ?? ''
  })) as any[];

  const filteredTemplates = normalizedTemplates.filter((template: any) =>
    !searchTerm || 
    template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'smart': return 'text-blue-600';
      case 'okr': return 'text-green-600';
      case 'development': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return <div>Lade Ziel-Templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Ziel-Templates</h3>
          <p className="text-sm text-gray-500">
            Vorlagen für Zielvereinbarungen und Performance Management
          </p>
        </div>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          Neues Ziel-Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 flex-1">
                  <Target className={`h-5 w-5 ${getTemplateTypeColor(template.template_type)}`} />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Vorschau
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplizieren
                    </DropdownMenuItem>
                    {!template.is_system_template && (
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Löschen
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{template.template_type.toUpperCase()}</Badge>
                  <Badge variant="secondary">{template.category}</Badge>
                  {template.is_system_template && (
                    <Badge variant="outline">System</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>{template.usage_count}× verwendet</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{template.rating}</span>
                    </div>
                  </div>
                  <span>{new Date(template.last_updated).toLocaleDateString()}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Vorschau
                  </Button>
                  <Button size="sm" className="flex-1">
                    Template verwenden
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
