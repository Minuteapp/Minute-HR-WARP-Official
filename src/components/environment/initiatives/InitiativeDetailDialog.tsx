
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, CircleDashed, Clock, DollarSign, Pin, AlignLeft, Users, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Initiative {
  id: string;
  title: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
  progress: number;
  responsible?: string;
  budget?: number;
  tags?: string[];
}

interface InitiativeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initiative: Initiative;
  onUpdate: (initiative: Initiative) => void;
  onDelete: (id: string) => void;
}

export const InitiativeDetailDialog: React.FC<InitiativeDetailDialogProps> = ({
  open,
  onOpenChange,
  initiative,
  onUpdate,
  onDelete
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in-progress':
      case 'in_progress':
      case 'inprogress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'planned':
        return 'bg-amber-100 text-amber-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in-progress':
      case 'in_progress':
      case 'inprogress':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'planned':
        return <CircleDashed className="h-4 w-4" />;
      default:
        return <CircleDashed className="h-4 w-4" />;
    }
  };

  const handleEdit = () => {
    // Implementiere Bearbeiten-Logik hier
    onOpenChange(false);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete(initiative.id);
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{initiative.title}</DialogTitle>
            <DialogDescription>
              <Badge variant="outline" className={getStatusColor(initiative.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(initiative.status)}
                  {initiative.status === 'in-progress' ? 'In Bearbeitung' : 
                   initiative.status === 'completed' ? 'Abgeschlossen' :
                   initiative.status === 'planned' ? 'Geplant' :
                   initiative.status === 'archived' ? 'Archiviert' :
                   initiative.status}
                </span>
              </Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <AlignLeft className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Beschreibung</h4>
                  <p className="text-gray-600 mt-1">{initiative.description || 'Keine Beschreibung vorhanden.'}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Zeitraum</h4>
                  <p className="text-gray-600 mt-1">
                    {formatDate(initiative.startDate)} - {initiative.endDate ? formatDate(initiative.endDate) : 'Fortlaufend'}
                  </p>
                </div>
              </div>
            </div>

            {initiative.responsible && (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Verantwortliche Person</h4>
                    <p className="text-gray-600 mt-1">{initiative.responsible}</p>
                  </div>
                </div>
              </div>
            )}

            {initiative.budget !== undefined && (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <DollarSign className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Budget</h4>
                    <p className="text-gray-600 mt-1">{initiative.budget.toFixed(2)} €</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Fortschritt</span>
                <span>{initiative.progress}%</span>
              </div>
              <Progress value={initiative.progress} className="h-2" />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button variant="destructive" onClick={handleDelete} className="flex items-center gap-1">
              <Trash2 className="h-4 w-4" />
              Löschen
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Schließen
              </Button>
              <Button onClick={handleEdit}>
                Bearbeiten
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Initiative löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du die Initiative "{initiative.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
