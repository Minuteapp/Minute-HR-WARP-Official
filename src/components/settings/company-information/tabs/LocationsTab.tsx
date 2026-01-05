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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Plus, Pencil, Trash2, Clock, Calendar, Building2, Settings, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface Location {
  id: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  timezone: string;
  holidayCalendar: string;
  laborLaw: string;
  locationType: string;
  openingHours: string;
  maxCapacity: number;
  ownTimeTrackingRules: boolean;
  ownShiftPlanning: boolean;
  ownAbsenceLogic: boolean;
  ownComplianceRules: boolean;
  status: 'active' | 'inactive';
}

export function LocationsTab() {
  const queryClient = useQueryClient();
  const { tenantCompany } = useTenant();
  const currentCompanyId = tenantCompany?.id;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<Partial<Location>>({
    name: '',
    street: '',
    postalCode: '',
    city: '',
    country: 'DE',
    timezone: 'Europe/Berlin',
    holidayCalendar: '',
    laborLaw: 'DE',
    locationType: 'office',
    openingHours: '',
    maxCapacity: 0,
    ownTimeTrackingRules: false,
    ownShiftPlanning: false,
    ownAbsenceLogic: false,
    ownComplianceRules: false,
    status: 'active',
  });

  // Fetch locations from database
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('name');
      
      if (error) throw error;
      
      return (data || []).map(loc => ({
        id: loc.id,
        name: loc.name || '',
        street: loc.address || '',
        postalCode: loc.postal_code || '',
        city: loc.city || '',
        country: loc.country || 'DE',
        timezone: loc.timezone || 'Europe/Berlin',
        holidayCalendar: loc.holiday_calendar || '',
        laborLaw: loc.labor_law || 'DE',
        locationType: loc.location_type || 'office',
        openingHours: loc.opening_hours || '',
        maxCapacity: loc.max_capacity || 0,
        ownTimeTrackingRules: loc.own_time_tracking_rules || false,
        ownShiftPlanning: loc.own_shift_planning || false,
        ownAbsenceLogic: loc.own_absence_logic || false,
        ownComplianceRules: loc.own_compliance_rules || false,
        status: (loc.is_active ? 'active' : 'inactive') as 'active' | 'inactive',
      }));
    },
    enabled: !!currentCompanyId,
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (newLocation: Partial<Location>) => {
      const { error } = await supabase
        .from('locations')
        .insert({
          company_id: currentCompanyId,
          name: newLocation.name,
          address: newLocation.street,
          postal_code: newLocation.postalCode,
          city: newLocation.city,
          country: newLocation.country,
          timezone: newLocation.timezone,
          holiday_calendar: newLocation.holidayCalendar,
          labor_law: newLocation.laborLaw,
          location_type: newLocation.locationType,
          opening_hours: newLocation.openingHours,
          max_capacity: newLocation.maxCapacity,
          own_time_tracking_rules: newLocation.ownTimeTrackingRules,
          own_shift_planning: newLocation.ownShiftPlanning,
          own_absence_logic: newLocation.ownAbsenceLogic,
          own_compliance_rules: newLocation.ownComplianceRules,
          is_active: newLocation.status === 'active',
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', currentCompanyId] });
      toast.success('Standort wurde hinzugefügt');
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error('Fehler beim Hinzufügen des Standorts');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Location> }) => {
      const { error } = await supabase
        .from('locations')
        .update({
          name: data.name,
          address: data.street,
          postal_code: data.postalCode,
          city: data.city,
          country: data.country,
          timezone: data.timezone,
          holiday_calendar: data.holidayCalendar,
          labor_law: data.laborLaw,
          location_type: data.locationType,
          opening_hours: data.openingHours,
          max_capacity: data.maxCapacity,
          own_time_tracking_rules: data.ownTimeTrackingRules,
          own_shift_planning: data.ownShiftPlanning,
          own_absence_logic: data.ownAbsenceLogic,
          own_compliance_rules: data.ownComplianceRules,
          is_active: data.status === 'active',
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', currentCompanyId] });
      toast.success('Standort wurde aktualisiert');
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren des Standorts');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', currentCompanyId] });
      toast.success('Standort wurde gelöscht');
    },
    onError: () => {
      toast.error('Fehler beim Löschen des Standorts');
    },
  });

  const countries = [
    { value: 'DE', label: 'Deutschland' },
    { value: 'AT', label: 'Österreich' },
    { value: 'CH', label: 'Schweiz' },
    { value: 'NL', label: 'Niederlande' },
    { value: 'BE', label: 'Belgien' },
    { value: 'FR', label: 'Frankreich' },
    { value: 'PL', label: 'Polen' },
  ];

  const timezones = [
    { value: 'Europe/Berlin', label: 'Berlin (UTC+1/+2)' },
    { value: 'Europe/Vienna', label: 'Wien (UTC+1/+2)' },
    { value: 'Europe/Zurich', label: 'Zürich (UTC+1/+2)' },
    { value: 'Europe/Amsterdam', label: 'Amsterdam (UTC+1/+2)' },
    { value: 'Europe/Brussels', label: 'Brüssel (UTC+1/+2)' },
    { value: 'Europe/Paris', label: 'Paris (UTC+1/+2)' },
    { value: 'Europe/Warsaw', label: 'Warschau (UTC+1/+2)' },
  ];

  const holidayCalendars = [
    { value: 'BY', label: 'Bayern' },
    { value: 'BW', label: 'Baden-Württemberg' },
    { value: 'BE', label: 'Berlin' },
    { value: 'BB', label: 'Brandenburg' },
    { value: 'HB', label: 'Bremen' },
    { value: 'HH', label: 'Hamburg' },
    { value: 'HE', label: 'Hessen' },
    { value: 'NI', label: 'Niedersachsen' },
    { value: 'NW', label: 'Nordrhein-Westfalen' },
    { value: 'RP', label: 'Rheinland-Pfalz' },
    { value: 'SL', label: 'Saarland' },
    { value: 'SN', label: 'Sachsen' },
    { value: 'ST', label: 'Sachsen-Anhalt' },
    { value: 'SH', label: 'Schleswig-Holstein' },
    { value: 'TH', label: 'Thüringen' },
    { value: 'AT', label: 'Österreich' },
    { value: 'CH', label: 'Schweiz' },
  ];

  const locationTypes = [
    { value: 'office', label: 'Büro', icon: '🏢' },
    { value: 'factory', label: 'Werk/Produktion', icon: '🏭' },
    { value: 'branch', label: 'Filiale', icon: '🏪' },
    { value: 'warehouse', label: 'Lager', icon: '📦' },
    { value: 'remote', label: 'Remote/Homeoffice', icon: '🏠' },
  ];

  const handleOpenDialog = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData(location);
    } else {
      setEditingLocation(null);
      setFormData({
        name: '',
        street: '',
        postalCode: '',
        city: '',
        country: 'DE',
        timezone: 'Europe/Berlin',
        holidayCalendar: '',
        laborLaw: 'DE',
        locationType: 'office',
        openingHours: '',
        maxCapacity: 0,
        ownTimeTrackingRules: false,
        ownShiftPlanning: false,
        ownAbsenceLogic: false,
        ownComplianceRules: false,
        status: 'active',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const getCountryLabel = (value: string) => countries.find(c => c.value === value)?.label || value;
  const getLocationTypeLabel = (value: string) => {
    const type = locationTypes.find(t => t.value === value);
    return type ? `${type.icon} ${type.label}` : value;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
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
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Standorte & Niederlassungen
              </CardTitle>
              <CardDescription>
                Verwaltung aller physischen und virtuellen Standorte
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Standort
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Standorte vorhanden</h3>
              <p className="text-muted-foreground mb-4">
                Erstellen Sie Ihren ersten Standort, um Mitarbeiter zuzuweisen.
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Ersten Standort anlegen
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Stadt</TableHead>
                  <TableHead>Land</TableHead>
                  <TableHead>Zeitzone</TableHead>
                  <TableHead>Kapazität</TableHead>
                  <TableHead>Eigene Regeln</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{getLocationTypeLabel(location.locationType)}</TableCell>
                    <TableCell>{location.city}</TableCell>
                    <TableCell>{getCountryLabel(location.country)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{location.timezone}</TableCell>
                    <TableCell>{location.maxCapacity > 0 ? location.maxCapacity : '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {location.ownTimeTrackingRules && <Badge variant="outline" className="text-xs">Zeit</Badge>}
                        {location.ownShiftPlanning && <Badge variant="outline" className="text-xs">Schicht</Badge>}
                        {location.ownAbsenceLogic && <Badge variant="outline" className="text-xs">Abw.</Badge>}
                        {location.ownComplianceRules && <Badge variant="outline" className="text-xs">Compl.</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={location.status === 'active' ? 'default' : 'secondary'}>
                        {location.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(location)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(location.id)}>
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

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Standort bearbeiten' : 'Neuen Standort anlegen'}
            </DialogTitle>
            <DialogDescription>
              Definieren Sie die Eigenschaften und Regeln für diesen Standort
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="mt-4">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="general">Allgemein</TabsTrigger>
              <TabsTrigger value="time">Zeit & Kalender</TabsTrigger>
              <TabsTrigger value="rules">Standortregeln</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Standortname *</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Hauptsitz München"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Standorttyp *</Label>
                  <Select value={formData.locationType} onValueChange={(value) => setFormData({ ...formData, locationType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Typ wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Straße und Hausnummer *</Label>
                  <Input
                    value={formData.street || ''}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="Musterstraße 123"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postleitzahl *</Label>
                  <Input
                    value={formData.postalCode || ''}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stadt *</Label>
                  <Input
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="München"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Land *</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Land wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max. Kapazität (Personen)</Label>
                  <Input
                    type="number"
                    value={formData.maxCapacity || ''}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
                    placeholder="100"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="time" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Zeitzone *</Label>
                  <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Zeitzone wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Feiertagskalender *</Label>
                  <Select value={formData.holidayCalendar} onValueChange={(value) => setFormData({ ...formData, holidayCalendar: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kalender wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {holidayCalendars.map((cal) => (
                        <SelectItem key={cal.value} value={cal.value}>
                          {cal.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Arbeitsrecht (Land/Region)</Label>
                  <Select value={formData.laborLaw} onValueChange={(value) => setFormData({ ...formData, laborLaw: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Arbeitsrecht wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Öffnungszeiten</Label>
                  <Input
                    value={formData.openingHours || ''}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    placeholder="08:00 - 18:00"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Aktivieren Sie eigene Regeln, wenn dieser Standort von den globalen Einstellungen abweichen soll.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Eigene Zeiterfassungsregeln</p>
                      <p className="text-sm text-muted-foreground">
                        Abweichende Kernzeiten, Pausenregelungen, etc.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.ownTimeTrackingRules}
                    onCheckedChange={(checked) => setFormData({ ...formData, ownTimeTrackingRules: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Eigene Schichtplanung</p>
                      <p className="text-sm text-muted-foreground">
                        Standortspezifische Schichtmodelle und -zeiten
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.ownShiftPlanning}
                    onCheckedChange={(checked) => setFormData({ ...formData, ownShiftPlanning: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Eigene Abwesenheitslogik</p>
                      <p className="text-sm text-muted-foreground">
                        Abweichende Urlaubstage, Genehmigungsprozesse
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.ownAbsenceLogic}
                    onCheckedChange={(checked) => setFormData({ ...formData, ownAbsenceLogic: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Eigene Compliance-Regeln</p>
                      <p className="text-sm text-muted-foreground">
                        Länderspezifische Arbeitsgesetze und Vorschriften
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.ownComplianceRules}
                    onCheckedChange={(checked) => setFormData({ ...formData, ownComplianceRules: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Status</p>
                      <p className="text-sm text-muted-foreground">
                        Standort aktiv oder inaktiv
                      </p>
                    </div>
                  </div>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktiv</SelectItem>
                      <SelectItem value="inactive">Inaktiv</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={addMutation.isPending || updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {editingLocation ? 'Aktualisieren' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
