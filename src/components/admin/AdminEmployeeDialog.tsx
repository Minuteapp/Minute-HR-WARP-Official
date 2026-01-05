import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Mail, Key, Users, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface AdminEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onSuccess?: () => void;
}

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  employeeNumber: string;
  department: string;
  position: string;
  team: string;
  phone: string;
  role: string;
  password: string;
  sendInvitation: boolean;
}

const AVAILABLE_ROLES = [
  { value: 'employee', label: 'Mitarbeiter', description: 'Standard-Mitarbeiter mit begrenzten Rechten' },
  { value: 'manager', label: 'Manager', description: 'Team-Manager mit erweiterten Rechten' },
  { value: 'hr', label: 'HR', description: 'Personalverwaltung mit HR-Rechten' },
  { value: 'admin', label: 'Administrator', description: 'Vollzugriff auf alle Unternehmensfunktionen' },
  { value: 'finance', label: 'Finanzen', description: 'Zugriff auf Finanz- und Budgetfunktionen' }
];

export const AdminEmployeeDialog = ({ open, onOpenChange, companyId, onSuccess }: AdminEmployeeDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    employeeNumber: '',
    department: '',
    position: '',
    team: '',
    phone: '',
    role: 'employee',
    password: '',
    sendInvitation: true // Standard: Einladungslink
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const generateEmployeeNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    setFormData(prev => ({ ...prev, employeeNumber: `EMP${timestamp}${random}` }));
  };

  const copyInvitationLink = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink);
      toast({
        description: "Einladungslink in die Zwischenablage kopiert."
      });
    }
  };

  const createEmployeeWithAuth = async () => {
    setIsSubmitting(true);
    
    try {
      // Wenn Einladungslink gewählt wurde, temporäres Passwort generieren
      const tempPassword = formData.sendInvitation 
        ? Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)
        : formData.password;

      // 1. Benutzer in Supabase Auth erstellen
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: tempPassword,
        email_confirm: !formData.sendInvitation, // Bei Einladung muss E-Mail bestätigt werden
        user_metadata: {
          full_name: `${formData.firstName} ${formData.lastName}`,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: formData.role
        }
      });

      if (authError) {
        throw authError;
      }

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error('Benutzer-ID konnte nicht erstellt werden');
      }

      // 2. Mitarbeiter in der employees Tabelle erstellen
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert({
          name: `${formData.firstName} ${formData.lastName}`,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          employee_number: formData.employeeNumber,
          department: formData.department,
          position: formData.position,
          team: formData.team,
          phone: formData.phone,
          status: 'active',
          company_id: companyId,
          employment_type: 'full_time',
          start_date: new Date().toISOString().split('T')[0],
          user_id: userId
        })
        .select()
        .single();

      if (employeeError) {
        // Bei Fehler: Auth-Benutzer wieder löschen
        await supabase.auth.admin.deleteUser(userId);
        throw employeeError;
      }

      // 3. Benutzerrolle zuweisen
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: formData.role,
          company_id: companyId
        });

      if (roleError) {
        console.warn('Warnung: Rolle konnte nicht zugewiesen werden:', roleError);
      }

      // 4. Profil erstellen (falls Tabelle existiert)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: formData.email,
          full_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email
        });

      if (profileError) {
        console.warn('Warnung: Profil konnte nicht erstellt werden:', profileError);
      }

      // 5. Admin-Einladung erstellen wenn gewünscht
      if (formData.sendInvitation) {
        const inviteResult = await supabase.rpc('create_admin_invitation', {
          p_email: formData.email,
          p_company_id: companyId,
          p_full_name: `${formData.firstName} ${formData.lastName}`,
          p_phone: formData.phone,
          p_position: formData.position,
          p_salutation: 'Herr/Frau'
        });

        // Einladungslink generieren
        const inviteLink = `${window.location.origin}/auth?invitation=true&email=${encodeURIComponent(formData.email)}&company=${companyId}`;
        setInvitationLink(inviteLink);
        setActiveTab('invitation');
      }

      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      
      toast({
        title: "Mitarbeiter erfolgreich erstellt",
        description: `${formData.firstName} ${formData.lastName} wurde mit der Rolle "${AVAILABLE_ROLES.find(r => r.value === formData.role)?.label}" erstellt.`
      });

      onSuccess?.();
      
      // Dialog nicht schließen wenn Einladung versendet wurde
      if (!formData.sendInvitation) {
        onOpenChange(false);
        resetForm();
      }

    } catch (error: any) {
      console.error('Fehler beim Erstellen des Mitarbeiters:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Mitarbeiter konnte nicht erstellt werden."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      employeeNumber: '',
      department: '',
      position: '',
      team: '',
      phone: '',
      role: 'employee',
      password: '',
      sendInvitation: false
    });
    setInvitationLink(null);
    setActiveTab('basic');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast({
        variant: "destructive",
        description: "Bitte füllen Sie alle Pflichtfelder aus."
      });
      return;
    }

    // Passwort nur prüfen wenn KEIN Einladungslink versendet wird
    if (!formData.sendInvitation && !formData.password.trim()) {
      toast({
        variant: "destructive",
        description: "Bitte geben Sie ein Passwort ein oder aktivieren Sie den Einladungslink."
      });
      return;
    }

    await createEmployeeWithAuth();
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Neuen Mitarbeiter mit Benutzerkonto erstellen
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Grunddaten</TabsTrigger>
            <TabsTrigger value="auth">Anmeldung & Rolle</TabsTrigger>
            <TabsTrigger value="invitation" disabled={!invitationLink}>Einladung</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Persönliche Daten</CardTitle>
                  <CardDescription>
                    Grundlegende Informationen über den neuen Mitarbeiter
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Vorname *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Max"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nachname *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Mustermann"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">E-Mail Adresse *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="max.mustermann@unternehmen.de"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employeeNumber">Mitarbeiternummer</Label>
                      <div className="flex gap-2">
                        <Input
                          id="employeeNumber"
                          value={formData.employeeNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, employeeNumber: e.target.value }))}
                          placeholder="EMP001"
                        />
                        <Button type="button" variant="outline" onClick={generateEmployeeNumber}>
                          Generieren
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+49 123 456789"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Abteilung</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="IT, Marketing, Vertrieb..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                        placeholder="Software Entwickler, Manager..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="team">Team</Label>
                    <Input
                      id="team"
                      value={formData.team}
                      onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
                      placeholder="Frontend Team, Sales Team..."
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="button" onClick={() => setActiveTab('auth')}>
                  Weiter zu Anmeldung & Rolle
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="auth" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Anmeldedaten
                  </CardTitle>
                  <CardDescription>
                    Passwort und Berechtigungen für den neuen Mitarbeiter
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <Switch
                      id="sendInvitation"
                      checked={formData.sendInvitation}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendInvitation: checked }))}
                    />
                    <div className="flex-1">
                      <Label htmlFor="sendInvitation" className="font-semibold">Einladungslink erstellen (Empfohlen)</Label>
                      <p className="text-sm text-muted-foreground">
                        Der Mitarbeiter erhält einen Einladungslink und kann sein eigenes Passwort festlegen
                      </p>
                    </div>
                  </div>

                  {!formData.sendInvitation && (
                    <div>
                      <Label htmlFor="password">Passwort für Sofortzugang *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="password"
                          type="text"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Sicheres Passwort..."
                          required={!formData.sendInvitation}
                        />
                        <Button type="button" variant="outline" onClick={generatePassword}>
                          Generieren
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Das Passwort wird dem Mitarbeiter von Ihnen mitgeteilt.
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="role">Benutzerrolle *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Rolle auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-sm text-muted-foreground">{role.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab('basic')}>
                  Zurück
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Erstelle Mitarbeiter...' : 'Mitarbeiter erstellen'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="invitation" className="space-y-4">
              {invitationLink && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Einladung versendet
                    </CardTitle>
                    <CardDescription>
                      Der Mitarbeiter wurde erfolgreich erstellt. Verwenden Sie den Link unten zur Einladung.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Anmeldedaten für den Mitarbeiter:</Label>
                      <div className="bg-gray-50 p-4 rounded-md space-y-2">
                        <div><strong>E-Mail:</strong> {formData.email}</div>
                        <div><strong>Passwort:</strong> {formData.password}</div>
                        <div><strong>Rolle:</strong> <Badge variant="secondary">{AVAILABLE_ROLES.find(r => r.value === formData.role)?.label}</Badge></div>
                      </div>
                    </div>

                    <div>
                      <Label>Einladungslink:</Label>
                      <div className="flex gap-2">
                        <Input value={invitationLink} readOnly />
                        <Button type="button" variant="outline" onClick={copyInvitationLink}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Senden Sie diesen Link an den Mitarbeiter oder teilen Sie die Anmeldedaten direkt mit.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button type="button" onClick={handleClose}>
                  Fertig
                </Button>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};