import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComplexityBadge } from './ComplexityBadge';
import { 
  UserPlus, 
  UserMinus, 
  Calendar, 
  DollarSign, 
  Shield, 
  Star,
  CheckCircle,
  Clock,
  Users,
  Eye
} from 'lucide-react';

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string | null;
    complexity: 'simple' | 'medium' | 'high';
    country_code: string | null;
    rating: number | null;
    steps_count: number | null;
    duration: string | null;
    usage_count: number | null;
    modules: string[] | null;
    features: string[] | null;
    category: string | null;
    icon_name: string | null;
    is_verified: boolean | null;
    is_favorite: boolean | null;
  };
  onUseTemplate: (id: string) => void;
  onPreview: (id: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  'user-plus': UserPlus,
  'user-minus': UserMinus,
  'calendar': Calendar,
  'dollar-sign': DollarSign,
  'shield': Shield,
};

export const TemplateCard = ({ template, onUseTemplate, onPreview }: TemplateCardProps) => {
  const Icon = iconMap[template.icon_name || 'user-plus'] || UserPlus;
  const features = template.features || [];
  const modules = template.modules || [];
  const displayFeatures = features.slice(0, 2);
  const remainingCount = features.length - 2;

  return (
    <Card className="h-full">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{template.name}</h3>
              {template.is_verified && (
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {template.description}
            </p>
          </div>
        </div>

        {/* Tags Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <ComplexityBadge complexity={template.complexity || 'medium'} />
          <Badge variant="outline" className="text-xs">
            {template.country_code || 'DE'}
          </Badge>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-medium">{template.rating?.toFixed(1) || '4.5'}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium text-foreground">{template.steps_count || 0}</span>
            <span>Schritte</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{template.duration || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{template.usage_count || 0}x verwendet</span>
          </div>
        </div>

        {/* Modules */}
        {modules.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Betroffene Module</p>
            <div className="flex flex-wrap gap-1">
              {modules.map((module, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {module}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Features</p>
            <ul className="text-xs space-y-0.5">
              {displayFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">•</span>
                  <span>{feature}</span>
                </li>
              ))}
              {remainingCount > 0 && (
                <li className="text-muted-foreground">+ {remainingCount} weitere</li>
              )}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1" 
            size="sm"
            onClick={() => onUseTemplate(template.id)}
          >
            Template verwenden
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onPreview(template.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
