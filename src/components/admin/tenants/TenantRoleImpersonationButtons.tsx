import { Button } from "@/components/ui/button";
import { UserCog, Users, Shield, Loader2, User } from "lucide-react";
import { useImpersonationContext } from "@/contexts/ImpersonationContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RoleUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TenantRoleImpersonationButtonsProps {
  tenantId: string;
}

export const TenantRoleImpersonationButtons = ({ tenantId }: TenantRoleImpersonationButtonsProps) => {
  const { isImpersonating, startImpersonation } = useImpersonationContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [usersByRole, setUsersByRole] = useState<{
    teamleiter: RoleUser[];
    hr_admin: RoleUser[];
    admin: RoleUser[];
    employee: RoleUser[];
  }>({
    teamleiter: [],
    hr_admin: [],
    admin: [],
    employee: []
  });

  useEffect(() => {
    loadUsersWithRoles();
  }, [tenantId]);

  const loadUsersWithRoles = async () => {
    try {
      // Lade alle user_roles für den Tenant
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('company_id', tenantId);

      if (rolesError) {
        console.error('Error loading roles:', rolesError);
        return;
      }

      if (!roles || roles.length === 0) {
        return;
      }

      // Lade Profile für alle User
      const userIds = [...new Set(roles.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .in('id', userIds);

      // Lade auch Employees für mehr Infos
      const { data: employees } = await supabase
        .from('employees')
        .select('user_id, first_name, last_name, email')
        .eq('company_id', tenantId)
        .in('user_id', userIds);

      const teamleiter: RoleUser[] = [];
      const hr_admin: RoleUser[] = [];
      const admin: RoleUser[] = [];
      const employee: RoleUser[] = [];

      roles.forEach(r => {
        const profile = profiles?.find(p => p.id === r.user_id);
        const emp = employees?.find(e => e.user_id === r.user_id);
        
        const name = emp 
          ? `${emp.first_name || ''} ${emp.last_name || ''}`.trim()
          : profile?.full_name || profile?.username || 'Unbekannt';
        
        const email = emp?.email || profile?.username || '';

        const user: RoleUser = {
          id: r.user_id,
          name,
          email,
          role: r.role
        };

        const roleLower = r.role.toLowerCase();
        if (roleLower === 'teamleiter' || roleLower === 'team_lead' || roleLower === 'teamlead') {
          teamleiter.push(user);
        } else if (roleLower === 'hr_admin' || roleLower === 'hr-admin' || roleLower === 'hradmin') {
          hr_admin.push(user);
        } else if (roleLower === 'admin' || roleLower === 'administrator') {
          admin.push(user);
        } else if (roleLower === 'employee' || roleLower === 'mitarbeiter') {
          employee.push(user);
        }
      });

      setUsersByRole({ teamleiter, hr_admin, admin, employee });
    } catch (error) {
      console.error('Error loading users with roles:', error);
    }
  };

  const handleImpersonate = async (userId: string, roleName: string) => {
    if (isImpersonating) {
      toast({
        variant: "destructive",
        title: "Bereits aktiv",
        description: "Beenden Sie zuerst die aktuelle Impersonation-Session.",
      });
      return;
    }

    setLoading(true);
    try {
      const success = await startImpersonation({
        targetUserId: userId,
        targetTenantId: tenantId,
        mode: 'view_only',
        justification: `Tunneln als ${roleName} aus Mandanten-Verwaltung`,
        justificationType: 'support',
        durationMinutes: 30,
        isPreTenant: false
      });

      if (success) {
        toast({
          title: "Tunneln erfolgreich",
          description: `Sie sehen jetzt die Ansicht als ${roleName}.`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderRoleButton = (
    users: RoleUser[],
    roleName: string,
    icon: React.ReactNode,
    colorClass: string
  ) => {
    if (users.length === 0) {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="opacity-50"
        >
          {icon}
          <span className="ml-2">{roleName}</span>
          <span className="ml-1 text-xs text-muted-foreground">(0)</span>
        </Button>
      );
    }

    if (users.length === 1) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleImpersonate(users[0].id, roleName)}
          disabled={loading || isImpersonating}
          className={colorClass}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
          <span className="ml-2">{roleName}</span>
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={loading || isImpersonating}
            className={colorClass}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
            <span className="ml-2">{roleName}</span>
            <span className="ml-1 text-xs">({users.length})</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Nutzer auswählen</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {users.map(user => (
            <DropdownMenuItem
              key={user.id}
              onClick={() => handleImpersonate(user.id, roleName)}
            >
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-2">Tunneln als:</span>
      
      {renderRoleButton(
        usersByRole.admin,
        "Admin",
        <Shield className="h-4 w-4" />,
        "border-red-300 hover:border-red-500 hover:bg-red-50"
      )}
      
      {renderRoleButton(
        usersByRole.hr_admin,
        "HR Admin",
        <Users className="h-4 w-4" />,
        "border-purple-300 hover:border-purple-500 hover:bg-purple-50"
      )}
      
      {renderRoleButton(
        usersByRole.teamleiter,
        "Teamleiter",
        <UserCog className="h-4 w-4" />,
        "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
      )}
      
      {renderRoleButton(
        usersByRole.employee,
        "Mitarbeiter",
        <User className="h-4 w-4" />,
        "border-green-300 hover:border-green-500 hover:bg-green-50"
      )}
    </div>
  );
};
