import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Shield, 
  Settings, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Save,
  X
} from "lucide-react";
import { 
  isValidEmail, 
  isValidUUID, 
  isValidRole, 
  sanitizeSearchTerm,
  validateStringLength,
  escapeHtml
} from "@/utils/security/input-validation";
import { logSecurityEvent, logRoleChange } from "@/utils/security/audit-logger";

interface UserData {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string;
  first_name?: string;
  last_name?: string;
}

interface SecurityLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  success: boolean;
  details: any;
  created_at: string;
}

const SecureUserManagement = () => {
  const { user } = useAuth();
  const { isSuperAdmin, isAdmin } = useRolePermissions();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSecurityLogs, setShowSecurityLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<SecurityLog[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "employee"
  });

  // Sicherheitsprüfung: Nur SuperAdmins und Admins haben Zugang
  useEffect(() => {
    if (!user) {
      return;
    }

    if (!isSuperAdmin && !isAdmin) {
      logSecurityEvent({
        action: 'unauthorized_access_attempt',
        resourceType: 'user_management',
        success: false,
        details: {
          attemptedBy: user?.email || 'anonymous',
          userRole: isSuperAdmin ? 'superadmin' : isAdmin ? 'admin' : 'unauthorized'
        }
      });
      return;
    }

    loadUsers();
    if (isSuperAdmin) {
      loadAuditLogs();
    }
  }, [user, isSuperAdmin, isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Sichere Abfrage mit RLS - nur Rollen-Informationen
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          created_at,
          updated_at
        `);

      if (error) {
        throw error;
      }

      // Benutzerinformationen aus Profilen laden (falls vorhanden)
      const usersWithDetails: UserData[] = [];
      
      for (const userRole of userRoles || []) {
        if (isValidUUID(userRole.user_id)) {
          // Keine Mock-Namen - echte Benutzerdaten sollten aus der DB geladen werden
          const userDetails: UserData = {
            id: userRole.user_id,
            email: `user-${userRole.user_id.substring(0, 8)}@company.com`,
            role: userRole.role,
            created_at: userRole.created_at,
            first_name: "",
            last_name: ""
          };
          usersWithDetails.push(userDetails);
        }
      }

      setUsers(usersWithDetails);
      
      // Erfolgreichen Zugriff protokollieren
      await logSecurityEvent({
        action: 'user_list_accessed',
        resourceType: 'user_management',
        success: true,
        details: { userCount: usersWithDetails.length }
      });
      
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Benutzer konnten nicht geladen werden."
      });
      
      await logSecurityEvent({
        action: 'user_list_access_failed',
        resourceType: 'user_management',
        success: false,
        details: { error: String(error) }
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    if (!isSuperAdmin) return;
    
    try {
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Audit-Logs:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Eingabe-Validierung mit Sicherheits-Utilities
    if (!isValidUUID(userId)) {
      toast({
        variant: "destructive",
        title: "Sicherheitsfehler",
        description: "Ungültige Benutzer-ID erkannt."
      });
      
      await logSecurityEvent({
        action: 'invalid_input_detected',
        resourceType: 'user_role',
        success: false,
        details: { invalidUserId: userId, attemptedRole: newRole }
      });
      return;
    }

    if (!isValidRole(newRole)) {
      toast({
        variant: "destructive",
        title: "Sicherheitsfehler",
        description: "Ungültige Rolle erkannt."
      });
      
      await logSecurityEvent({
        action: 'invalid_role_detected',
        resourceType: 'user_role',
        success: false,
        details: { userId, invalidRole: newRole }
      });
      return;
    }

    // Nur SuperAdmins können Rollen ändern
    if (!isSuperAdmin) {
      await logSecurityEvent({
        action: 'unauthorized_role_change_attempt',
        resourceType: 'user_role',
        resourceId: userId,
        success: false,
        details: { attemptedRole: newRole }
      });
      
      toast({
        variant: "destructive",
        title: "Berechtigung verweigert",
        description: "Nur SuperAdmins können Rollen ändern."
      });
      return;
    }

    try {
      const currentUser = users.find(u => u.id === userId);
      if (!currentUser) return;

      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      // Audit-Log über Trigger wird automatisch erstellt
      await logRoleChange(userId, currentUser.role, newRole);
      
      // UI aktualisieren
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      toast({
        title: "Rolle geändert",
        description: `Benutzerrolle wurde erfolgreich zu ${newRole} geändert.`
      });
      
    } catch (error) {
      console.error('Fehler beim Ändern der Rolle:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Rolle konnte nicht geändert werden."
      });
    }
  };

  const handleCreateUser = async () => {
    // Sichere Input-Validierung
    const email = newUserForm.email.trim();
    const firstName = sanitizeSearchTerm(newUserForm.firstName);
    const lastName = sanitizeSearchTerm(newUserForm.lastName);
    const role = newUserForm.role;

    // Validierungen
    if (!isValidEmail(email)) {
      toast({
        variant: "destructive",
        title: "Ungültige E-Mail",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein."
      });
      return;
    }

    if (!validateStringLength(firstName, 1, 50) || !validateStringLength(lastName, 1, 50)) {
      toast({
        variant: "destructive",
        title: "Ungültige Eingabe",
        description: "Vor- und Nachname müssen zwischen 1 und 50 Zeichen lang sein."
      });
      return;
    }

    if (!isValidRole(role)) {
      toast({
        variant: "destructive",
        title: "Ungültige Rolle",
        description: "Die ausgewählte Rolle ist nicht gültig."
      });
      return;
    }

    // Nur SuperAdmins können Benutzer erstellen
    if (!isSuperAdmin) {
      toast({
        variant: "destructive",
        title: "Berechtigung verweigert",
        description: "Nur SuperAdmins können Benutzer erstellen."
      });
      return;
    }

    // TODO: Implementierung der Benutzererstellung über sichere RPC-Funktion
    toast({
      title: "Feature in Entwicklung",
      description: "Die Benutzererstellung wird implementiert."
    });

    // Form zurücksetzen
    setNewUserForm({
      email: "",
      firstName: "",
      lastName: "",
      role: "employee"
    });
  };

  // Sichere Suchfunktion
  const filteredUsers = users.filter(user => {
    const safeTerm = sanitizeSearchTerm(searchTerm.toLowerCase());
    return user.email.toLowerCase().includes(safeTerm) ||
           user.role.toLowerCase().includes(safeTerm) ||
           (user.first_name?.toLowerCase().includes(safeTerm)) ||
           (user.last_name?.toLowerCase().includes(safeTerm));
  });

  // Sicherheitsprüfung für Komponenten-Rendering
  if (!user || (!isSuperAdmin && !isAdmin)) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Sie haben keine Berechtigung, auf die Benutzerverwaltung zuzugreifen.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sicherheitswarnung für Nicht-SuperAdmins */}
      {isAdmin && !isSuperAdmin && (
        <Alert className="bg-yellow-50 border-yellow-400">
          <Shield className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Als Admin können Sie Benutzerinformationen einsehen, aber keine Änderungen vornehmen.
          </AlertDescription>
        </Alert>
      )}

      {/* Hauptstatistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Gesamt Benutzer</div>
            <div className="text-2xl font-semibold text-blue-600">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">SuperAdmins</div>
            <div className="text-2xl font-semibold text-red-600">
              {users.filter(u => u.role === 'superadmin').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Admins</div>
            <div className="text-2xl font-semibold text-orange-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Mitarbeiter</div>
            <div className="text-2xl font-semibold text-green-600">
              {users.filter(u => u.role === 'employee').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suchfunktion */}
      <Card>
        <CardHeader>
          <CardTitle>Benutzer suchen</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Nach E-Mail, Name oder Rolle suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Neuen Benutzer erstellen (nur SuperAdmin) */}
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Neuen Benutzer erstellen
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="new-email">E-Mail</Label>
              <Input
                id="new-email"
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                placeholder="benutzer@example.com"
              />
            </div>
            <div>
              <Label htmlFor="new-firstname">Vorname</Label>
              <Input
                id="new-firstname"
                value={newUserForm.firstName}
                onChange={(e) => setNewUserForm({...newUserForm, firstName: e.target.value})}
                placeholder="Max"
              />
            </div>
            <div>
              <Label htmlFor="new-lastname">Nachname</Label>
              <Input
                id="new-lastname"
                value={newUserForm.lastName}
                onChange={(e) => setNewUserForm({...newUserForm, lastName: e.target.value})}
                placeholder="Mustermann"
              />
            </div>
            <div>
              <Label htmlFor="new-role">Rolle</Label>
              <Select value={newUserForm.role} onValueChange={(value) => setNewUserForm({...newUserForm, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">SuperAdmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreateUser} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Erstellen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benutzerliste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Benutzerliste ({filteredUsers.length})
            </span>
            {isSuperAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSecurityLogs(!showSecurityLogs)}
              >
                {showSecurityLogs ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showSecurityLogs ? 'Logs ausblenden' : 'Security Logs'}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Lade Benutzerdaten...</div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((userData) => (
                <div key={userData.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium">{escapeHtml(userData.email)}</div>
                    <div className="text-sm text-gray-500">
                      {userData.first_name && userData.last_name && (
                        <span>{escapeHtml(userData.first_name)} {escapeHtml(userData.last_name)} • </span>
                      )}
                      Rolle: <span className="font-medium">{userData.role}</span> • 
                      Erstellt: {new Date(userData.created_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  {isSuperAdmin && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={userData.role}
                        onValueChange={(value) => handleRoleChange(userData.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="superadmin">SuperAdmin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Audit Logs (nur für SuperAdmins) */}
      {isSuperAdmin && showSecurityLogs && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Sicherheits-Audit-Protokoll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="border rounded p-3 text-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.success ? 'Erfolg' : 'Fehler'}
                      </span>
                      <span className="font-medium">{log.action}</span>
                      <span className="text-gray-500">({log.resource_type})</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleString('de-DE')}
                    </span>
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Keine Audit-Logs verfügbar
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecureUserManagement;