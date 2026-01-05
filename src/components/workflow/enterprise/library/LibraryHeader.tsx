import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Upload, Search } from 'lucide-react';

interface LibraryHeaderProps {
  templateCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onShowFavorites: () => void;
  onImport: () => void;
}

export const LibraryHeader = ({
  templateCount,
  searchQuery,
  onSearchChange,
  onShowFavorites,
  onImport
}: LibraryHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Workflow-Bibliothek</h2>
          <p className="text-sm text-muted-foreground">
            {templateCount} vorgefertigte Templates für alle HR-Prozesse
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onShowFavorites}>
            <Star className="h-4 w-4 mr-2" />
            Favoriten
          </Button>
          <Button variant="outline" size="sm" onClick={onImport}>
            <Upload className="h-4 w-4 mr-2" />
            Importieren
          </Button>
        </div>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Templates durchsuchen..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};
