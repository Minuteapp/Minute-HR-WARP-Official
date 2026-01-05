
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal,
  Copy,
  Lock,
  Unlock,
  Star,
  StarOff,
  Download,
  Edit,
  Trash2,
  Calendar,
  BarChart3,
  Users,
  Play
} from "lucide-react";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { ForecastTemplate } from '@/types/forecastTemplates';
import { 
  useDuplicateForecastTemplate, 
  useSetDefaultTemplate,
  useLockTemplate,
  useUpdateForecastTemplate
} from '@/hooks/useForecastTemplates';
import { WithPermission } from '@/components/auth/WithPermission';

interface ForecastTemplateCardProps {
  template: ForecastTemplate;
  onCreateForecast: () => void;
}

export const ForecastTemplateCard = ({ template, onCreateForecast }: ForecastTemplateCardProps) => {
  const [isDuplicating, setIsDuplicating] = useState(false);
  
  const duplicateTemplate = useDuplicateForecastTemplate();
  const setDefaultTemplate = useSetDefaultTemplate();
  const lockTemplate = useLockTemplate();
  const updateTemplate = useUpdateForecastTemplate();

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      budget: 'Budget-Planung',
      personnel: 'Personalkosten',
      project: 'Projektkosten',
      growth: 'Wachstums-Szenarien',
      crisis: 'Krisen-Simulation',
      custom: 'Benutzerdefiniert'
    };
    return categories[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      budget: 'bg-blue-100 text-blue-800',
      personnel: 'bg-green-100 text-green-800',
      project: 'bg-purple-100 text-purple-800',
      growth: 'bg-orange-100 text-orange-800',
      crisis: 'bg-red-100 text-red-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.custom;
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      monthly: 'Monatlich',
      quarterly: 'Quartalsweise',
      yearly: 'Jährlich'
    };
    return types[type] || type;
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      await duplicateTemplate.mutateAsync({
        id: template.id,
        newName: `${template.name} (Kopie)`
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleSetDefault = () => {
    setDefaultTemplate.mutate({
      id: template.id,
      category: template.category
    });
  };

  const handleLockToggle = () => {
    lockTemplate.mutate({
      id: template.id,
      locked: !template.is_locked
    });
  };

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log('Exporting template:', template.id);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {template.name}
              {template.is_default && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
              {template.is_locked && (
                <Lock className="h-4 w-4 text-gray-500" />
              )}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {template.description || 'Keine Beschreibung verfügbar'}
            </p>
          </div>
          
          <WithPermission permission="forecast_templates_manage">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplizieren
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSetDefault} disabled={template.is_default}>
                  {template.is_default ? (
                    <StarOff className="h-4 w-4 mr-2" />
                  ) : (
                    <Star className="h-4 w-4 mr-2" />
                  )}
                  {template.is_default ? 'Als Standard entfernen' : 'Als Standard setzen'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLockToggle}>
                  {template.is_locked ? (
                    <Unlock className="h-4 w-4 mr-2" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  {template.is_locked ? 'Entsperren' : 'Sperren'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportieren
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </WithPermission>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getCategoryColor(template.category)}>
            {getCategoryLabel(template.category)}
          </Badge>
          <Badge variant="outline">
            {getTypeLabel(template.forecast_type)}
          </Badge>
          {template.department && (
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {template.department}
            </Badge>
          )}
        </div>

        {/* Template Statistics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Verwendungen</p>
            <p className="font-semibold">{template.usage_count}x</p>
          </div>
          <div>
            <p className="text-gray-500">Version</p>
            <p className="font-semibold">v{template.version}</p>
          </div>
        </div>

        {/* Creation Date */}
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Erstellt am {format(new Date(template.created_at), 'dd.MM.yyyy', { locale: de })}
        </div>

        {/* Last Used */}
        {template.last_used_at && (
          <div className="text-xs text-gray-500">
            Zuletzt verwendet: {format(new Date(template.last_used_at), 'dd.MM.yyyy HH:mm', { locale: de })}
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={onCreateForecast}
          className="w-full"
          disabled={template.is_locked}
        >
          <Play className="h-4 w-4 mr-2" />
          Forecast erstellen
        </Button>
      </CardContent>
    </Card>
  );
};
