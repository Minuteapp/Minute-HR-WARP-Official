import { Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from 'react';
import { ProjectDetailsDialog } from '@/components/projects/ProjectDetailsDialog';
import { useEffectiveRole } from '@/hooks/useEffectiveRole';
import { useOriginalRole } from '@/hooks/useOriginalRole';
import { usePermissionContext } from '@/contexts/PermissionContext';

const ProjectsHeader = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Effektive Rolle aus dem System (berücksichtigt Impersonation)
  const { role: effectiveModuleRole, isAdmin } = useEffectiveRole();
  const { isOriginalSuperAdmin } = useOriginalRole();
  
  // KRITISCH: Rechtematrix für Projekte-Modul
  const { hasPermission } = usePermissionContext();
  
  // Prüfe spezifische Berechtigungen aus der Rechtematrix
  const canCreateProject = useMemo(() => hasPermission('projects', 'create'), [hasPermission]);
  const canEditProject = useMemo(() => hasPermission('projects', 'edit'), [hasPermission]);
  
  // Nur SuperAdmins können die Rolle manuell überschreiben
  const [manualRoleOverride, setManualRoleOverride] = useState<string | null>(null);
  
  // Die tatsächliche Rolle für die Ansicht - KRITISCH: Basiert jetzt auf Rechtematrix
  const role = useMemo(() => {
    if (isOriginalSuperAdmin && manualRoleOverride) {
      return manualRoleOverride;
    }
    // Verwende Rechtematrix statt Rollen-Flags
    if (canCreateProject || canEditProject) return 'admin';
    if (hasPermission('projects', 'view', 'team')) return 'manager';
    return 'member';
  }, [isOriginalSuperAdmin, manualRoleOverride, canCreateProject, canEditProject, hasPermission]);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'manager': return 'Projektmanager';
      case 'member': return 'Teammitglied';
      default: return 'Admin';
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">PROJEKTE</h1>
        <div className="flex items-center gap-2 mt-1">
          {/* Rollen-Switcher nur für SuperAdmins sichtbar */}
          {isOriginalSuperAdmin ? (
            <Select value={role} onValueChange={(value) => setManualRoleOverride(value)}>
              <SelectTrigger className="h-6 text-xs border-none shadow-none p-0 w-auto gap-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Projektmanager</SelectItem>
                <SelectItem value="member">Teammitglied</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs text-muted-foreground">{getRoleLabel(role)}</span>
          )}
          <Badge variant="secondary" className="text-xs bg-muted">
            11 Tabs
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen..."
            className="pl-10"
          />
        </div>
        {/* Neu-Button nur mit create-Berechtigung anzeigen */}
        {canCreateProject && (
          <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
            Neu
          </Button>
        )}
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="outline">Profil</Button>
      </div>

      <ProjectDetailsDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        template={null}
      />
    </div>
  );
};

export default ProjectsHeader;
