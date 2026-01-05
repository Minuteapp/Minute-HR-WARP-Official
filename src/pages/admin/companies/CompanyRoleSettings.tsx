import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, RotateCcw, Eye } from 'lucide-react';
import { UserRole } from '@/hooks/useRolePreview';

interface CompanyRoleSettingsProps {
  companyId: string;
  companyName: string;
}

interface RoleConfig {
  value: UserRole;
  defaultLabel: string;
  description: string;
  color: string;
}

const availableRoleConfigs: RoleConfig[] = [
  {
    value: 'employee',
    defaultLabel: 'Mitarbeiter',
    description: 'Standard-Benutzerrolle',
    color: 'bg-gray-100 text-gray-700',
  },
  {
    value: 'team_lead',
    defaultLabel: 'Teamleiter',
    description: 'Team-Management-Berechtigungen',
    color: 'bg-green-100 text-green-700',
  },
  {
    value: 'hr_admin',
    defaultLabel: 'HR Admin',
    description: 'Personalverwaltungs-Berechtigungen',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'admin',
    defaultLabel: 'Administrator',
    description: 'Vollständige Administratorrechte',
    color: 'bg-purple-100 text-purple-700',
  },
];

export const CompanyRoleSettings: React.FC<CompanyRoleSettingsProps> = ({
  companyId,
  companyName,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['employee', 'team_lead', 'hr_admin', 'admin']);
  const [customLabels, setCustomLabels] = useState<Record<string, string>>({});

  // Lade aktuelle Rollenkonfiguration
  const { data: roleConfig, isLoading } = useQuery({
    queryKey: ['company-role-config', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_role_configurations')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSelectedRoles(data.available_roles as UserRole[]);
        setCustomLabels(data.role_labels as Record<string, string>);
      }

      return data;
    },
  });

  // Mutation zum Speichern
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('company_role_configurations')
        .upsert({
          company_id: companyId,
          available_roles: selectedRoles,
          role_labels: customLabels,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'company_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Gespeichert',
        description: 'Rollenkonfiguration wurde erfolgreich aktualisiert',
      });
      queryClient.invalidateQueries({ queryKey: ['company-role-config', companyId] });
      queryClient.invalidateQueries({ queryKey: ['company-available-roles', companyId] });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: `Fehler beim Speichern: ${error.message}`,
      });
    },
  });

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleLabelChange = (role: string, label: string) => {
    setCustomLabels(prev => ({
      ...prev,
      [role]: label,
    }));
  };

  const handleReset = () => {
    setSelectedRoles(['employee', 'team_lead', 'hr_admin', 'admin']);
    setCustomLabels({});
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lade...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Rollenkonfiguration für {companyName}
          </CardTitle>
          <CardDescription>
            Legen Sie fest, welche Rollen im Role-Preview für diese Firma verfügbar sind
            und passen Sie die Rollennamen an.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {availableRoleConfigs.map((roleConfig) => {
            const isSelected = selectedRoles.includes(roleConfig.value);
            const customLabel = customLabels[roleConfig.value] || '';

            return (
              <div
                key={roleConfig.value}
                className={`border rounded-lg p-4 transition-all ${
                  isSelected ? 'bg-accent/5 border-accent' : 'border-border'
                }`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    id={`role-${roleConfig.value}`}
                    checked={isSelected}
                    onCheckedChange={() => handleRoleToggle(roleConfig.value)}
                  />
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`role-${roleConfig.value}`}
                        className="font-semibold cursor-pointer"
                      >
                        {roleConfig.defaultLabel}
                      </Label>
                      <Badge variant="outline" className={roleConfig.color}>
                        {roleConfig.value}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {roleConfig.description}
                    </p>

                    {isSelected && (
                      <div className="space-y-2">
                        <Label
                          htmlFor={`label-${roleConfig.value}`}
                          className="text-xs text-muted-foreground"
                        >
                          Benutzerdefinierter Name (optional)
                        </Label>
                        <Input
                          id={`label-${roleConfig.value}`}
                          placeholder={roleConfig.defaultLabel}
                          value={customLabel}
                          onChange={(e) =>
                            handleLabelChange(roleConfig.value, e.target.value)
                          }
                          className="max-w-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || selectedRoles.length === 0}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Speichern
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Zurücksetzen
            </Button>
          </div>

          {selectedRoles.length === 0 && (
            <p className="text-sm text-destructive">
              ⚠️ Mindestens eine Rolle muss ausgewählt sein
            </p>
          )}
        </CardContent>
      </Card>

      {/* Vorschau */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vorschau</CardTitle>
          <CardDescription>
            So sehen die Rollen im Role-Preview Switcher aus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {selectedRoles.map((role) => {
              const config = availableRoleConfigs.find(c => c.value === role);
              const label = customLabels[role] || config?.defaultLabel || role;

              return (
                <div
                  key={role}
                  className="flex items-center gap-2 p-2 rounded-md bg-accent/5"
                >
                  <div className={`w-2 h-2 rounded-full ${config?.color}`} />
                  <span className="text-sm font-medium">{label}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {role}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
