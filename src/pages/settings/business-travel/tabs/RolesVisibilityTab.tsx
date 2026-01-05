import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";
import { Users, Settings, Loader2 } from "lucide-react";

interface FormState {
  role_employee_can_book: boolean;
  role_employee_can_expense: boolean;
  role_teamlead_can_approve: boolean;
  role_teamlead_view_team: boolean;
  role_travel_manager_full_access: boolean;
  role_finance_budget_access: boolean;
  role_finance_reports_access: boolean;
  role_admin_full_access: boolean;
  visibility_own_trips_only: boolean;
  visibility_team_trips: boolean;
  visibility_all_trips: boolean;
}

export default function RolesVisibilityTab() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('business_travel');
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState<FormState>({
    role_employee_can_book: true,
    role_employee_can_expense: true,
    role_teamlead_can_approve: true,
    role_teamlead_view_team: true,
    role_travel_manager_full_access: true,
    role_finance_budget_access: true,
    role_finance_reports_access: true,
    role_admin_full_access: true,
    visibility_own_trips_only: true,
    visibility_team_trips: true,
    visibility_all_trips: false,
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        role_employee_can_book: getValue('role_employee_can_book', true) as boolean,
        role_employee_can_expense: getValue('role_employee_can_expense', true) as boolean,
        role_teamlead_can_approve: getValue('role_teamlead_can_approve', true) as boolean,
        role_teamlead_view_team: getValue('role_teamlead_view_team', true) as boolean,
        role_travel_manager_full_access: getValue('role_travel_manager_full_access', true) as boolean,
        role_finance_budget_access: getValue('role_finance_budget_access', true) as boolean,
        role_finance_reports_access: getValue('role_finance_reports_access', true) as boolean,
        role_admin_full_access: getValue('role_admin_full_access', true) as boolean,
        visibility_own_trips_only: getValue('visibility_own_trips_only', true) as boolean,
        visibility_team_trips: getValue('visibility_team_trips', true) as boolean,
        visibility_all_trips: getValue('visibility_all_trips', false) as boolean,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(formState);
      toast.success("Rollen gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const businessTravelRoles = [
    { 
      role: 'Mitarbeiter', 
      permissions: [
        { key: 'role_employee_can_book', label: 'Reisen buchen' },
        { key: 'role_employee_can_expense', label: 'Spesen erfassen' },
      ],
      modules: ['Dashboard', 'Reiseanträge', 'Spesen']
    },
    { 
      role: 'Teamleiter', 
      permissions: [
        { key: 'role_teamlead_can_approve', label: 'Reisen genehmigen' },
        { key: 'role_teamlead_view_team', label: 'Team-Übersicht' },
      ],
      modules: ['Dashboard', 'Reiseanträge', 'Spesen', 'Team Reisen']
    },
    { 
      role: 'HR/Travel Manager', 
      permissions: [
        { key: 'role_travel_manager_full_access', label: 'Vollzugriff Travel' },
      ],
      modules: ['Alle Travel-Module']
    },
    { 
      role: 'Finance', 
      permissions: [
        { key: 'role_finance_budget_access', label: 'Budget-Zugriff' },
        { key: 'role_finance_reports_access', label: 'Berichte-Zugriff' },
      ],
      modules: ['Dashboard', 'Spesen', 'Budget', 'Berichte']
    },
    { 
      role: 'Administrator', 
      permissions: [
        { key: 'role_admin_full_access', label: 'Alle Rechte' },
      ],
      modules: ['Alle Module verfügbar']
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-sky-600" />
            Rollen & Berechtigungen (RBAC)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {businessTravelRoles.map((roleData, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{roleData.role}</h4>
                </div>
                <div className="space-y-2 mb-3">
                  {roleData.permissions.map((permission) => (
                    <div key={permission.key} className="flex items-center justify-between">
                      <Label className="text-sm">{permission.label}</Label>
                      <Switch 
                        checked={formState[permission.key as keyof FormState] as boolean}
                        onCheckedChange={(checked) => setFormState(prev => ({...prev, [permission.key]: checked}))}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {roleData.modules.map((module, idx) => (
                    <Badge key={idx} variant="secondary">{module}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-sky-600" />
            Sichtbarkeitsregeln
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="font-medium">Nur eigene Reisen</Label>
              <p className="text-sm text-muted-foreground">Standard für Mitarbeiter</p>
            </div>
            <Switch 
              checked={formState.visibility_own_trips_only}
              onCheckedChange={(checked) => setFormState(prev => ({...prev, visibility_own_trips_only: checked}))}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="font-medium">Team-Reisen sichtbar</Label>
              <p className="text-sm text-muted-foreground">Für Teamleiter</p>
            </div>
            <Switch 
              checked={formState.visibility_team_trips}
              onCheckedChange={(checked) => setFormState(prev => ({...prev, visibility_team_trips: checked}))}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="font-medium">Alle Reisen sichtbar</Label>
              <p className="text-sm text-muted-foreground">Für HR/Travel Manager</p>
            </div>
            <Switch 
              checked={formState.visibility_all_trips}
              onCheckedChange={(checked) => setFormState(prev => ({...prev, visibility_all_trips: checked}))}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-sky-600 hover:bg-sky-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
          Rollen speichern
        </Button>
      </div>
    </div>
  );
}
