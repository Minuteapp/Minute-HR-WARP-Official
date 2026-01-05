import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import type {
  OrganizationalUnit,
  OrganizationalRoleType,
  CreateOrganizationalRoleData
} from '@/types/organizational-structure';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface OrganizationalRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  units: OrganizationalUnit[];
  selectedUnit?: OrganizationalUnit | null;
  onSave: (data: CreateOrganizationalRoleData) => Promise<any>;
}

const ROLE_TYPES: { value: OrganizationalRoleType; label: string; description: string }[] = [
  { value: 'manager', label: 'Manager', description: 'Leitung der Organisationseinheit' },
  { value: 'member', label: 'Mitglied', description: 'Reguläres Mitglied der Einheit' },
  { value: 'deputy', label: 'Stellvertreter', description: 'Stellvertretende Leitung' },
  { value: 'assistant', label: 'Assistent', description: 'Assistenz der Leitung' },
  { value: 'viewer', label: 'Betrachter', description: 'Nur Lesezugriff' }
];

const DEFAULT_PERMISSIONS = {
  view: true,
  edit: false,
  manage: false,
  assign_roles: false,
  manage_budget: false,
  approve_requests: false
};

export const OrganizationalRoleDialog: React.FC<OrganizationalRoleDialogProps> = ({
  open,
  onOpenChange,
  units,
  selectedUnit,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<CreateOrganizationalRoleData>({
    user_id: '',
    organizational_unit_id: selectedUnit?.id || '',
    role_type: 'member',
    responsibilities: [],
    permissions: DEFAULT_PERMISSIONS
  });

  // Benutzer laden
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('id, name, email')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Fehler beim Laden der Benutzer:', error);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  // Form zurücksetzen wenn Dialog geöffnet wird
  useEffect(() => {
    if (open) {
      setFormData({
        user_id: '',
        organizational_unit_id: selectedUnit?.id || '',
        role_type: 'member',
        responsibilities: [],
        permissions: DEFAULT_PERMISSIONS
      });
      setSearchQuery('');
    }
  }, [open, selectedUnit]);

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.user_id || !formData.organizational_unit_id) return;

    setLoading(true);
    try {
      const result = await onSave(formData);
      if (result) {
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleTypeChange = (roleType: OrganizationalRoleType) => {
    // Berechtigungen basierend auf Rollentyp setzen
    let permissions = DEFAULT_PERMISSIONS;
    
    switch (roleType) {
      case 'manager':
        permissions = {
          view: true,
          edit: true,
          manage: true,
          assign_roles: true,
          manage_budget: true,
          approve_requests: true
        };
        break;
      case 'deputy':
        permissions = {
          view: true,
          edit: true,
          manage: true,
          assign_roles: false,
          manage_budget: true,
          approve_requests: true
        };
        break;
      case 'assistant':
        permissions = {
          view: true,
          edit: true,
          manage: false,
          assign_roles: false,
          manage_budget: false,
          approve_requests: false
        };
        break;
      case 'member':
        permissions = {
          view: true,
          edit: false,
          manage: false,
          assign_roles: false,
          manage_budget: false,
          approve_requests: false
        };
        break;
      case 'viewer':
        permissions = {
          view: true,
          edit: false,
          manage: false,
          assign_roles: false,
          manage_budget: false,
          approve_requests: false
        };
        break;
    }

    setFormData({
      ...formData,
      role_type: roleType,
      permissions
    });
  };

  const updatePermission = (permission: string, value: boolean) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permission]: value
      }
    });
  };

  const selectedUnitForForm = selectedUnit || units.find(u => u.id === formData.organizational_unit_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rolle zuweisen</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Organisationseinheit */}
          <div className="space-y-2">
            <Label htmlFor="unit">Organisationseinheit</Label>
            {selectedUnit ? (
              <div className="p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedUnit.name}</span>
                  <Badge variant="outline">{selectedUnit.code}</Badge>
                  <Badge variant="secondary">{selectedUnit.type}</Badge>
                </div>
                {selectedUnit.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedUnit.description}
                  </p>
                )}
              </div>
            ) : (
              <Select 
                value={formData.organizational_unit_id} 
                onValueChange={(value) => 
                  setFormData({ ...formData, organizational_unit_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Organisationseinheit auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {units.filter(u => u.is_active).map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      <div className="flex items-center gap-2">
                        <span>{unit.name}</span>
                        <Badge variant="outline">{unit.type}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Benutzer auswählen */}
          <div className="space-y-2">
            <Label htmlFor="user">Benutzer</Label>
            <Input
              placeholder="Benutzer suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
            <div className="max-h-48 overflow-y-auto border rounded-lg">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Keine Benutzer gefunden
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        formData.user_id === user.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setFormData({ ...formData, user_id: user.id })}
                    >
                      <div className="font-medium">{user.name || user.email}</div>
                      {user.name && (
                        <div className="text-sm opacity-70">{user.email}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rollentyp */}
          <div className="space-y-2">
            <Label htmlFor="role_type">Rollentyp</Label>
            <Select 
              value={formData.role_type} 
              onValueChange={handleRoleTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rollentyp auswählen" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_TYPES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {role.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Berechtigungen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Berechtigungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(formData.permissions).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => 
                      updatePermission(key, checked as boolean)
                    }
                  />
                  <Label htmlFor={key} className="text-sm">
                    {key === 'view' && 'Anzeigen'}
                    {key === 'edit' && 'Bearbeiten'}
                    {key === 'manage' && 'Verwalten'}
                    {key === 'assign_roles' && 'Rollen zuweisen'}
                    {key === 'manage_budget' && 'Budget verwalten'}
                    {key === 'approve_requests' && 'Anträge genehmigen'}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || !formData.user_id || !formData.organizational_unit_id}
          >
            {loading ? 'Zuweisen...' : 'Rolle zuweisen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};