import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ShieldCheck, Briefcase, User, Check } from 'lucide-react';

interface RoleTemplate {
  id: string;
  role_name: string;
  template_name: string;
  description: string;
  layout_config: {
    grid: { columns: number; rowHeight: number; gap: number };
    widgets: any[];
  };
  is_default: boolean;
  is_customizable: boolean;
}

interface TemplateSelectorProps {
  templates: RoleTemplate[];
  currentTemplateId?: string;
  onApplyTemplate: (templateId: string) => void;
  isLoading?: boolean;
}

const roleIcons: Record<string, React.ComponentType<any>> = {
  admin: ShieldCheck,
  hr: Briefcase,
  manager: Users,
  employee: User
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  hr: 'bg-blue-100 text-blue-700',
  manager: 'bg-green-100 text-green-700',
  employee: 'bg-purple-100 text-purple-700'
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  currentTemplateId,
  onApplyTemplate,
  isLoading = false
}) => {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Keine Vorlagen für Ihre Rolle verfügbar
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => {
        const Icon = roleIcons[template.role_name] || User;
        const colorClass = roleColors[template.role_name] || 'bg-gray-100 text-gray-700';
        const isActive = template.id === currentTemplateId;
        const widgetCount = template.layout_config?.widgets?.length || 0;

        return (
          <Card
            key={template.id}
            className={`relative ${isActive ? 'ring-2 ring-primary' : ''}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.template_name}</CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {template.role_name}
                    </Badge>
                  </div>
                </div>
                {isActive && (
                  <Badge variant="default">
                    <Check className="h-3 w-3 mr-1" />
                    Aktiv
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <CardDescription className="mb-4 min-h-[3rem]">
                {template.description}
              </CardDescription>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Widgets</span>
                  <Badge variant="secondary">{widgetCount}</Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Grid-Layout</span>
                  <span className="text-sm">
                    {template.layout_config?.grid?.columns || 4} Spalten
                  </span>
                </div>

                {template.is_default && (
                  <Badge variant="outline" className="w-full justify-center">
                    Standard-Vorlage
                  </Badge>
                )}

                <Button
                  onClick={() => onApplyTemplate(template.id)}
                  disabled={isLoading || isActive}
                  className="w-full mt-2"
                  variant={isActive ? 'outline' : 'default'}
                >
                  {isActive ? 'Aktuell verwendet' : 'Vorlage anwenden'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
