
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Search, Filter, Star } from "lucide-react";
import { useForecastTemplates } from '@/hooks/useForecastTemplates';
import { CreateForecastTemplateDialog } from './CreateForecastTemplateDialog';
import { ForecastTemplateDetailDialog } from './ForecastTemplateDetailDialog';
import { ForecastFromTemplateDialog } from './ForecastFromTemplateDialog';
import { ForecastTemplateCard } from './ForecastTemplateCard';

export const ForecastTemplatesTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isUseDialogOpen, setIsUseDialogOpen] = useState(false);
  
  const { data: templates, isLoading } = useForecastTemplates({
    category: selectedCategory || undefined,
  });

  const categories = ['budget', 'personnel', 'project', 'growth', 'crisis', 'custom'];

  const filteredTemplates = templates?.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsDetailDialogOpen(true);
  };

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsUseDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Forecast-Vorlagen</h2>
          <p className="text-gray-600 mt-1">
            Erstellen und verwalten Sie Vorlagen für Ihre Forecast-Berechnungen
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Vorlage
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Vorlagen durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Alle
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Vorlagen gefunden</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory 
                ? "Keine Vorlagen entsprechen Ihren Filterkriterien."
                : "Erstellen Sie Ihre erste Forecast-Vorlage, um zu beginnen."
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Erste Vorlage erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="relative">
              <ForecastTemplateCard 
                template={template} 
                onCreateForecast={() => handleUseTemplate(template.id)}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditTemplate(template.id)}
                  className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateForecastTemplateDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {selectedTemplateId && (
        <>
          <ForecastTemplateDetailDialog
            open={isDetailDialogOpen}
            onOpenChange={setIsDetailDialogOpen}
            templateId={selectedTemplateId}
          />
          
          <ForecastFromTemplateDialog
            open={isUseDialogOpen}
            onOpenChange={setIsUseDialogOpen}
            templateId={selectedTemplateId}
          />
        </>
      )}
    </div>
  );
};
