import { AlertTriangle, Calendar, MapPin, Clock, FileText, CheckCircle, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Exception } from './ExceptionCard';

interface ExceptionDetailDialogProps {
  exception: Exception | null;
  open: boolean;
  onClose: () => void;
  onMarkResolved: (id: string) => void;
}

const ExceptionDetailDialog = ({ exception, open, onClose, onMarkResolved }: ExceptionDetailDialogProps) => {
  if (!exception) return null;

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'hoch':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'mittel':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-blue-500 text-white hover:bg-blue-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Ausnahme-Details
          </DialogTitle>
          <DialogDescription>
            Detaillierte Informationen zur Ausnahme
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Priority and Status Badges */}
          <div className="flex gap-2">
            <Badge className={getPriorityBadgeStyle(exception.priority)}>
              {exception.priority.charAt(0).toUpperCase() + exception.priority.slice(1)} Priorität
            </Badge>
            <Badge variant="outline">
              {exception.status === 'offen' ? 'Offen' : 'Gelöst'}
            </Badge>
          </div>

          {/* Employee Info Card */}
          <div className="bg-yellow-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-yellow-200">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{exception.employeeName}</p>
                <p className="text-sm text-muted-foreground">ID: {exception.employeeId}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Datum:</span>
                <span className="font-medium">{exception.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Standort:</span>
                <span className="font-medium">{exception.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Betroffene Stunden:</span>
                <span className="font-medium">{exception.affectedHours}</span>
              </div>
            </div>
          </div>

          {/* Problem Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">Problem</span>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-sm">{exception.problem}</p>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Details</span>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">{exception.details}</p>
            </div>
          </div>

          {/* Required Actions Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-semibold">Erforderliche Maßnahmen</span>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm">{exception.requiredActions}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              className="flex-1"
              onClick={() => {
                onMarkResolved(exception.id);
                onClose();
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Als gelöst markieren
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExceptionDetailDialog;
