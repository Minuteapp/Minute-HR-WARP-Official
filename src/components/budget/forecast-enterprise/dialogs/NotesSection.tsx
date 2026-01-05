import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StickyNote } from 'lucide-react';

interface NotesSectionProps {
  notes?: string | null;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ notes }) => {
  if (!notes) {
    return null;
  }

  return (
    <Card className="bg-yellow-500/10 border-yellow-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          Notizen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground whitespace-pre-wrap">{notes}</p>
      </CardContent>
    </Card>
  );
};
