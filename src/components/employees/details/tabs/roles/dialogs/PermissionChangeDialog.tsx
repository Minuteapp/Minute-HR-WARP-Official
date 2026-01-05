import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowRight, X, Eye, Edit, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PermissionChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: string;
  category: string;
  module: string;
  currentLevel: string;
  nextLevel: string;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

const PERMISSION_ICONS: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  none: { 
    icon: <X className="h-5 w-5" />, 
    label: 'Kein Zugriff', 
    color: 'bg-red-100 text-red-600' 
  },
  read: { 
    icon: <Eye className="h-5 w-5" />, 
    label: 'Nur Lesen', 
    color: 'bg-blue-100 text-blue-600' 
  },
  write: { 
    icon: <Edit className="h-5 w-5" />, 
    label: 'Lesen & Schreiben', 
    color: 'bg-green-100 text-green-600' 
  },
  full: { 
    icon: <Check className="h-5 w-5" />, 
    label: 'Voller Zugriff', 
    color: 'bg-green-100 text-green-600' 
  },
};

export const PermissionChangeDialog = ({
  open,
  onOpenChange,
  role,
  category,
  module,
  currentLevel,
  nextLevel,
  onConfirm,
  isLoading = false,
}: PermissionChangeDialogProps) => {
  const [reason, setReason] = useState('');

  const isCriticalChange = 
    (currentLevel === 'full' && nextLevel === 'none') ||
    (currentLevel === 'write' && nextLevel === 'none');

  const handleSubmit = () => {
    if (!reason || reason.length < 20) {
      return;
    }
    onConfirm(reason);
    setReason('');
  };

  const currentPermission = PERMISSION_ICONS[currentLevel];
  const nextPermission = PERMISSION_ICONS[nextLevel];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Berechtigung ändern</DialogTitle>
          <DialogDescription>
            Sie sind dabei, eine Berechtigung in der Rollen-Matrix zu ändern.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Änderungsdetails */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Rolle:</span>
                <p className="font-medium">{role}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Kategorie:</span>
                <p className="font-medium">{category}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Modul:</span>
                <p className="font-medium">{module}</p>
              </div>
            </div>

            {/* Permission Change Visualization */}
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="flex flex-col items-center gap-2">
                <div className={`p-3 rounded-lg ${currentPermission.color}`}>
                  {currentPermission.icon}
                </div>
                <Badge variant="outline">{currentPermission.label}</Badge>
              </div>
              
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              
              <div className="flex flex-col items-center gap-2">
                <div className={`p-3 rounded-lg ${nextPermission.color}`}>
                  {nextPermission.icon}
                </div>
                <Badge variant="outline">{nextPermission.label}</Badge>
              </div>
            </div>
          </div>

          {/* Kritische Änderungs-Warnung */}
          {isCriticalChange && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Kritische Änderung</AlertTitle>
              <AlertDescription>
                Sie entfernen erhebliche Zugriffsrechte für diese Rolle. 
                Betroffene Benutzer verlieren ihre Berechtigungen für dieses Modul.
              </AlertDescription>
            </Alert>
          )}

          {/* Begründungsfeld */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Begründung für diese Änderung * 
              <span className="text-xs text-muted-foreground ml-2">
                (min. 20 Zeichen)
              </span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Beschreiben Sie den Grund für diese Berechtigungsänderung..."
              rows={3}
              className={reason.length > 0 && reason.length < 20 ? 'border-orange-500' : ''}
            />
            {reason.length > 0 && reason.length < 20 && (
              <p className="text-xs text-orange-600">
                Noch {20 - reason.length} Zeichen erforderlich
              </p>
            )}
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
            ℹ️ Diese Änderung wird automatisch protokolliert und ist für Admins 
            im Audit-Log nachvollziehbar.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!reason || reason.length < 20 || isLoading}
            className="bg-black hover:bg-black/90 text-white"
          >
            {isLoading ? 'Wird gespeichert...' : 'Änderung bestätigen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
