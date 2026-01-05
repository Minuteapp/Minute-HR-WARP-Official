import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import { Shield, Crown, UserCheck, Briefcase, Calculator, Users, UserCog } from 'lucide-react';
import { logRoleChange } from '@/utils/security/audit-logger';

// Alle verfügbaren Rollen mit Beschreibungen
const AVAILABLE_ROLES = [
  { value: 'superadmin', label: 'Super Admin', description: 'Vollzugriff auf alle Mandanten', icon: Crown, color: 'bg-purple-100 text-purple-800' },
  { value: 'admin', label: 'Admin', description: 'Vollzugriff auf Unternehmensdaten', icon: Shield, color: 'bg-red-100 text-red-800' },
  { value: 'hr_admin', label: 'HR Admin', description: 'Vollzugriff auf HR-Funktionen', icon: UserCog, color: 'bg-blue-100 text-blue-800' },
  { value: 'hr_manager', label: 'HR Manager', description: 'HR-Verwaltung ohne Admin-Rechte', icon: Users, color: 'bg-cyan-100 text-cyan-800' },
  { value: 'hr', label: 'HR', description: 'Grundlegende HR-Funktionen', icon: Users, color: 'bg-teal-100 text-teal-800' },
  { value: 'manager', label: 'Manager', description: 'Team- und Abteilungsleitung', icon: Briefcase, color: 'bg-orange-100 text-orange-800' },
  { value: 'team_lead', label: 'Teamleiter', description: 'Teamverwaltung und Genehmigungen', icon: UserCheck, color: 'bg-amber-100 text-amber-800' },
  { value: 'finance_controller', label: 'Finance Controller', description: 'Zugriff auf Finanzdaten', icon: Calculator, color: 'bg-green-100 text-green-800' },
  { value: 'employee', label: 'Mitarbeiter', description: 'Standard-Mitarbeiterzugang', icon: Users, color: 'bg-gray-100 text-gray-800' },
] as const;

// Welche Rollen darf wer vergeben
const ROLE_ASSIGNMENT_PERMISSIONS: Record<string, string[]> = {
  superadmin: ['superadmin', 'admin', 'hr_admin', 'hr_manager', 'hr', 'manager', 'team_lead', 'finance_controller', 'employee'],
  admin: ['admin', 'hr_admin', 'hr_manager', 'hr', 'manager', 'team_lead', 'finance_controller', 'employee'],
  hr_admin: ['hr_manager', 'hr', 'manager', 'team_lead', 'employee'],
  hr_manager: ['team_lead', 'employee'],
};

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
  role?: string;
}

interface RoleChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  currentUserRole?: string;
  onSuccess: () => void;
}

export const RoleChangeDialog: React.FC<RoleChangeDialogProps> = ({
  open,
  onOpenChange,
  user,
  currentUserRole = 'employee',
  onSuccess,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>(user?.role || 'employee');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { tenantCompany } = useTenant();

  // Ermittle welche Rollen der aktuelle Benutzer vergeben darf
  const allowedRoles = ROLE_ASSIGNMENT_PERMISSIONS[currentUserRole] || [];
  const availableRolesFiltered = AVAILABLE_ROLES.filter(role => 
    allowedRoles.includes(role.value)
  );

  const handleSave = async () => {
    if (!user || !tenantCompany?.id) return;
    
    setSaving(true);
    try {
      const oldRole = user.role || 'employee';
      
      // Update in user_roles Tabelle
      const { error } = await supabase
        .from('user_roles')
        .update({ role: selectedRole as any })
        .eq('user_id', user.id)
        .eq('company_id', tenantCompany.id);

      if (error) throw error;

      // Audit-Logging
      try {
        await logRoleChange(user.id, oldRole, selectedRole);
      } catch (auditError) {
        console.warn('Audit-Log konnte nicht geschrieben werden:', auditError);
      }

      toast({
        title: 'Rolle geändert',
        description: `Die Rolle wurde erfolgreich auf "${selectedRole}" geändert.`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Fehler beim Ändern der Rolle:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Die Rolle konnte nicht geändert werden.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset selected role when user changes
  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role || 'employee');
    }
  }, [user]);

  if (!user) return null;

  const currentRoleInfo = AVAILABLE_ROLES.find(r => r.value === user.role);
  const selectedRoleInfo = AVAILABLE_ROLES.find(r => r.value === selectedRole);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Rolle ändern
          </DialogTitle>
          <DialogDescription>
            Ändern Sie die Zugriffsrechte für diesen Benutzer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Benutzer-Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg">
              {user.user_metadata?.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{user.user_metadata?.full_name || 'Unbekannt'}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              {currentRoleInfo && (
                <Badge className={`${currentRoleInfo.color} mt-1`}>
                  Aktuelle Rolle: {currentRoleInfo.label}
                </Badge>
              )}
            </div>
          </div>

          {/* Rollenauswahl */}
          <div className="space-y-2">
            <Label>Neue Rolle auswählen</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Rolle auswählen" />
              </SelectTrigger>
              <SelectContent>
                {availableRolesFiltered.map(role => {
                  const Icon = role.icon;
                  return (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{role.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {/* Beschreibung der ausgewählten Rolle */}
            {selectedRoleInfo && (
              <p className="text-sm text-muted-foreground mt-2">
                {selectedRoleInfo.description}
              </p>
            )}
          </div>

          {/* Warnung bei Upgrade zu Admin-Rollen */}
          {(selectedRole === 'admin' || selectedRole === 'hr_admin' || selectedRole === 'superadmin') && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Achtung:</strong> Diese Rolle gewährt erweiterte Administratorrechte. 
                Stellen Sie sicher, dass der Benutzer diese Berechtigungen benötigt.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={saving || selectedRole === user.role}>
            {saving ? 'Speichern...' : 'Rolle speichern'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
