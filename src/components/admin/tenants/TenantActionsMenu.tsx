import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Lock, Unlock, Archive, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface TenantActionsMenuProps {
  tenantId: string;
  tenantName: string;
  status: string;
  onEdit?: () => void;
  onActionComplete?: () => void | Promise<void>;
}

export const TenantActionsMenu = ({ tenantId, tenantName, status, onEdit, onActionComplete }: TenantActionsMenuProps) => {
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: string; title: string; description: string }>({
    open: false,
    action: '',
    title: '',
    description: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAction = async (action: string) => {
    try {
      switch (action) {
        case 'suspend':
          await supabase
            .from('companies')
            .update({ is_active: false })
            .eq('id', tenantId);
          toast({ title: 'Mandant gesperrt', description: `${tenantName} wurde gesperrt.` });
          break;

        case 'activate':
          await supabase
            .from('companies')
            .update({ is_active: true })
            .eq('id', tenantId);
          toast({ title: 'Mandant aktiviert', description: `${tenantName} wurde aktiviert.` });
          break;

        case 'archive':
          await supabase
            .from('companies')
            .update({ is_active: false, subscription_status: 'archived' })
            .eq('id', tenantId);
          toast({ title: 'Mandant archiviert', description: `${tenantName} wurde archiviert.` });
          break;

        case 'delete':
          // Soft delete - deleted_at Timestamp setzen
          await supabase
            .from('companies')
            .update({ deleted_at: new Date().toISOString(), is_active: false })
            .eq('id', tenantId);
          toast({ title: 'Mandant gelöscht', description: `${tenantName} wurde gelöscht.`, variant: 'destructive' });
          break;

        case 'reset':
          // Passwort-Reset für alle Admins anfordern
          toast({ title: 'Reset angefordert', description: `Passwort-Reset für Admins von ${tenantName} wurde angefordert.` });
          break;
      }

      queryClient.invalidateQueries({ queryKey: ['companies-overview'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-stats'] });
      await onActionComplete?.();
      setConfirmDialog({ open: false, action: '', title: '', description: '' });
    } catch (error) {
      console.error('Error performing action:', error);
      toast({ title: 'Fehler', description: 'Die Aktion konnte nicht ausgeführt werden.', variant: 'destructive' });
    }
  };

  const openConfirmDialog = (action: string, title: string, description: string) => {
    setConfirmDialog({ open: true, action, title, description });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Bearbeiten
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {status === 'suspended' ? (
            <DropdownMenuItem onClick={() => openConfirmDialog('activate', 'Mandant aktivieren', `Möchten Sie "${tenantName}" wieder aktivieren?`)}>
              <Unlock className="w-4 h-4 mr-2" />
              Aktivieren
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => openConfirmDialog('suspend', 'Mandant sperren', `Möchten Sie "${tenantName}" sperren? Benutzer können sich nicht mehr anmelden.`)}>
              <Lock className="w-4 h-4 mr-2" />
              Sperren
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => openConfirmDialog('reset', 'Passwort-Reset', `Möchten Sie einen Passwort-Reset für alle Admins von "${tenantName}" anfordern?`)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Admin-Reset
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => openConfirmDialog('archive', 'Mandant archivieren', `Möchten Sie "${tenantName}" archivieren? Der Mandant wird deaktiviert.`)}>
            <Archive className="w-4 h-4 mr-2" />
            Archivieren
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600"
            onClick={() => openConfirmDialog('delete', 'Mandant löschen', `Möchten Sie "${tenantName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleAction(confirmDialog.action)}
              className={confirmDialog.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Bestätigen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
