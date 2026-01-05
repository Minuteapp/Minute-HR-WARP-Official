import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHRNotesData } from '@/hooks/employee-tabs/useHRNotesData';
import { FileText, Paperclip, Calendar } from 'lucide-react';

interface HRNotesTabContentProps {
  employeeId: string;
}

export const HRNotesTabContent: React.FC<HRNotesTabContentProps> = ({ employeeId }) => {
  const { notes, byCategory, statistics, isLoading } = useHRNotesData(employeeId);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Lade HR-Notizen...</div>;
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Performance': 'bg-blue-100 text-blue-800',
      'Gespräch': 'bg-purple-100 text-purple-800',
      'Verwarnung': 'bg-red-100 text-red-800',
      'Lob': 'bg-green-100 text-green-800',
      'Allgemein': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors['Allgemein'];
  };

  return (
    <div className="space-y-6">
      {/* Statistik-Übersicht */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{statistics.total}</p>
            <p className="text-xs text-muted-foreground">Gesamt Notizen</p>
          </CardContent>
        </Card>
        {Object.entries(statistics.byCategory).slice(0, 3).map(([category, count]) => (
          <Card key={category}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">{category}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notizen nach Kategorie */}
      {Object.entries(byCategory).map(([category, categoryNotes]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(categoryNotes as any[]).map((note) => (
                <div key={note.id} className="border-l-4 border-primary pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {note.note_title && (
                          <h5 className="font-medium">{note.note_title}</h5>
                        )}
                        <Badge className={getCategoryColor(note.category || 'Allgemein')}>
                          {note.category || 'Allgemein'}
                        </Badge>
                      </div>
                      {note.note_content && (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {note.note_content}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(note.created_at).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    
                    {note.attachments && note.attachments.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        {note.attachments.length} Anhang{note.attachments.length > 1 ? 'e' : ''}
                      </div>
                    )}
                  </div>
                  
                  {note.attachments && note.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {note.attachments.map((attachment: any) => (
                        <div key={attachment.id} className="flex items-center gap-2 text-xs">
                          <Paperclip className="h-3 w-3" />
                          <a 
                            href={attachment.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {attachment.file_name}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {notes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Keine HR-Notizen vorhanden
          </CardContent>
        </Card>
      )}
    </div>
  );
};
