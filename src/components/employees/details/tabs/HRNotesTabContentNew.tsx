import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHRNotesData } from '@/hooks/employee-tabs/useHRNotesData';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { HRNoteDialog } from '../dialogs/HRNoteDialog';
import { FileEdit, Plus, Edit, Trash2, Lock, Calendar, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HRNotesTabContentNewProps {
  employeeId: string;
}

export const HRNotesTabContentNew: React.FC<HRNotesTabContentNewProps> = ({ employeeId }) => {
  const { notes, byCategory, statistics, isLoading, addNote, updateNote, deleteNote } = useHRNotesData(employeeId);
  const { canCreate, canEdit, canDelete } = useEnterprisePermissions();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const handleCreate = async (data: any) => {
    await addNote.mutateAsync(data);
  };

  const handleEdit = async (data: any) => {
    if (selectedNote) {
      await updateNote.mutateAsync({ id: selectedNote.id, data });
    }
  };

  const handleDelete = async () => {
    if (noteToDelete) {
      await deleteNote.mutateAsync(noteToDelete);
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  const openCreateDialog = () => {
    setSelectedNote(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const openEditDialog = (note: any) => {
    setSelectedNote(note);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Lade HR-Notizen...</div>;
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Allgemein': 'bg-gray-100 text-gray-800',
      'Performance': 'bg-blue-100 text-blue-800',
      'Verhalten': 'bg-orange-100 text-orange-800',
      'Entwicklung': 'bg-green-100 text-green-800',
      'Gespräch': 'bg-purple-100 text-purple-800',
      'Abmahnung': 'bg-red-100 text-red-800',
      'Lob': 'bg-emerald-100 text-emerald-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const isFollowUpDue = (followUpDate: string | null) => {
    if (!followUpDate) return false;
    return new Date(followUpDate) <= new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header mit Add-Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileEdit className="h-5 w-5" />
          HR-Notizen
        </h2>
        {canCreate('employee_hr_notes') && (
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Notiz erstellen
          </Button>
        )}
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{statistics.total}</p>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </div>
          </CardContent>
        </Card>
        {Object.entries(statistics.byCategory).slice(0, 3).map(([category, count]) => (
          <Card key={category}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{count as number}</p>
                <p className="text-xs text-muted-foreground">{category}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notizen nach Kategorie */}
      {Object.entries(byCategory).map(([category, categoryNotes]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileEdit className="h-5 w-5" />
              {category}
              <Badge variant="secondary" className="ml-2">
                {(categoryNotes as any[]).length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(categoryNotes as any[]).map((note) => (
                <div key={note.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h5 className="font-semibold">{note.title}</h5>
                      <Badge className={getCategoryColor(note.category)}>
                        {note.category}
                      </Badge>
                      {note.is_confidential && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Vertraulich
                        </Badge>
                      )}
                      {isFollowUpDue(note.follow_up_date) && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Wiedervorlage fällig
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {canEdit('employee_hr_notes') && (
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(note)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete('employee_hr_notes') && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setNoteToDelete(note.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Erstellt: {new Date(note.created_at).toLocaleDateString('de-DE')}
                    </div>
                    {note.follow_up_date && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Wiedervorlage: {new Date(note.follow_up_date).toLocaleDateString('de-DE')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {notes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <FileEdit className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine HR-Notizen vorhanden</p>
            {canCreate('employee_hr_notes') && (
              <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Erste Notiz erstellen
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <HRNoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={dialogMode === 'create' ? handleCreate : handleEdit}
        note={selectedNote}
        mode={dialogMode}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>HR-Notiz löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
