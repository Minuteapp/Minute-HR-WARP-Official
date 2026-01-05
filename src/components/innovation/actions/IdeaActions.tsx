import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2, X, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInnovationData } from '@/hooks/useInnovationData';

interface IdeaActionsProps {
  idea: any;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const IdeaActions: React.FC<IdeaActionsProps> = ({ idea, onEdit, onDelete }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [editData, setEditData] = useState({
    title: idea.title || '',
    description: idea.description || '',
    category: idea.category || '',
    priority: idea.priority || 'medium',
    expected_impact: idea.expected_impact || '',
    status: idea.status || 'new'
  });

  const handleEdit = async () => {
    setIsLoading(true);
    try {
      // Hier würde die Update-Logik kommen
      console.log('Updating idea:', idea.id, editData);
      
      toast({
        title: "Erfolg!",
        description: "Idee wurde erfolgreich aktualisiert.",
      });
      
      setIsEditOpen(false);
      onEdit?.();
    } catch (error) {
      console.error('Error updating idea:', error);
      toast({
        title: "Fehler",
        description: "Beim Aktualisieren der Idee ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // Hier würde die Delete-Logik kommen
      console.log('Deleting idea:', idea.id);
      
      toast({
        title: "Erfolg!",
        description: "Idee wurde erfolgreich gelöscht.",
      });
      
      setIsDeleteOpen(false);
      onDelete?.();
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast({
        title: "Fehler",
        description: "Beim Löschen der Idee ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditOpen(true)}
        >
          <Edit className="h-3 w-3 mr-1" />
          Bearbeiten
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsDeleteOpen(true)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Löschen
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Idee bearbeiten
            </DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Details Ihrer Innovation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titel</Label>
              <Input
                id="edit-title"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Beschreibung</Label>
              <Textarea
                id="edit-description"
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Kategorie</Label>
                <Select value={editData.category} onValueChange={(value) => setEditData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technologie">Technologie</SelectItem>
                    <SelectItem value="Prozesse">Prozesse</SelectItem>
                    <SelectItem value="Produkte">Produkte</SelectItem>
                    <SelectItem value="Kundenservice">Kundenservice</SelectItem>
                    <SelectItem value="Nachhaltigkeit">Nachhaltigkeit</SelectItem>
                    <SelectItem value="HR">Personal</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Allgemein">Allgemein</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editData.status} onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Neu</SelectItem>
                    <SelectItem value="under_review">In Prüfung</SelectItem>
                    <SelectItem value="approved">Genehmigt</SelectItem>
                    <SelectItem value="in_development">In Entwicklung</SelectItem>
                    <SelectItem value="pilot_phase">Pilotphase</SelectItem>
                    <SelectItem value="implemented">Umgesetzt</SelectItem>
                    <SelectItem value="rejected">Abgelehnt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-impact">Erwarteter Impact</Label>
              <Textarea
                id="edit-impact"
                value={editData.expected_impact}
                onChange={(e) => setEditData(prev => ({ ...prev, expected_impact: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsEditOpen(false)}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button 
              onClick={handleEdit}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Idee löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie die Idee "{idea.title}" löschen möchten? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Wird gelöscht...' : 'Löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};