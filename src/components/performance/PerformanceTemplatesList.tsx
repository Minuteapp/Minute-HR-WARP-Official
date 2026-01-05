
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  FileText, 
  Users, 
  User, 
  Target,
  Star,
  MoreVertical,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePerformanceTemplates } from '@/hooks/usePerformance';
import type { PerformanceTemplateType } from '@/types/performance';

export const PerformanceTemplatesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: templates = [], isLoading } = usePerformanceTemplates();

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTemplateTypeIcon = (type: PerformanceTemplateType) => {
    switch (type) {
      case 'individual':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'team':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'goal_based':
        return <Target className="h-4 w-4 text-purple-600" />;
      case 'feedback_360':
        return <Star className="h-4 w-4 text-orange-600" />;
      case 'ad_hoc':
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTemplateTypeBadge = (type: PerformanceTemplateType) => {
    const variants = {
      'individual': 'default',
      'team': 'secondary',
      'goal_based': 'outline',
      'feedback_360': 'outline',
      'ad_hoc': 'outline'
    } as const;

    const labels = {
      'individual': 'Individuell',
      'team': 'Team',
      'goal_based': 'Ziel-basiert',
      'feedback_360': '360° Feedback',
      'ad_hoc': 'Ad-hoc'
    };

    return (
      <Badge variant={variants[type]}>
        {labels[type]}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Lade Templates...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Templates</CardTitle>
          <CardDescription>Verwalten Sie Vorlagen für Performance-Reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Nach Template-Name oder Beschreibung suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getTemplateTypeIcon(template.template_type)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.is_system_template && (
                        <Badge variant="outline" className="text-xs">System</Badge>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                  
                  {template.description && (
                    <CardDescription>{template.description}</CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {getTemplateTypeBadge(template.template_type)}
                      <Badge variant="secondary">
                        {template.rating_scale.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {template.cycle_type}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{template.evaluation_fields.length} Bewertungsfelder</span>
                      <span>{template.criteria.length} Kriterien</span>
                    </div>
                    
                    {template.requires_signature && (
                      <div className="flex items-center gap-1 text-sm text-blue-600">
                        <FileText className="h-3 w-3" />
                        <span>Unterschrift erforderlich</span>
                      </div>
                    )}
                    
                    <Button className="w-full" variant="outline">
                      Template verwenden
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTemplates.length === 0 && (
              <div className="col-span-2 text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Templates gefunden</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Versuchen Sie andere Suchbegriffe.' 
                    : 'Es sind noch keine Performance-Templates vorhanden.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
