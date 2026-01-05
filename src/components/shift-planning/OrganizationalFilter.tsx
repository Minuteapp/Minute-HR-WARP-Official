import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, MapPin, Filter, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface OrganizationalLevel {
  id: string;
  name: string;
  type: 'location' | 'department' | 'team';
  parent_id?: string;
  employee_count: number;
  active_shifts?: number;
}

interface OrganizationalFilterProps {
  onFilterChange: (filters: {
    locationId?: string;
    departmentId?: string;
    teamId?: string;
    employeeIds?: string[];
  }) => void;
  selectedFilters: {
    locationId?: string;
    departmentId?: string;
    teamId?: string;
  };
}

export const OrganizationalFilter: React.FC<OrganizationalFilterProps> = ({
  onFilterChange,
  selectedFilters
}) => {
  // Echte Standorte aus der Datenbank laden
  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['locations-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      
      // Mitarbeiteranzahl pro Standort ermitteln
      const locationsWithCounts = await Promise.all(
        (data || []).map(async (loc) => {
          const { count } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('location_id', loc.id)
            .eq('status', 'active');
          
          return {
            id: loc.id,
            name: loc.name,
            type: 'location' as const,
            employee_count: count || 0,
            active_shifts: 0
          };
        })
      );
      
      return locationsWithCounts;
    }
  });

  // Echte Abteilungen aus der Datenbank laden
  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      
      // Mitarbeiteranzahl pro Abteilung ermitteln
      const departmentsWithCounts = await Promise.all(
        (data || []).map(async (dept) => {
          const { count } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('department', dept.name)
            .eq('status', 'active');
          
          return {
            id: dept.id,
            name: dept.name,
            type: 'department' as const,
            employee_count: count || 0,
            active_shifts: 0
          };
        })
      );
      
      return departmentsWithCounts;
    }
  });

  // Echte Teams aus der Datenbank laden
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams-filter', selectedFilters.departmentId],
    queryFn: async () => {
      let query = supabase
        .from('teams')
        .select('id, name, department_id')
        .order('name');
      
      if (selectedFilters.departmentId) {
        query = query.eq('department_id', selectedFilters.departmentId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(team => ({
        id: team.id,
        name: team.name,
        type: 'team' as const,
        parent_id: team.department_id,
        employee_count: 0,
        active_shifts: 0
      }));
    },
    enabled: true
  });

  const isLoading = locationsLoading || departmentsLoading || teamsLoading;

  const handleLocationChange = (locationId: string) => {
    onFilterChange({
      locationId: locationId === 'all' ? undefined : locationId,
      departmentId: undefined,
      teamId: undefined
    });
  };

  const handleDepartmentChange = (departmentId: string) => {
    onFilterChange({
      ...selectedFilters,
      departmentId: departmentId === 'all' ? undefined : departmentId,
      teamId: undefined
    });
  };

  const handleTeamChange = (teamId: string) => {
    onFilterChange({
      ...selectedFilters,
      teamId: teamId === 'all' ? undefined : teamId
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const selectedLocation = locations.find(l => l.id === selectedFilters.locationId);
  const selectedDepartment = departments.find(d => d.id === selectedFilters.departmentId);
  const selectedTeam = teams.find(t => t.id === selectedFilters.teamId);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Organisationsfilter
          {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hierarchische Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Standort */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Standort
            </label>
            <Select value={selectedFilters.locationId || 'all'} onValueChange={handleLocationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Standort wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Standorte</SelectItem>
                {locations.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Keine Standorte vorhanden
                  </div>
                ) : (
                  locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{location.name}</span>
                        <Badge variant="secondary" className="text-xs ml-2">
                          {location.employee_count} MA
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Abteilung */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Abteilung
            </label>
            <Select 
              value={selectedFilters.departmentId || 'all'} 
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Abteilung wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Abteilungen</SelectItem>
                {departments.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Keine Abteilungen vorhanden
                  </div>
                ) : (
                  departments.map(department => (
                    <SelectItem key={department.id} value={department.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{department.name}</span>
                        <Badge variant="secondary" className="text-xs ml-2">
                          {department.employee_count} MA
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Team */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team
            </label>
            <Select 
              value={selectedFilters.teamId || 'all'} 
              onValueChange={handleTeamChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Team wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Teams</SelectItem>
                {teams.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Keine Teams vorhanden
                  </div>
                ) : (
                  teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Aktuelle Auswahl */}
        {(selectedLocation || selectedDepartment || selectedTeam) && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Aktuelle Auswahl:</span>
            <div className="flex items-center gap-2">
              {selectedLocation && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedLocation.name}
                </Badge>
              )}
              {selectedDepartment && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {selectedDepartment.name}
                </Badge>
              )}
              {selectedTeam && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {selectedTeam.name}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={clearFilters} className="ml-2">
                Filter zurücksetzen
              </Button>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              Gefiltert: {
                selectedTeam ? `${selectedTeam.employee_count} Mitarbeiter` :
                selectedDepartment ? `${selectedDepartment.employee_count} Mitarbeiter` :
                selectedLocation ? `${selectedLocation.employee_count} Mitarbeiter` :
                'Alle Mitarbeiter'
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
