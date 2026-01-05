
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CasesHeaderProps {
  onCreateNew: () => void;
}

export const CasesHeader = ({ onCreateNew }: CasesHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Entsendungen & Fälle</h2>
        <p className="text-muted-foreground">Übersicht aller aktiven und geplanten Entsendungen</p>
      </div>
      <Button onClick={onCreateNew} className="gap-2">
        <Plus className="h-4 w-4" />
        Neue Entsendung
      </Button>
    </div>
  );
};
