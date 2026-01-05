import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComplexityBadge } from './ComplexityBadge';
import { 
  Star, 
  Clock, 
  Users, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface Template {
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
  nodes: any[] | null;
}

interface TemplatePreviewDialogProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate: (id: string) => void;
}

export const TemplatePreviewDialog = ({
  template,
  open,
  onOpenChange,
  onUseTemplate
}: TemplatePreviewDialogProps) => {
  if (!template) return null;

  const features = template.features || [];
  const modules = template.modules || [];
  const nodes = template.nodes || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{template.name}</DialogTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Meta Info */}
          <div className="flex items-center gap-4 flex-wrap">
            <ComplexityBadge complexity={template.complexity || 'medium'} />
            <Badge variant="outline">{template.country_code || 'DE'}</Badge>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">{template.rating?.toFixed(1) || '4.5'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{template.duration || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{template.usage_count || 0}x verwendet</span>
            </div>
          </div>

          {/* Modules */}
          {modules.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Betroffene Module</h4>
              <div className="flex flex-wrap gap-2">
                {modules.map((module, idx) => (
                  <Badge key={idx} variant="secondary">
                    {module}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Features</h4>
              <ul className="grid grid-cols-2 gap-2">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Workflow Steps Preview */}
          {nodes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Workflow-Schritte ({template.steps_count})</h4>
              <div className="flex items-center gap-2 flex-wrap">
                {nodes.slice(0, 5).map((node: any, idx: number) => (
                  <React.Fragment key={idx}>
                    <Badge variant="outline" className="bg-muted">
                      {node.data?.label || `Schritt ${idx + 1}`}
                    </Badge>
                    {idx < Math.min(nodes.length, 5) - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </React.Fragment>
                ))}
                {nodes.length > 5 && (
                  <span className="text-sm text-muted-foreground">
                    + {nodes.length - 5} weitere
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={() => onUseTemplate(template.id)}>
            Template verwenden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
