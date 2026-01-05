
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useBudgetTemplates } from '@/hooks/useBudgetTemplates';
import { CreateBudgetTemplateDialog } from './CreateBudgetTemplateDialog';
import { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const BudgetTemplatesList = () => {
  const { data: templates, isLoading } = useBudgetTemplates();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Budget-Vorlagen</h2>
          <p className="text-sm text-gray-500">Verwalten Sie Ihre Budget-Vorlagen</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Vorlage
        </Button>
      </div>

      {templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <CardDescription className="capitalize">
                  {template.template_type.replace('_', ' ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {template.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(template.created_at).toLocaleDateString()}
                    </span>
                    <Button variant="outline" size="sm">
                      Verwenden
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Keine Vorlagen vorhanden</CardTitle>
            <CardDescription>
              Erstellen Sie Ihre erste Budget-Vorlage, um schneller Budgets zu planen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Erste Vorlage erstellen
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateBudgetTemplateDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
};
