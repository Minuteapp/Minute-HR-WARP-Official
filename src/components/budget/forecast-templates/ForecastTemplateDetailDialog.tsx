
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  User, 
  FileText, 
  Star, 
  Lock, 
  TrendingUp,
  Target,
  Calculator,
  Settings
} from "lucide-react";
import { useForecastTemplate } from '@/hooks/useForecastTemplates';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ForecastTemplateDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
}

export const ForecastTemplateDetailDialog = ({ 
  open, 
  onOpenChange, 
  templateId 
}: ForecastTemplateDetailDialogProps) => {
  const { data: template, isLoading } = useForecastTemplate(templateId);

  const getCategoryLabel = (category: string) => {
    const labels = {
      budget: 'Budget-Planung',
      personnel: 'Personalkosten',
      project: 'Projektkosten',
      growth: 'Wachstums-Szenarien',
      crisis: 'Krisen-Simulation',
      custom: 'Benutzerdefiniert'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      monthly: 'Monatlich',
      quarterly: 'Quartalsweise',
      yearly: 'Jährlich'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Vorlage wird geladen...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!template) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Vorlage nicht gefunden</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Die angeforderte Vorlage konnte nicht gefunden werden.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {template.name}
            {template.is_default && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
            {template.is_locked && (
              <Lock className="h-4 w-4 text-gray-500" />
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-900">
                  Grundinformationen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getCategoryLabel(template.category)}
                  </Badge>
                  <Badge variant="outline">
                    {getTypeLabel(template.forecast_type)}
                  </Badge>
                </div>
                
                {template.department && (
                  <div className="flex items-center gap-2 text-sm">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span>Abteilung: {template.department}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span>{template.usage_count} mal verwendet</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>Version {template.version}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-900">
                  Metadaten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    Erstellt: {format(new Date(template.created_at), 'dd.MM.yyyy', { locale: de })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    Aktualisiert: {format(new Date(template.updated_at), 'dd.MM.yyyy', { locale: de })}
                  </span>
                </div>
                
                {template.last_used_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>
                      Zuletzt verwendet: {format(new Date(template.last_used_at), 'dd.MM.yyyy', { locale: de })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {template.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-900">
                  Beschreibung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {template.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Template Structure */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Vorlage-Struktur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Categories */}
              {template.template_data.structure.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Kategorien</h4>
                  <div className="space-y-2">
                    {template.template_data.structure.map((category, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{category.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {category.type}
                          </Badge>
                        </div>
                        {category.subcategories.length > 0 && (
                          <div className="mt-2 ml-4 space-y-1">
                            {category.subcategories.map((sub, subIndex) => (
                              <div key={subIndex} className="text-xs text-gray-600">
                                • {sub.name}
                                {sub.base_amount > 0 && (
                                  <span className="ml-2 text-green-600">
                                    €{sub.base_amount.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Parameters */}
              {template.template_data.parameters.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Parameter
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {template.template_data.parameters.map((param, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{param.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {param.type}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Standard: {param.default_value}
                          {(param.min_value !== undefined || param.max_value !== undefined) && (
                            <span className="ml-2">
                              ({param.min_value} - {param.max_value})
                            </span>
                          )}
                        </div>
                        {param.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {param.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scenarios */}
              {template.template_data.scenarios.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Szenarien</h4>
                  <div className="space-y-2">
                    {template.template_data.scenarios.map((scenario, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-sm mb-1">{scenario.name}</div>
                        <p className="text-xs text-gray-600 mb-2">{scenario.description}</p>
                        {Object.keys(scenario.multipliers).length > 0 && (
                          <div className="text-xs text-gray-500">
                            Multiplikatoren: {Object.entries(scenario.multipliers).map(([key, value]) => 
                              `${key}: ${value}x`
                            ).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
