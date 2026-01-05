import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuperadminApi } from "@/hooks/useSuperadminApi";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName?: string;
  onSuccess?: () => void;
}

export const InviteUserDialog = ({ open, onOpenChange, tenantId, tenantName, onSuccess }: InviteUserDialogProps) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"employee" | "teamlead" | "hr" | "admin">("employee");
  const [isInvited, setIsInvited] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { inviteUser } = useSuperadminApi();
  const { toast } = useToast();

  const resetForm = () => {
    setEmail("");
    setFullName("");
    setRole("employee");
    setIsInvited(false);
    setInvitedEmail("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await inviteUser(tenantId, {
        email,
        role,
        full_name: fullName || undefined
      });
      
      setInvitedEmail(email);
      setIsInvited(true);
      toast({
        title: "Einladung gesendet",
        description: `Eine Einladung wurde an ${email} gesendet.`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Einladen",
        description: error.message || "Die Einladung konnte nicht gesendet werden."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
    if (isInvited) {
      onSuccess?.();
    }
  };

  // Erfolgsansicht
  if (isInvited) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Einladung gesendet
            </DialogTitle>
            <DialogDescription>
              Der Nutzer wurde erfolgreich eingeladen.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{invitedEmail}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Eine E-Mail mit einem Aktivierungslink wurde gesendet. Der Nutzer kann sich nach der Aktivierung einloggen.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Nutzer einladen
          </DialogTitle>
          <DialogDescription>
            Senden Sie eine Einladung per E-Mail an einen neuen Nutzer für {tenantName ? `"${tenantName}"` : "diesen Mandanten"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="max@beispiel.de"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Name (optional)</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Max Mustermann"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rolle *</Label>
            <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
              <SelectTrigger>
                <SelectValue placeholder="Rolle auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Mitarbeiter</SelectItem>
                <SelectItem value="teamlead">Teamleiter</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Einladung senden
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
