import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CheckCircle, Clock, Loader2, UserCog, XCircle, Mail, FlaskConical } from "lucide-react";
import { useTenantUsers } from "@/hooks/useTenantDetails";
import { AddTenantUserDialog } from "../dialogs/AddTenantUserDialog";
import { InviteUserDialog } from "../dialogs/InviteUserDialog";
import { useQueryClient } from "@tanstack/react-query";
import { useImpersonationContext } from "@/contexts/ImpersonationContext";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface TenantNutzerAdminsTabProps {
  tenantId?: string;
}

export const TenantNutzerAdminsTab = ({ tenantId }: TenantNutzerAdminsTabProps) => {
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { data: users, isLoading, refetch } = useTenantUsers(tenantId);
  const queryClient = useQueryClient();
  const { isImpersonating, startImpersonation } = useImpersonationContext();
  const { toast } = useToast();

  const handleUserAdded = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['tenant-users', tenantId] });
  };

  const handleImpersonateUser = async (userId: string, hasAuthAccount: boolean) => {
    if (!hasAuthAccount) {
      toast({
        variant: "destructive",
        title: "Tunneln nicht möglich",
        description: "Dieser Nutzer hat keinen Login-Account.",
      });
      return;
    }

    if (!tenantId) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Tenant-ID nicht gefunden",
      });
      return;
    }

    const success = await startImpersonation({
      targetUserId: userId,
      targetTenantId: tenantId,
      mode: 'view_only',
      justification: 'Direkter Zugriff aus Mandanten-Verwaltung',
      justificationType: 'support',
      durationMinutes: 30,
      isPreTenant: false
    });

    if (success) {
      toast({
        title: "Tunneln erfolgreich",
        description: "Sie sehen jetzt die Ansicht des Benutzers.",
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!tenantId) return;
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)
        .eq('company_id', tenantId);

      if (error) throw error;

      toast({
        title: "Rolle geändert",
        description: `Benutzerrolle wurde auf "${newRole}" geändert.`,
      });
      
      refetch();
      queryClient.invalidateQueries({ queryKey: ['tenant-users', tenantId] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Rolle konnte nicht geändert werden.",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const roleLower = role.toLowerCase();
    if (roleLower === 'admin' || roleLower === 'administrator') return "border-red-500 text-red-600";
    if (roleLower === 'hr_admin' || roleLower === 'hr-admin') return "border-purple-500 text-purple-600";
    if (roleLower === 'teamleiter' || roleLower === 'team_lead') return "border-blue-500 text-blue-600";
    return "border-green-500 text-green-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{users?.length || 0} Nutzer</p>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowInviteDialog(true)}
          >
            <Mail className="w-4 h-4 mr-2" />
            Einladen
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowAddUserDialog(true)}
          >
            <FlaskConical className="w-4 h-4 mr-2" />
            Test-Nutzer
          </Button>
        </div>
      </div>

      <Card className="bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead>Letzter Login</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Keine Nutzer gefunden
                  </TableCell>
                </TableRow>
              ) : (
                (users || []).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.hasAuthAccount ? (
                        <Select
                          defaultValue={user.role.toLowerCase()}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="hr_admin">HR Admin</SelectItem>
                            <SelectItem value="teamleiter">Teamleiter</SelectItem>
                            <SelectItem value="employee">Mitarbeiter</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge 
                          variant="outline" 
                          className={getRoleBadgeColor(user.role)}
                        >
                          {user.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {user.hasAuthAccount ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {user.hasAuthAccount ? "Hat Login-Account" : "Kein Login-Account"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge className={user.status === "Aktiv" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-amber-100 text-amber-700"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.twoFa ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleImpersonateUser(user.id, user.hasAuthAccount)}
                              disabled={isImpersonating || !user.hasAuthAccount}
                              className={`${user.hasAuthAccount ? 'text-primary hover:text-primary/80 hover:bg-primary/10' : 'text-muted-foreground cursor-not-allowed'}`}
                            >
                              <UserCog className="w-4 h-4 mr-1" />
                              Tunneln
                            </Button>
                          </TooltipTrigger>
                          {!user.hasAuthAccount && (
                            <TooltipContent>
                              Tunneln nur für Nutzer mit Login-Account möglich
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {tenantId && (
        <>
          <AddTenantUserDialog
            open={showAddUserDialog}
            onOpenChange={setShowAddUserDialog}
            tenantId={tenantId}
            onSuccess={handleUserAdded}
          />
          <InviteUserDialog
            open={showInviteDialog}
            onOpenChange={setShowInviteDialog}
            tenantId={tenantId}
            onSuccess={handleUserAdded}
          />
        </>
      )}
    </div>
  );
};
