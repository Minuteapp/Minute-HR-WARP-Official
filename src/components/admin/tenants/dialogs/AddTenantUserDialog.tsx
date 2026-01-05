import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateTenantUser } from "@/hooks/useCreateTenantUser";
import { Loader2, FlaskConical, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

interface AddTenantUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName?: string;
  onSuccess?: () => void;
}

interface CreatedUserInfo {
  email: string;
  password: string;
  fullName: string;
  role: string;
  userId: string;
}

export const AddTenantUserDialog = ({ open, onOpenChange, tenantId, tenantName, onSuccess }: AddTenantUserDialogProps) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("employee");
  const [department, setDepartment] = useState("");
  const [team, setTeam] = useState("");
  const [position, setPosition] = useState("");
  const [isTestUser, setIsTestUser] = useState(true);
  const [createdUser, setCreatedUser] = useState<CreatedUserInfo | null>(null);
  
  const { mutate: createUser, isPending } = useCreateTenantUser();

  const resetForm = () => {
    setEmail("");
    setFullName("");
    setPassword("");
    setRole("employee");
    setDepartment("");
    setTeam("");
    setPosition("");
    setCreatedUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let userEmail = email;
    let userPassword = password;
    
    // Bei Test-Nutzer werden E-Mail und Passwort automatisch generiert
    if (isTestUser) {
      const uniqueId = crypto.randomUUID().slice(0, 8);
      userEmail = `test-${uniqueId}@tenant-${tenantId.slice(0, 8)}.local`;
      userPassword = crypto.randomUUID();
    }
    
    createUser(
      { 
        email: userEmail, 
        fullName, 
        password: userPassword, 
        role, 
        companyId: tenantId,
        isTestUser,
        department: department || undefined,
        team: team || undefined,
        position: position || undefined
      },
      {
        onSuccess: (data) => {
          // Speichere die Zugangsdaten für Test-User
          if (isTestUser) {
            setCreatedUser({
              email: userEmail,
              password: userPassword,
              fullName,
              role,
              userId: data.userId
            });
          } else {
            resetForm();
            onOpenChange(false);
            onSuccess?.();
          }
        }
      }
    );
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
    if (createdUser) {
      onSuccess?.();
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopiert`);
  };

  // Erfolgsansicht nach Erstellung eines Test-Users
  if (createdUser) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Test-Nutzer erstellt
            </DialogTitle>
            <DialogDescription>
              Speichern Sie diese Zugangsdaten - das Passwort wird nicht erneut angezeigt.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{createdUser.fullName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Rolle</p>
                  <p className="font-medium capitalize">{createdUser.role}</p>
                </div>
              </div>
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">E-Mail</p>
                    <p className="font-mono text-sm truncate">{createdUser.email}</p>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => copyToClipboard(createdUser.email, "E-Mail")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Passwort</p>
                    <p className="font-mono text-sm truncate">{createdUser.password}</p>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => copyToClipboard(createdUser.password, "Passwort")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Sie können diesen Nutzer jetzt über <strong>Impersonation</strong> testen oder sich direkt mit diesen Zugangsdaten einloggen.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neuen Nutzer hinzufügen</DialogTitle>
          <DialogDescription>
            Erstellen Sie einen neuen Nutzer für {tenantName ? `"${tenantName}"` : "diese Firma"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Test-Nutzer Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="testUser" className="text-sm font-medium cursor-pointer">
                  Test-Nutzer
                </Label>
                <p className="text-xs text-muted-foreground">
                  Für Impersonation - keine echte E-Mail nötig
                </p>
              </div>
            </div>
            <Switch
              id="testUser"
              checked={isTestUser}
              onCheckedChange={setIsTestUser}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="fullName">Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Max Mustermann"
                required
              />
            </div>

            {/* E-Mail und Passwort nur anzeigen wenn kein Test-Nutzer */}
            {!isTestUser && (
              <>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="max@beispiel.de"
                    required={!isTestUser}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="password">Passwort *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                    minLength={6}
                    required={!isTestUser}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Rolle *</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Rolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Mitarbeiter</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="z.B. Entwickler"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Abteilung</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="z.B. IT"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Input
                id="team"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="z.B. Frontend"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isTestUser ? "Test-Nutzer erstellen" : "Nutzer erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
