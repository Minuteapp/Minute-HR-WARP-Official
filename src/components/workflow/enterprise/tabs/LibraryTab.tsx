import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus } from 'lucide-react';

export const LibraryTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Workflow-Bibliothek</h2>
          <p className="text-sm text-muted-foreground">Vorgefertigte Workflow-Vorlagen</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Vorlage erstellen
        </Button>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg mb-2">Keine Vorlagen vorhanden</CardTitle>
          <CardDescription className="max-w-md">
            Erstellen Sie wiederverwendbare Workflow-Vorlagen oder importieren Sie Vorlagen aus der Community.
          </CardDescription>
          <Button variant="outline" className="mt-4">
            Community-Vorlagen durchsuchen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
