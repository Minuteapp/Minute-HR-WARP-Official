import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, AlertTriangle, Plus, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export const SkillsManagement = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [skillName, setSkillName] = useState('');
  const [certDate, setCertDate] = useState<Date>();
  const [level, setLevel] = useState('');
  const [issuer, setIssuer] = useState('');
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['skills-employees', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('company_id', companyId);
      return data || [];
    },
    enabled: !!companyId
  });

  const { data: qualifications = [] } = useQuery({
    queryKey: ['employee-qualifications', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from('employee_qualifications')
        .select('*, employees(first_name, last_name)')
        .eq('company_id', companyId);
      return data || [];
    },
    enabled: !!companyId
  });

  const handleAddQualification = () => {
    // Add qualification logic here
    setShowAddDialog(false);
    setSelectedEmployee('');
    setSkillName('');
    setCertDate(undefined);
    setLevel('');
    setIssuer('');
  };

  const skillsData = [
    { title: 'Verfügbare Skills', value: '0', subtitle: 'Registrierte Qualifikationen', color: 'text-blue-600' },
    { title: 'Aktive Zertifikate', value: '0', subtitle: 'Gültige Qualifikationen', color: 'text-green-600' },
    { title: 'Ablaufende Zertifikate', value: '0', subtitle: 'Binnen 30 Tagen', color: 'text-orange-600' },
    { title: 'Durchschnittliche Abdeckung', value: '0', subtitle: 'Mitarbeiter pro Skill', color: 'text-purple-600' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Skills & Qualifikations-Management</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-4">
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Skills & Qualifikations-Management</h2>
        <Button onClick={() => setShowAddDialog(true)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Qualifikation hinzufügen
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        {skillsData.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="text-sm text-muted-foreground">{stat.title}</div>
            </div>
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.subtitle}</div>
          </Card>
        ))}
      </div>

      {/* Employee Skills Matrix */}
      <Card className="p-6">
        <h3 className="text-base font-medium mb-4">Mitarbeiter-Skills Matrix</h3>
        {employees.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">Keine Mitarbeiter</h4>
            <p className="text-muted-foreground">Fügen Sie zuerst Mitarbeiter hinzu, um Skills zuzuweisen.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee: any) => (
              <div key={employee.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-sm font-medium">
                    {employee.first_name?.[0]}{employee.last_name?.[0]}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{employee.first_name} {employee.last_name}</div>
                    <p className="text-xs text-muted-foreground">Keine Qualifikationen</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  0 Qualifikationen
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Skills Coverage */}
      <Card className="p-6">
        <h3 className="text-base font-medium mb-4">Skill-Abdeckung nach Maschinen</h3>
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Keine Skills konfiguriert</p>
        </div>
      </Card>

      {/* Add Qualification Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Neue Qualifikation hinzufügen</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-4 top-4"
              onClick={() => setShowAddDialog(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Fügen Sie einem Mitarbeiter eine neue Qualifikation hinzu. Alle Felder sind erforderlich.
            </p>
            
            <div>
              <Label className="text-sm font-medium">Mitarbeiter</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Mitarbeiter auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Skill</Label>
              <Input 
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="Skill Name eingeben..."
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Zertifikatsdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !certDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {certDate ? format(certDate, "dd.MM.yyyy") : "Datum auswählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={certDate}
                    onSelect={setCertDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-sm font-medium">Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Level auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Aussteller</Label>
              <Input 
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="Name des Ausstellers"
                className="mt-1"
              />
            </div>

            <Button 
              onClick={handleAddQualification}
              className="w-full"
              disabled={!selectedEmployee || !skillName || !certDate || !level || !issuer}
            >
              Qualifikation hinzufügen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
