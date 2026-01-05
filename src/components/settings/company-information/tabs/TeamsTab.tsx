import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCog, Plus, Pencil, Trash2, Users, MapPin, Building2, Info, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface Team {
  id: string;
  name: string;
  teamType: 'permanent' | 'project' | 'temporary';
  departmentId: string;
  departmentName: string;
  locationId: string;
  locationName: string;
  teamLeaderId: string;
  teamLeaderName: string;
  maxSize: number;
  currentSize: number;
  status: 'active' | 'archived';
  description: string;
}

export function TeamsTab() {
  const queryClient = useQueryClient();
  const { tenantCompany } = useTenant();
  const currentCompanyId = tenantCompany?.id;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<Partial<Team>>({
    name: '',
    teamType: 'permanent',
    departmentId: '',
    locationId: '',
    teamLeaderId: '',
    maxSize: 10,
    status: 'active',
    description: '',
  });

  // Fetch teams from database
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          departments:department_id (id, name),
          locations:location_id (id, name),
          team_leader:team_lead_id (id, first_name, last_name)
        `)
        .eq('company_id', currentCompanyId)
        .order('name');
      
      if (error) throw error;
      
      // Count members per team
      const teamIds = (data || []).map(t => t.id);
      const { data: memberCounts } = await supabase
        .from('employees')
        .select('team_id')
        .in('team_id', teamIds);
      
      const countMap = (memberCounts || []).reduce((acc, emp) => {
        acc[emp.team_id] = (acc[emp.team_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return (data || []).map(team => ({
        id: team.id,
        name: team.name || '',
        teamType: (team.team_type || 'permanent') as 'permanent' | 'project' | 'temporary',
        departmentId: team.department_id || '',
        departmentName: team.departments?.name || '',
        locationId: team.location_id || '',
        locationName: team.locations?.name || '',
        teamLeaderId: team.team_lead_id || '',
        teamLeaderName: team.team_leader 
          ? `${team.team_leader.first_name} ${team.team_leader.last_name}` 
          : '',
        maxSize: team.max_size || 10,
        currentSize: countMap[team.id] || 0,
        status: (team.is_active ? 'active' : 'archived') as 'active' | 'archived',
        description: team.description || '',
      }));
    },
    enabled: !!currentCompanyId,
  });

  // Fetch departments for dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ['departments-dropdown', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const { data } = await supabase
        .from('departments')
        .select('id, name')
        .eq('company_id', currentCompanyId)
        .order('name');
      return (data || []).map(d => ({ value: d.id, label: d.name }));
    },
    enabled: !!currentCompanyId,
  });

  // Fetch locations for dropdown
  const { data: locations = [] } = useQuery({
    queryKey: ['locations-dropdown', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const { data } = await supabase
        .from('locations')
        .select('id, name')
        .eq('company_id', currentCompanyId)
        .order('name');
      return (data || []).map(l => ({ value: l.id, label: l.name }));
    },
    enabled: !!currentCompanyId,
  });

  // Fetch employees for team leader dropdown
  const { data: teamLeaders = [] } = useQuery({
    queryKey: ['employees-dropdown', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const { data } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('company_id', currentCompanyId)
        .order('last_name');
      return (data || []).map(e => ({ 
        value: e.id, 
        label: `${e.first_name} ${e.last_name}` 
      }));
    },
    enabled: !!currentCompanyId,
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (newTeam: Partial<Team>) => {
      const { error } = await supabase
        .from('teams')
        .insert({
          company_id: currentCompanyId,
          name: newTeam.name,
          team_type: newTeam.teamType,
          department_id: newTeam.departmentId || null,
          location_id: newTeam.locationId || null,
          team_lead_id: newTeam.teamLeaderId || null,
          max_size: newTeam.maxSize,
          description: newTeam.description,
          is_active: newTeam.status === 'active',
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', currentCompanyId] });
      toast.success('Team wurde hinzugefügt');
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error('Fehler beim Hinzufügen des Teams');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Team> }) => {
      const { error } = await supabase
        .from('teams')
        .update({
          name: data.name,
          team_type: data.teamType,
          department_id: data.departmentId || null,
          location_id: data.locationId || null,
          team_lead_id: data.teamLeaderId || null,
          max_size: data.maxSize,
          description: data.description,
          is_active: data.status === 'active',
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', currentCompanyId] });
      toast.success('Team wurde aktualisiert');
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren des Teams');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', currentCompanyId] });
      toast.success('Team wurde gelöscht');
    },
    onError: () => {
      toast.error('Fehler beim Löschen des Teams');
    },
  });

  const teamTypes = [
    { value: 'permanent', label: 'Fachteam (permanent)', color: 'default' },
    { value: 'project', label: 'Projektteam', color: 'secondary' },
    { value: 'temporary', label: 'Temporäres Team', color: 'outline' },
  ];

  const handleOpenDialog = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData(team);
    } else {
      setEditingTeam(null);
      setFormData({
        name: '',
        teamType: 'permanent',
        departmentId: '',
        locationId: '',
        teamLeaderId: '',
        maxSize: 10,
        status: 'active',
        description: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingTeam) {
      updateMutation.mutate({ id: editingTeam.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const getTeamTypeLabel = (value: string) => teamTypes.find(t => t.value === value)?.label || value;
  const getTeamTypeBadgeVariant = (value: string): 'default' | 'secondary' | 'outline' => {
    const type = teamTypes.find(t => t.value === value);
    return (type?.color as 'default' | 'secondary' | 'outline') || 'default';
  };

  if (teamsLoading) {
    return (
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Strukturelle Teams</AlertTitle>
          <AlertDescription>Laden...</AlertDescription>
        </Alert>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Strukturelle Teams</AlertTitle>
        <AlertDescription>
          Teams hier definiert sind <strong>strukturelle Einheiten</strong> und dienen als Grundlage für:
          Dashboards, Berechtigungen, Workforce Planning, Schichtplanung und Reports.
          Operative Projekt- oder Aufgabenzuweisungen erfolgen in den jeweiligen Modulen.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Teams (Strukturelle Ebene)
              </CardTitle>
              <CardDescription>
                Definition von Fach-, Projekt- und temporären Teams
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Neues Team
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Teams vorhanden</h3>
              <p className="text-muted-foreground mb-4">
                Erstellen Sie Ihr erstes Team, um Mitarbeiter zu organisieren.
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Erstes Team anlegen
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teamname</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Abteilung</TableHead>
                  <TableHead>Standort</TableHead>
                  <TableHead>Teamleiter</TableHead>
                  <TableHead>Größe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{team.name}</span>
                        {team.description && (
                          <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                            {team.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTeamTypeBadgeVariant(team.teamType)}>
                        {getTeamTypeLabel(team.teamType)}
                      </Badge>
                    </TableCell>
                    <TableCell>{team.departmentName || '-'}</TableCell>
                    <TableCell>{team.locationName || '-'}</TableCell>
                    <TableCell>{team.teamLeaderName || '-'}</TableCell>
                    <TableCell>
                      <span className={team.currentSize >= team.maxSize ? 'text-destructive' : ''}>
                        {team.currentSize}/{team.maxSize}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={team.status === 'active' ? 'default' : 'secondary'}>
                        {team.status === 'active' ? 'Aktiv' : 'Archiviert'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(team)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(team.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Statistiken */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <UserCog className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teams.length}</p>
                <p className="text-sm text-muted-foreground">Teams gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {teams.reduce((sum, t) => sum + t.currentSize, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Teammitglieder</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {teams.filter(t => t.teamType === 'permanent').length}
                </p>
                <p className="text-sm text-muted-foreground">Fachteams</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10">
                <MapPin className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {teams.filter(t => t.teamType === 'project').length}
                </p>
                <p className="text-sm text-muted-foreground">Projektteams</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTeam ? 'Team bearbeiten' : 'Neues Team anlegen'}
            </DialogTitle>
            <DialogDescription>
              Definieren Sie die strukturellen Eigenschaften des Teams
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Teamname *</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Frontend Development"
              />
            </div>

            <div className="space-y-2">
              <Label>Teamtyp *</Label>
              <Select value={formData.teamType} onValueChange={(value) => setFormData({ ...formData, teamType: value as Team['teamType'] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Typ wählen" />
                </SelectTrigger>
                <SelectContent>
                  {teamTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Abteilung</Label>
                <Select value={formData.departmentId} onValueChange={(value) => setFormData({ ...formData, departmentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Abteilung wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Standort</Label>
                <Select value={formData.locationId} onValueChange={(value) => setFormData({ ...formData, locationId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Standort wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Teamleiter</Label>
                <Select value={formData.teamLeaderId} onValueChange={(value) => setFormData({ ...formData, teamLeaderId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Leiter wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamLeaders.map((leader) => (
                      <SelectItem key={leader.value} value={leader.value}>
                        {leader.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max. Teamgröße</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.maxSize || ''}
                  onChange={(e) => setFormData({ ...formData, maxSize: parseInt(e.target.value) || 10 })}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Input
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Kurze Beschreibung des Teams"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'archived') => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="archived">Archiviert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={addMutation.isPending || updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {editingTeam ? 'Aktualisieren' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
