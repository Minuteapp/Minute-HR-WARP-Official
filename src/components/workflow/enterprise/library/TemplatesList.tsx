import React from 'react';
import { TemplateCard } from './TemplateCard';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

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
  category: string | null;
  icon_name: string | null;
  is_verified: boolean | null;
  is_favorite: boolean | null;
}

interface TemplatesListProps {
  templates: Template[];
  isLoading: boolean;
  onUseTemplate: (id: string) => void;
  onPreview: (id: string) => void;
}

export const TemplatesList = ({ 
  templates, 
  isLoading, 
  onUseTemplate, 
  onPreview 
}: TemplatesListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-80 animate-pulse">
            <CardContent className="p-5">
              <div className="h-10 w-10 rounded-lg bg-muted" />
              <div className="h-4 w-3/4 bg-muted rounded mt-4" />
              <div className="h-3 w-full bg-muted rounded mt-2" />
              <div className="h-3 w-2/3 bg-muted rounded mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Keine Templates gefunden</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Es wurden keine Templates für die ausgewählte Kategorie gefunden.
            Versuchen Sie eine andere Kategorie oder erstellen Sie ein neues Template.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onUseTemplate={onUseTemplate}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
};
