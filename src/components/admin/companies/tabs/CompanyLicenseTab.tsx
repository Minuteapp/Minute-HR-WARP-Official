import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CompanyDetails, CompanyModule, CompanyModuleAssignment } from '../types';
import { 
  Euro, 
  Calendar, 
  Users, 
  HardDrive, 
  Shield, 
  Brain, 
  FileText, 
  Clock, 
  Briefcase,
  BarChart,
  Calculator,
  Package,
  Code,
  UserCheck
} from 'lucide-react';

interface CompanyLicenseTabProps {
  company: CompanyDetails;
  onUpdate: () => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  users: Users,
  'file-text': FileText,
  calendar: Calendar,
  clock: Clock,
  briefcase: Briefcase,
  'bar-chart': BarChart,
  calculator: Calculator,
  package: Package,
  brain: Brain,
  shield: Shield,
  code: Code,
  'user-check': UserCheck,
};

export const CompanyLicenseTab: React.FC<CompanyLicenseTabProps> = ({
  company,
  onUpdate
}) => {
  const [modules, setModules] = useState<CompanyModule[]>([]);
  const [assignments, setAssignments] = useState<CompanyModuleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadModulesAndAssignments();
  }, [company.id]);

  const loadModulesAndAssignments = async () => {
    try {
      // Lade alle verfügbaren Module
      const { data: modulesData, error: modulesError } = await supabase
        .from('company_modules')
        .select('*')
        .order('category', { ascending: true })
        .order('display_name', { ascending: true });

      if (modulesError) throw modulesError;

      // Lade aktuelle Zuweisungen für diese Firma
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('company_module_assignments')
        .select('*')
        .eq('company_id', company.id);

      if (assignmentsError) throw assignmentsError;

      setModules(modulesData || []);
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error loading modules:', error);
      toast({
        title: "Fehler",
        description: "Module konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (moduleKey: string, enabled: boolean) => {
    setUpdating(moduleKey);
    try {
      if (enabled) {
        // Modul aktivieren
        const { error } = await supabase
          .from('company_module_assignments')
          .upsert({
            company_id: company.id,
            module_key: moduleKey,
            is_enabled: true,
            enabled_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;

        // Lizenz-Historie eintragen
        await supabase
          .from('company_license_history')
          .insert({
            company_id: company.id,
            action_type: 'module_enabled',
            module_key: moduleKey,
            new_value: { enabled: true },
            performed_by: (await supabase.auth.getUser()).data.user?.id,
            notes: `Modul ${moduleKey} wurde aktiviert`
          });

        toast({
          title: "Modul aktiviert",
          description: `Das Modul wurde erfolgreich aktiviert.`
        });
      } else {
        // Modul deaktivieren
        const { error } = await supabase
          .from('company_module_assignments')
          .update({ is_enabled: false })
          .eq('company_id', company.id)
          .eq('module_key', moduleKey);

        if (error) throw error;

        // Lizenz-Historie eintragen
        await supabase
          .from('company_license_history')
          .insert({
            company_id: company.id,
            action_type: 'module_disabled',
            module_key: moduleKey,
            old_value: { enabled: true },
            new_value: { enabled: false },
            performed_by: (await supabase.auth.getUser()).data.user?.id,
            notes: `Modul ${moduleKey} wurde deaktiviert`
          });

        toast({
          title: "Modul deaktiviert",
          description: `Das Modul wurde erfolgreich deaktiviert.`
        });
      }

      await loadModulesAndAssignments();
      onUpdate();
    } catch (error) {
      console.error('Error toggling module:', error);
      toast({
        title: "Fehler",
        description: "Das Modul konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const updateCustomPrice = async (moduleKey: string, customPrice: number | null) => {
    try {
      const { error } = await supabase
        .from('company_module_assignments')
        .update({ custom_price: customPrice })
        .eq('company_id', company.id)
        .eq('module_key', moduleKey);

      if (error) throw error;

      await loadModulesAndAssignments();
      toast({
        title: "Preis aktualisiert",
        description: "Der individuelle Preis wurde gespeichert."
      });
    } catch (error) {
      console.error('Error updating price:', error);
      toast({
        title: "Fehler",
        description: "Der Preis konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  };

  const isModuleEnabled = (moduleKey: string) => {
    return assignments.some(a => a.module_key === moduleKey && a.is_enabled);
  };

  const getModuleAssignment = (moduleKey: string) => {
    return assignments.find(a => a.module_key === moduleKey);
  };

  const calculateTotalCost = () => {
    let totalBase = 0;
    let totalPerUser = 0;

    assignments.forEach(assignment => {
      if (!assignment.is_enabled) return;
      
      const module = modules.find(m => m.module_key === assignment.module_key);
      if (!module) return;

      if (assignment.custom_price !== null && assignment.custom_price !== undefined) {
        totalBase += assignment.custom_price;
      } else {
        totalBase += module.base_price;
        totalPerUser += module.price_per_user * (company.employee_count || 0);
      }
    });

    return { totalBase, totalPerUser, total: totalBase + totalPerUser };
  };

  const groupedModules = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, CompanyModule[]>);

  const costs = calculateTotalCost();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lizenz-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Lizenz-Übersicht
          </CardTitle>
          <CardDescription>
            Aktuelle Kosten und Nutzung der Lizenz
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {costs.totalBase.toFixed(2)} €
            </div>
            <div className="text-sm text-muted-foreground">Grundgebühr</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {costs.totalPerUser.toFixed(2)} €
            </div>
            <div className="text-sm text-muted-foreground">
              Pro Benutzer ({company.employee_count || 0} Benutzer)
            </div>
          </div>
          <div className="text-center p-4 bg-primary text-primary-foreground rounded-lg">
            <div className="text-2xl font-bold">
              {costs.total.toFixed(2)} €
            </div>
            <div className="text-sm opacity-90">
              Gesamtkosten {company.billing_cycle || 'monatlich'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lizenz-Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Lizenz-Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Vertragslaufzeit</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {company.contract_start_date ? 
                  new Date(company.contract_start_date).toLocaleDateString('de-DE') : 
                  'Nicht definiert'
                } - {
                  company.contract_end_date ? 
                  new Date(company.contract_end_date).toLocaleDateString('de-DE') : 
                  'Unbegrenzt'
                }
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Automatische Verlängerung</Label>
            <Badge variant={company.auto_renewal ? 'default' : 'secondary'}>
              {company.auto_renewal ? 'Aktiviert' : 'Deaktiviert'}
            </Badge>
          </div>
          <div className="space-y-2">
            <Label>Maximale Benutzer</Label>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{company.max_users || 'Unbegrenzt'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Speicherplatz</Label>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span>{company.max_storage_gb || 'Unbegrenzt'} GB</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module */}
      <div className="space-y-6">
        {Object.entries(groupedModules).map(([category, categoryModules]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">
                {category === 'core' ? 'Kernmodule' :
                 category === 'productivity' ? 'Produktivität' :
                 category === 'hr' ? 'Personal' :
                 category === 'analytics' ? 'Analysen' :
                 category === 'sales' ? 'Vertrieb' :
                 category === 'finance' ? 'Finanzen' :
                 category === 'operations' ? 'Betrieb' :
                 category === 'ai' ? 'Künstliche Intelligenz' :
                 category === 'security' ? 'Sicherheit' :
                 category === 'integration' ? 'Integration' :
                 category}
              </CardTitle>
              <CardDescription>
                {category === 'core' ? 'Grundlegende Module für alle Kunden' :
                 'Zusätzliche Module zur Erweiterung der Funktionalität'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryModules.map((module) => {
                  const enabled = isModuleEnabled(module.module_key);
                  const assignment = getModuleAssignment(module.module_key);
                  const IconComponent = iconMap[module.icon || 'users'] || Users;

                  return (
                    <div key={module.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <IconComponent className="h-5 w-5 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{module.display_name}</h4>
                              {module.is_core_module && (
                                <Badge variant="outline" className="text-xs">
                                  Kernmodul
                                </Badge>
                              )}
                              {enabled && (
                                <Badge variant="default" className="text-xs">
                                  Aktiv
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {module.description}
                            </p>
                            <div className="text-sm">
                              <span className="font-medium">
                                Grundpreis: {module.base_price.toFixed(2)} €
                              </span>
                              {module.price_per_user > 0 && (
                                <span className="text-muted-foreground ml-2">
                                  + {module.price_per_user.toFixed(2)} € pro Benutzer
                                </span>
                              )}
                            </div>
                            {enabled && assignment?.custom_price !== null && assignment?.custom_price !== undefined && (
                              <div className="text-sm text-orange-600 mt-1">
                                Individueller Preis: {assignment.custom_price.toFixed(2)} €
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {enabled && !module.is_core_module && (
                            <div className="text-right">
                              <Label htmlFor={`price-${module.id}`} className="text-xs">
                                Preis anpassen
                              </Label>
                              <Input
                                id={`price-${module.id}`}
                                type="number"
                                step="0.01"
                                className="w-24 h-8 text-xs"
                                placeholder={module.base_price.toString()}
                                defaultValue={assignment?.custom_price || ''}
                                onBlur={(e) => {
                                  const value = e.target.value;
                                  if (value) {
                                    updateCustomPrice(module.module_key, parseFloat(value));
                                  } else {
                                    updateCustomPrice(module.module_key, null);
                                  }
                                }}
                              />
                            </div>
                          )}
                          <Switch
                            checked={enabled}
                            disabled={module.is_core_module || updating === module.module_key}
                            onCheckedChange={(checked) => 
                              toggleModule(module.module_key, checked)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};