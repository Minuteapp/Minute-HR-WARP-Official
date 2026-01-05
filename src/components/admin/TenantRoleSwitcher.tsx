import { Badge } from '@/components/ui/badge';
import { useTenantRolePreview } from '@/hooks/useTenantRolePreview';
import { UserRole } from '@/hooks/useRolePreview';
import { LogOut, UserCog, Users, BarChart3, User, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const getRoleIcon = (role: UserRole | 'normal') => {
  const icons = {
    admin: <UserCog className="h-4 w-4" />,
    hr: <Users className="h-4 w-4" />,
    manager: <BarChart3 className="h-4 w-4" />,
    employee: <User className="h-4 w-4" />,
    normal: <LogOut className="h-4 w-4" />,
  };
  return icons[role] || <User className="h-4 w-4" />;
};

export const TenantRoleSwitcher = () => {
  const {
    canUseTenantRolePreview,
    availableRoles,
    currentPreviewRole,
    isLoading,
    switchToRole,
    exitPreview,
    getRoleLabel
  } = useTenantRolePreview();

  // Nicht anzeigen wenn keine Berechtigung
  if (!canUseTenantRolePreview) {
    return null;
  }

  const handleRoleChange = (value: string) => {
    if (value === 'normal') {
      exitPreview();
    } else {
      switchToRole(value as UserRole);
    }
  };

  const currentValue = currentPreviewRole || 'normal';

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 border-b border-border">
      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
        🎭 Preview-Modus
      </Badge>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Lade Rollen...</span>
        </div>
      ) : (
        <Select value={currentValue} onValueChange={handleRoleChange} disabled={isLoading}>
          <SelectTrigger className="w-[240px] h-9">
            <div className="flex items-center gap-2">
              {getRoleIcon(currentValue as UserRole | 'normal')}
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((role) => (
              <SelectItem key={role} value={role}>
                <div className="flex items-center gap-2">
                  {getRoleIcon(role)}
                  <span>{getRoleLabel(role)}</span>
                </div>
              </SelectItem>
            ))}
            <SelectItem value="normal">
              <div className="flex items-center gap-2">
                {getRoleIcon('normal')}
                <span className="font-medium">Zurück zu SuperAdmin</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
