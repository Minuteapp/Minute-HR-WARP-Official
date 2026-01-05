import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { 
  Building2, 
  Users, 
  Plus, 
  Edit2, 
  MapPin, 
  DollarSign,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useOrganizationHierarchy, useDepartments, usePositions, useCreateDepartment, useCreatePosition } from '@/hooks/useOrganization';
import { DepartmentFormData, PositionFormData } from '@/types/sprint1.types';

const OrganizationChart = () => {
  const { data: hierarchy, isLoading } = useOrganizationHierarchy();
  const { data: departments } = useDepartments();
  const { data: positions } = usePositions();
  const createDepartment = useCreateDepartment();
  const createPosition = useCreatePosition();
  
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
  const [showPositionDialog, setShowPositionDialog] = useState(false);

  const departmentForm = useForm<DepartmentFormData>();
  const positionForm = useForm<PositionFormData>();

  const toggleDepartment = (deptId: string) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepts(newExpanded);
  };

  const onCreateDepartment = (data: DepartmentFormData) => {
    createDepartment.mutate(data, {
      onSuccess: () => {
        setShowDepartmentDialog(false);
        departmentForm.reset();
      },
    });
  };

  const onCreatePosition = (data: PositionFormData) => {
    createPosition.mutate(data, {
      onSuccess: () => {
        setShowPositionDialog(false);
        positionForm.reset();
      },
    });
  };

  const renderDepartment = (dept: any, level = 0) => {
    const isExpanded = expandedDepts.has(dept.id);
    
    return (
      <div key={dept.id} className={`ml-${level * 6}`}>
        <Card className="mb-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleDepartment(dept.id)}
                  className="p-1"
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  {dept.code && <p className="text-sm text-muted-foreground">Code: {dept.code}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {dept.positions?.length || 0} Positionen
                </Badge>
                <Button variant="outline" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {dept.description && (
              <p className="text-sm text-muted-foreground mt-2">{dept.description}</p>
            )}
            
            <div className="flex gap-4 text-sm text-muted-foreground mt-2">
              {dept.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {dept.location}
                </div>
              )}
              {dept.cost_center && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Kostenstelle: {dept.cost_center}
                </div>
              )}
            </div>
          </CardHeader>
          
          {isExpanded && (
            <CardContent className="pt-0">
              {/* Positionen in dieser Abteilung */}
              {dept.positions && dept.positions.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Positionen
                  </h4>
                  <div className="grid gap-2">
                    {dept.positions.map((position: any) => (
                      <div key={position.id} className="p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{position.title}</h5>
                            <p className="text-sm text-muted-foreground">
                              Level {position.job_level}
                              {position.salary_band_min && position.salary_band_max && (
                                <span className="ml-2">
                                  €{position.salary_band_min.toLocaleString()} - €{position.salary_band_max.toLocaleString()}
                                </span>
                              )}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {position.responsibilities && (
                          <p className="text-sm text-muted-foreground mt-2">{position.responsibilities}</p>
                        )}
                        {position.skills_required && position.skills_required.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {position.skills_required.slice(0, 3).map((skill: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {position.skills_required.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{position.skills_required.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Unterabteilungen */}
              {dept.children && dept.children.length > 0 && (
                <div>
                  <Separator className="my-4" />
                  <h4 className="font-medium mb-3">Unterabteilungen</h4>
                  {dept.children.map((child: any) => renderDepartment(child, level + 1))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Lade Organisationsstruktur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Organisationsstruktur</h2>
          <p className="text-muted-foreground">
            {departments?.length || 0} Abteilungen • {positions?.length || 0} Positionen
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showPositionDialog} onOpenChange={setShowPositionDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Position
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neue Position erstellen</DialogTitle>
              </DialogHeader>
              <form onSubmit={positionForm.handleSubmit(onCreatePosition)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    {...positionForm.register('title', { required: true })}
                    placeholder="z.B. Senior Developer"
                  />
                </div>
                <div>
                  <Label htmlFor="department_id">Abteilung</Label>
                  <Select onValueChange={(value) => positionForm.setValue('department_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Abteilung wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="job_level">Job Level</Label>
                  <Input
                    id="job_level"
                    type="number"
                    {...positionForm.register('job_level', { required: true, valueAsNumber: true })}
                    placeholder="1-10"
                    min="1"
                    max="10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salary_band_min">Min. Gehalt</Label>
                    <Input
                      id="salary_band_min"
                      type="number"
                      {...positionForm.register('salary_band_min', { valueAsNumber: true })}
                      placeholder="40000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary_band_max">Max. Gehalt</Label>
                    <Input
                      id="salary_band_max"
                      type="number"
                      {...positionForm.register('salary_band_max', { valueAsNumber: true })}
                      placeholder="60000"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="responsibilities">Verantwortlichkeiten</Label>
                  <Textarea
                    id="responsibilities"
                    {...positionForm.register('responsibilities')}
                    placeholder="Beschreibung der Aufgaben und Verantwortlichkeiten"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowPositionDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button type="submit" disabled={createPosition.isPending}>
                    {createPosition.isPending ? 'Erstelle...' : 'Erstellen'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showDepartmentDialog} onOpenChange={setShowDepartmentDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Abteilung
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neue Abteilung erstellen</DialogTitle>
              </DialogHeader>
              <form onSubmit={departmentForm.handleSubmit(onCreateDepartment)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...departmentForm.register('name', { required: true })}
                    placeholder="z.B. IT-Abteilung"
                  />
                </div>
                <div>
                  <Label htmlFor="code">Code (optional)</Label>
                  <Input
                    id="code"
                    {...departmentForm.register('code')}
                    placeholder="z.B. IT"
                  />
                </div>
                <div>
                  <Label htmlFor="parent_id">Übergeordnete Abteilung</Label>
                  <Select onValueChange={(value) => departmentForm.setValue('parent_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Keine (Hauptabteilung)" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Standort</Label>
                  <Input
                    id="location"
                    {...departmentForm.register('location')}
                    placeholder="z.B. München, Büro 3"
                  />
                </div>
                <div>
                  <Label htmlFor="cost_center">Kostenstelle</Label>
                  <Input
                    id="cost_center"
                    {...departmentForm.register('cost_center')}
                    placeholder="z.B. 4000"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    {...departmentForm.register('description')}
                    placeholder="Beschreibung der Abteilung und ihrer Aufgaben"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowDepartmentDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button type="submit" disabled={createDepartment.isPending}>
                    {createDepartment.isPending ? 'Erstelle...' : 'Erstellen'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Organization Chart */}
      <div className="space-y-4">
        {hierarchy && hierarchy.length > 0 ? (
          hierarchy.map((dept) => renderDepartment(dept))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Noch keine Organisationsstruktur</h3>
              <p className="text-muted-foreground text-center mb-4">
                Erstellen Sie Ihre erste Abteilung, um mit dem Aufbau Ihrer Organisationsstruktur zu beginnen.
              </p>
              <Button onClick={() => setShowDepartmentDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Erste Abteilung erstellen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrganizationChart;