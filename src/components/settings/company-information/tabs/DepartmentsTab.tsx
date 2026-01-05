import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Plus, Pencil, Trash2, Building2, Wallet, Target, ChevronRight, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';

interface Department {
  id: string;
  name: string;
  code: string;
  costCenter: string;
  parentDepartmentId: string | null;
  subsidiaryId: string;
  locationId: string;
  managerId: string;
  managerName: string;
  budgetResponsible: string;
  employeeCount: number;
  status: 'active' | 'inactive';
  linkedProjects: string[];
  workforcePlanningEnabled: boolean;
  performanceGoalsEnabled: boolean;
}

export function DepartmentsTab() {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<Partial<Department>>({
    name: '',
    code: '',
    costCenter: '',
    parentDepartmentId: null,
    subsidiaryId: '',
    locationId: '',
    managerId: '',
    managerName: '',
    budgetResponsible: '',
    status: 'active',
    linkedProjects: [],
    workforcePlanningEnabled: true,
    performanceGoalsEnabled: true,
  });

  // Lade Abteilungen aus der Datenbank
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments', currentCompany?.id],
    enabled: !!currentCompany?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*, employees:employees(count)')
        .eq('company_id', currentCompany?.id)
        .order('name');
      
      if (error) throw error;
      
      return (data || []).map((dept: any) => ({
        id: dept.id,
        name: dept.name,
        code: dept.code || '',
        costCenter: dept.cost_center || '',
        parentDepartmentId: dept.parent_department_id,
        subsidiaryId: dept.subsidiary_id || '',
        locationId: dept.location_id || '',
        managerId: dept.manager_id || '',
        managerName: dept.manager_name || '',
        budgetResponsible: dept.budget_responsible || '',
        employeeCount: dept.employees?.[0]?.count || 0,
        status: (dept.is_active !== false ? 'active' : 'inactive') as 'active' | 'inactive',
        linkedProjects: [],
        workforcePlanningEnabled: true,
        performanceGoalsEnabled: true,
      }));
    }
  });

  // Lade Standorte für das Dropdown
  const { data: locations = [] } = useQuery({
    queryKey: ['locations', currentCompany?.id],
    enabled: !!currentCompany?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('locations')
        .select('id, name')
        .eq('company_id', currentCompany?.id);
      return (data || []).map((loc: any) => ({ value: loc.id, label: loc.name }));
    }
  });

  // Lade Manager für das Dropdown
  const { data: managers = [] } = useQuery({
    queryKey: ['managers', currentCompany?.id],
    enabled: !!currentCompany?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('company_id', currentCompany?.id)
        .eq('status', 'active');
      return (data || []).map((emp: any) => ({ 
        value: emp.id, 
        label: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unbekannt'
      }));
    }
  });

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setFormData(department);
    } else {
      setEditingDepartment(null);
      setFormData({
        name: '',
        code: '',
        costCenter: '',
        parentDepartmentId: null,
        subsidiaryId: '',
        locationId: '',
        managerId: '',
        managerName: '',
        budgetResponsible: '',
        status: 'active',
        linkedProjects: [],
        workforcePlanningEnabled: true,
        performanceGoalsEnabled: true,
      });
    }
    setIsDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Department>) => {
      const managerName = managers.find(m => m.value === data.managerId)?.label || '';
      
      const deptData = {
        name: data.name,
        code: data.code,
        cost_center: data.costCenter,
        parent_department_id: data.parentDepartmentId,
        location_id: data.locationId || null,
        manager_id: data.managerId || null,
        manager_name: managerName,
        budget_responsible: data.budgetResponsible,
        is_active: data.status === 'active',
        company_id: currentCompany?.id,
      };

      if (editingDepartment) {
        const { error } = await supabase
          .from('departments')
          .update(deptData)
          .eq('id', editingDepartment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('departments')
          .insert(deptData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success(editingDepartment ? 'Abteilung wurde aktualisiert' : 'Abteilung wurde hinzugefügt');
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Fehler beim Speichern: ' + (error as Error).message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Abteilung wurde gelöscht');
    },
    onError: (error) => {
      toast.error('Fehler beim Löschen: ' + (error as Error).message);
    }
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie diese Abteilung wirklich löschen?')) {
      deleteMutation.mutate(id);
    }
  };

  const getParentName = (id: string | null) => {
    if (!id) return '-';
    const parent = departments.find(d => d.id === id);
    return parent?.name || '-';
  };

  const getLocationName = (id: string) => locations.find(l => l.value === id)?.label || '-';

  const getDepartmentLevel = (dept: Department, allDepts: Department[]): number => {
    if (!dept.parentDepartmentId) return 0;
    const parent = allDepts.find(d => d.id === dept.parentDepartmentId);
    if (!parent) return 0;
    return 1 + getDepartmentLevel(parent, allDepts);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Abteilungen
              </CardTitle>
              <CardDescription>
                Organisatorische Struktur und Kostenstellenzuordnung
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Abteilung
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {departments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Abteilungen angelegt</p>
              <p className="text-sm mt-2">Klicken Sie auf "Neue Abteilung" um eine hinzuzufügen</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Abteilung</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Kostenstelle</TableHead>
                  <TableHead>Standort</TableHead>
                  <TableHead>Leitung</TableHead>
                  <TableHead>Mitarbeiter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => {
                  const level = getDepartmentLevel(dept, departments);
                  return (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span style={{ marginLeft: `${level * 20}px` }} className="flex items-center gap-1">
                            {level > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                            <span className="font-medium">{dept.name}</span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{dept.code || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{dept.costCenter || '-'}</TableCell>
                      <TableCell>{getLocationName(dept.locationId)}</TableCell>
                      <TableCell>{dept.managerName || '-'}</TableCell>
                      <TableCell>{dept.employeeCount}</TableCell>
                      <TableCell>
                        <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
                          {dept.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(dept)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? 'Abteilung bearbeiten' : 'Neue Abteilung anlegen'}
            </DialogTitle>
            <DialogDescription>
              Definieren Sie die organisatorischen Eigenschaften der Abteilung
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Grunddaten */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Grunddaten
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Abteilungsname *</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Personal & HR"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Abteilungscode *</Label>
                  <Input
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="z.B. HR"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Übergeordnete Abteilung</Label>
                  <Select 
                    value={formData.parentDepartmentId || 'none'} 
                    onValueChange={(value) => setFormData({ ...formData, parentDepartmentId: value === 'none' ? null : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Keine (Root-Ebene)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Keine (Root-Ebene)</SelectItem>
                      {departments
                        .filter(d => d.id !== editingDepartment?.id)
                        .map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktiv</SelectItem>
                      <SelectItem value="inactive">Inaktiv</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Zuordnung */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Zuordnung
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Standort</Label>
                  <Select value={formData.locationId || 'none'} onValueChange={(value) => setFormData({ ...formData, locationId: value === 'none' ? '' : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Standort wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Kein Standort</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Finanzen */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Finanzen & Verantwortung
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Kostenstelle</Label>
                  <Input
                    value={formData.costCenter || ''}
                    onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                    placeholder="z.B. CC-2000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Abteilungsleitung</Label>
                  <Select value={formData.managerId || 'none'} onValueChange={(value) => setFormData({ ...formData, managerId: value === 'none' ? '' : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Leitung wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Keine Leitung</SelectItem>
                      {managers.map((mgr) => (
                        <SelectItem key={mgr.value} value={mgr.value}>
                          {mgr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Budgetverantwortung</Label>
                  <Input
                    value={formData.budgetResponsible || ''}
                    onChange={(e) => setFormData({ ...formData, budgetResponsible: e.target.value })}
                    placeholder="Name der budgetverantwortlichen Person"
                  />
                </div>
              </div>
            </div>

            {/* Verknüpfungen */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Modul-Verknüpfungen
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label>Workforce Planning</Label>
                    <p className="text-sm text-muted-foreground">In Personalplanung einbeziehen</p>
                  </div>
                  <Switch
                    checked={formData.workforcePlanningEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, workforcePlanningEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label>Performance Goals</Label>
                    <p className="text-sm text-muted-foreground">Abteilungsziele verwalten</p>
                  </div>
                  <Switch
                    checked={formData.performanceGoalsEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, performanceGoalsEnabled: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
