import React from 'react';
import { Button } from '@/components/ui/button';
import { List, Network } from 'lucide-react';

interface InboxViewToggleProps {
  view: 'list' | 'visual';
  onViewChange: (view: 'list' | 'visual') => void;
}

export const InboxViewToggle: React.FC<InboxViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex rounded-lg border bg-muted p-1">
      <Button
        variant={view === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="flex items-center gap-2"
      >
        <List className="h-4 w-4" />
        Liste
      </Button>
      <Button
        variant={view === 'visual' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('visual')}
        className="flex items-center gap-2"
      >
        <Network className="h-4 w-4" />
        Visuell
      </Button>
    </div>
  );
};