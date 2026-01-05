import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Puzzle } from 'lucide-react';

export const AddModuleEmptyState: React.FC = () => {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Puzzle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Weitere Module verknüpfen
        </h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Verknüpfen Sie zusätzliche Module, um automatische Budget-Updates zu erhalten 
          und einen vollständigen Überblick über Ihre Finanzen zu haben.
        </p>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Modul hinzufügen
        </Button>
      </CardContent>
    </Card>
  );
};
