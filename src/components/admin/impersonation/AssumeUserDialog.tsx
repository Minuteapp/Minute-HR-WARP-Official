import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { UserCog, Shield, Clock, AlertTriangle, Search, Building2, ShieldAlert } from 'lucide-react';
import { useImpersonationContext } from '@/contexts/ImpersonationContext';
import { impersonationService } from '@/services/impersonationService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TwoFactorConfirmDialog } from './TwoFactorConfirmDialog';

interface Company {
  id: string;
  name: string;
  subscription_status: string;
  is_active: boolean;
}

interface TenantUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AssumeUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedTenantId?: string;
  preselectedUserId?: string;
}

export function AssumeUserDialog({ 
  open, 
  onOpenChange,
  preselectedTenantId,
  preselectedUserId 
}: AssumeUserDialogProps) {
  const { startImpersonation, loading } = useImpersonationContext();
  
  // Form State
  const [selectedTenantId, setSelectedTenantId] = useState(preselectedTenantId || '');
  const [selectedUserId, setSelectedUserId] = useState(preselectedUserId || '');
  const [mode, setMode] = useState<'view_only' | 'act_as'>('view_only');
  const [duration, setDuration] = useState(30);
  const [justificationType, setJustificationType] = useState<'ticket' | 'test_case' | 'support' | 'debugging' | 'other'>('support');
  const [justification, setJustification] = useState('');
  const [isPreTenant, setIsPreTenant] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [pendingStart, setPendingStart] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Check if current user is SuperAdmin
  useEffect(() => {
    async function checkSuperAdmin() {
      const status = await impersonationService.checkIsSuperAdmin();
      setIsSuperAdmin(status);
    }
    if (open) {
      checkSuperAdmin();
    }
  }, [open]);
  
  // Data State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load companies
  useEffect(() => {
    async function loadCompanies() {
      setLoadingCompanies(true);
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, subscription_status, is_active')
        .order('name');
      
      if (!error && data) {
        setCompanies(data);
      }
      setLoadingCompanies(false);
    }
    
    if (open) {
      loadCompanies();
    }
  }, [open]);

  // Load users when tenant selected
  useEffect(() => {
    async function loadUsers() {
      if (!selectedTenantId || isPreTenant) {
        setUsers([]);
        return;
      }
      
      setLoadingUsers(true);
      const tenantUsers = await impersonationService.getUsersForTenant(selectedTenantId);
      setUsers(tenantUsers);
      setLoadingUsers(false);
    }
    
    loadUsers();
  }, [selectedTenantId, isPreTenant]);

  // Filter users by search
  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-orange-100 text-orange-800';
      case 'hr': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStart = async () => {
    if (!selectedTenantId) {
      toast.error('Bitte wählen Sie einen Mandanten aus');
      return;
    }
    
    if (!justification.trim()) {
      toast.error('Bitte geben Sie eine Begründung an');
      return;
    }

    if (!isPreTenant && !selectedUserId) {
      toast.error('Bitte wählen Sie einen Benutzer aus');
      return;
    }

    // For act_as mode, require 2FA confirmation (except for SuperAdmins)
    if (mode === 'act_as' && !isSuperAdmin) {
      setShow2FADialog(true);
      setPendingStart(true);
      return;
    }

    await executeStart();
  };

  const executeStart = async () => {
    const success = await startImpersonation({
      targetUserId: isPreTenant ? null : selectedUserId,
      targetTenantId: selectedTenantId,
      mode,
      justification: justification.trim(),
      justificationType,
      durationMinutes: duration,
      isPreTenant
    });

    if (success) {
      onOpenChange(false);
    }
    setPendingStart(false);
  };

  const handle2FAVerified = () => {
    if (pendingStart) {
      executeStart();
    }
  };

  const selectedCompany = companies.find(c => c.id === selectedTenantId);
  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Als Benutzer agieren (Impersonation)
          </DialogTitle>
          <DialogDescription>
            Wechseln Sie in die Identität eines anderen Benutzers für Support, Debugging oder Tests.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mandant auswählen */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Mandant
            </Label>
            <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
              <SelectTrigger>
                <SelectValue placeholder="Mandant auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    <div className="flex items-center gap-2">
                      <span>{company.name}</span>
                      {!company.is_active && (
                        <Badge variant="outline" className="text-xs">Inaktiv</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedCompany && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{selectedCompany.subscription_status}</Badge>
                {!selectedCompany.is_active && (
                  <Badge variant="destructive">Inaktiv</Badge>
                )}
              </div>
            )}
          </div>

          {/* Pre-Tenant Mode */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="preTenant" 
              checked={isPreTenant}
              onCheckedChange={(checked) => {
                setIsPreTenant(checked === true);
                if (checked) setSelectedUserId('');
              }}
            />
            <Label htmlFor="preTenant" className="text-sm cursor-pointer">
              Pre-Tenant / Setup-Modus (ohne spezifischen User)
            </Label>
          </div>

          {/* Benutzer auswählen */}
          {!isPreTenant && selectedTenantId && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Benutzer
              </Label>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Benutzer suchen..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {loadingUsers ? (
                  <div className="p-4 text-center text-muted-foreground">Laden...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">Keine Benutzer gefunden</div>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedUserId === user.id ? 'bg-primary/10' : ''
                      }`}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                        <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {selectedUser && (
                <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-md">
                  <span className="text-sm">Ausgewählt:</span>
                  <span className="font-medium">{selectedUser.full_name}</span>
                  <Badge className={getRoleBadgeColor(selectedUser.role)}>{selectedUser.role}</Badge>
                </div>
              )}
            </div>
          )}

          <hr className="my-4" />

          {/* Modus */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Modus
            </Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'view_only' | 'act_as')}>
              <div className="flex items-start space-x-2 p-3 border rounded-md hover:bg-muted/30 cursor-pointer">
                <RadioGroupItem value="view_only" id="view_only" />
                <div className="flex-1">
                  <Label htmlFor="view_only" className="font-medium cursor-pointer">View-only</Label>
                  <p className="text-sm text-muted-foreground">Nur ansehen, keine Änderungen möglich</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 p-3 border rounded-md hover:bg-muted/30 cursor-pointer">
                <RadioGroupItem value="act_as" id="act_as" />
                <div className="flex-1">
                  <Label htmlFor="act_as" className="font-medium cursor-pointer">Act-as</Label>
                  <p className="text-sm text-muted-foreground">Im Namen des Users handeln (Änderungen möglich)</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Dauer */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Dauer
            </Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 Minuten</SelectItem>
                <SelectItem value="30">30 Minuten</SelectItem>
                <SelectItem value="45">45 Minuten</SelectItem>
                <SelectItem value="60">60 Minuten (Maximum)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Begründung */}
          <div className="space-y-2">
            <Label>Begründung (Pflichtfeld)</Label>
            <Select value={justificationType} onValueChange={(v) => setJustificationType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ticket">Ticket-ID</SelectItem>
                <SelectItem value="test_case">Testfall</SelectItem>
                <SelectItem value="support">Support-Anfrage</SelectItem>
                <SelectItem value="debugging">Debugging</SelectItem>
                <SelectItem value="other">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="z.B. TICKET-12345: Fehler bei Urlaubsantrag untersuchen"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={3}
            />
          </div>

          {/* Warnung */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Alle Aktionen werden vollständig protokolliert und sind im Audit-Log sichtbar.
              {mode === 'act_as' && ' Im Act-as Modus werden alle Änderungen im Namen des Benutzers durchgeführt.'}
            </AlertDescription>
          </Alert>

          {/* 2FA Hinweis für Act-as (nur für Nicht-SuperAdmins) */}
          {mode === 'act_as' && !isSuperAdmin && (
            <Alert className="bg-amber-50 border-amber-200">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>2FA erforderlich:</strong> Für den Act-as Modus müssen Sie Ihre Identität mit 2FA bestätigen.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleStart} 
            disabled={loading || !selectedTenantId || !justification.trim() || (!isPreTenant && !selectedUserId)}
          >
            <Shield className="h-4 w-4 mr-2" />
            {loading ? 'Wird gestartet...' : (mode === 'act_as' && !isSuperAdmin) ? 'Mit 2FA bestätigen' : 'Session starten'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* 2FA Confirmation Dialog */}
      <TwoFactorConfirmDialog
        open={show2FADialog}
        onOpenChange={setShow2FADialog}
        onVerified={handle2FAVerified}
        targetUserName={selectedUser?.full_name || 'Pre-Tenant Modus'}
      />
    </Dialog>
  );
}
