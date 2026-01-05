
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Star, Users, Building2, User, TrendingUp, BookOpen } from 'lucide-react';
import { useGoalTemplates, useGoalTemplateCategories, usePopularGoalTemplates } from '@/hooks/useGoalTemplates';
import { CreateGoalTemplateDialog } from './CreateGoalTemplateDialog';
import { GoalTemplateCard } from './GoalTemplateCard';
import type { GoalTemplate } from '@/types/goalTemplates';

export const GoalTemplateCatalog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);

  const { data: templates = [], isLoading } = useGoalTemplates(
    selectedCategory === 'all' ? undefined : selectedCategory
  );
  const { data: categories = [] } = useGoalTemplateCategories();
  const { data: popularTemplates = [] } = usePopularGoalTemplates(6);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (isLoading) {
    return (
      <div className="w-full p-6">
        <div className="text-center py-8">
          <p>Laden der Templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Ziel-Templates</h1>
          <p className="text-sm text-gray-500">
            Verwenden Sie vorgefertigte Templates oder erstellen Sie eigene
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Neues Template
        </Button>
      </div>

      {/* Beliebte Templates */}
      {popularTemplates.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Beliebte Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTemplates.map((template) => (
              <GoalTemplateCard
                key={template.id}
                template={template}
                onSelect={setSelectedTemplate}
                isPopular
              />
            ))}
          </div>
        </div>
      )}

      {/* Suchbereich */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Templates durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Template-Tabs nach Kategorie */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Alle</TabsTrigger>
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.name);
            return (
              <TabsTrigger key={category.name} value={category.name}>
                <IconComponent className="h-4 w-4 mr-2" />
                {category.display_name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {searchQuery ? (
                  <>
                    <Search className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Keine Templates gefunden
                    </h3>
                    <p className="text-gray-500">
                      Keine Templates entsprechen Ihrer Suche "{searchQuery}".
                    </p>
                  </>
                ) : (
                  <>
                    <Plus className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Noch keine Templates vorhanden
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Erstellen Sie Ihr erstes Template für diese Kategorie.
                    </p>
                  </>
                )}
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Neues Template erstellen
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <GoalTemplateCard
                  key={template.id}
                  template={template}
                  onSelect={setSelectedTemplate}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateGoalTemplateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};
