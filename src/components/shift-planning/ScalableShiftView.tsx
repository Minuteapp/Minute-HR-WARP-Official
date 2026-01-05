import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Users, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  BarChart3,
  Settings,
  Plus,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { OrganizationalFilter } from './OrganizationalFilter';
import { useShiftPlanning } from '@/hooks/useShiftPlanning';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  department: string;
  team?: string;
  position: string;
  skills: string[];
  current_shift?: {
    type: string;
    start_time: string;
    end_time: string;
    status: 'active' | 'break' | 'ended';
  };
}

interface ShiftStats {
  total_employees: number;
  active_shifts: number;
  upcoming_shifts: number;
  understaffed_shifts: number;
  coverage_percentage: number;
}

export const ScalableShiftView: React.FC = () => {
  const [selectedFilters, setSelectedFilters] = useState<{
    locationId?: string;
    departmentId?: string;
    teamId?: string;
  }>({});
  
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [shiftStats, setShiftStats] = useState<ShiftStats>({
    total_employees: 0,
    active_shifts: 0,
    upcoming_shifts: 0,
    understaffed_shifts: 0,
    coverage_percentage: 0
  });
  
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'planning'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  
  const { shifts, employees, isLoading: hookLoading, fetchShifts } = useShiftPlanning();

  // Lade gefilterte Mitarbeiterdaten basierend auf Organisationsauswahl
  useEffect(() => {
    loadFilteredData();
  }, [selectedFilters]);

  const loadFilteredData = async () => {
    setIsLoading(true);
    try {
      // Simuliere API-Aufruf mit gefilterten Daten
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let mockEmployees: Employee[] = [];
      
      if (selectedFilters.teamId) {
        // Team-spezifische Daten (15-150 Mitarbeiter)
        mockEmployees = generateTeamEmployees(selectedFilters.teamId);
      } else if (selectedFilters.departmentId) {
        // Abteilungs-spezifische Daten (200-800 Mitarbeiter)  
        mockEmployees = generateDepartmentEmployees(selectedFilters.departmentId);
      } else if (selectedFilters.locationId) {
        // Standort-spezifische Daten (600-3200 Mitarbeiter)
        mockEmployees = generateLocationEmployees(selectedFilters.locationId);
      } else {
        // Übersicht aller Standorte (nur Statistiken, keine Einzeldaten)
        mockEmployees = [];
      }
      
      setFilteredEmployees(mockEmployees);
      
      // Berechne Statistiken
      const stats = calculateShiftStats(mockEmployees);
      setShiftStats(stats);
      
    } catch (error) {
      console.error('Fehler beim Laden der gefilterten Daten:', error);
      toast.error('Fehler beim Laden der Schichtdaten');
    } finally {
      setIsLoading(false);
    }
  };

  // Generiere Mitarbeiterdaten für ein Team - ZERO DATA für neue Firmen
  const generateTeamEmployees = (teamId: string): Employee[] => {
    // Für neue Firmen: leeres Array, später durch Supabase-Query ersetzen
    return [];
  };

  const generateDepartmentEmployees = (departmentId: string): Employee[] => {
    // Für Abteilungsansicht - laden wir Team-Übersichten statt Einzelpersonen
    const teams = getTeamsForDepartment(departmentId);
    const employees: Employee[] = [];
    
    teams.forEach((team, index) => {
      // Pro Team nur Teamleiter und ein paar Key-Mitarbeiter anzeigen
      employees.push({
        id: `lead-${team.id}`,
        name: `Teamleiter ${team.name}`,
        department: getDepartmentName(departmentId),
        team: team.name,
        position: 'Teamleiter',
        skills: ['Leadership', 'Planning'],
        current_shift: {
          type: 'Tagschicht',
          start_time: '08:00',
          end_time: '17:00',
          status: 'active'
        }
      });
    });
    
    return employees;
  };

  const generateLocationEmployees = (locationId: string): Employee[] => {
    // Für Standortansicht - nur Abteilungsleiter und Statistiken
    return [];
  };

  const calculateShiftStats = (employees: Employee[]): ShiftStats => {
    const activeShifts = employees.filter(emp => emp.current_shift?.status === 'active').length;
    const totalEmployees = employees.length;
    
    return {
      total_employees: totalEmployees,
      active_shifts: activeShifts,
      upcoming_shifts: 0, // Wird aus der DB geladen
      understaffed_shifts: 0, // Wird aus der DB geladen
      coverage_percentage: totalEmployees > 0 ? Math.round((activeShifts / totalEmployees) * 100) : 0
    };
  };

  const getEmployeeCountForFilter = (): number => {
    // Echte Counts werden aus der DB geladen
    return 0;
  };

  // Hilfsfunktionen für realistische Daten
  const getDepartmentName = (id: string): string => {
    const mapping: Record<string, string> = {
      'team-1-1-1': 'Produktion',
      'team-1-1-2': 'Produktion', 
      'team-1-1-3': 'Qualitätssicherung',
      'team-1-3-1': 'IT & Entwicklung',
      'team-1-3-2': 'IT & Entwicklung'
    };
    return mapping[id] || 'Allgemein';
  };

  const getTeamName = (id: string): string => {
    const mapping: Record<string, string> = {
      'team-1-1-1': 'Montage A',
      'team-1-1-2': 'Montage B',
      'team-1-1-3': 'Qualitätskontrolle', 
      'team-1-3-1': 'Frontend Development',
      'team-1-3-2': 'Backend Development'
    };
    return mapping[id] || 'Team';
  };

  // Feste Standardwerte statt Random-Funktionen
  const getDefaultPosition = (): string => 'Mitarbeiter';
  const getDefaultSkills = (): string[] => [];
  const getDefaultShiftType = (): string => 'Tagschicht';
  const getDefaultStartTime = (): string => '08:00';
  const getDefaultEndTime = (): string => '17:00';
  const getDefaultShiftStatus = (): 'active' | 'break' | 'ended' => 'active';

  const getTeamsForDepartment = (departmentId: string) => {
    // Mock-Teams für Abteilungen
    return [
      { id: 'team-1', name: 'Team Alpha' },
      { id: 'team-2', name: 'Team Beta' },
      { id: 'team-3', name: 'Team Gamma' }
    ];
  };

  const handleAutoAssign = async () => {
    if (!selectedFilters.teamId && !selectedFilters.departmentId) {
      toast.error('Bitte wählen Sie zuerst ein Team oder eine Abteilung aus');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simuliere automatische Schichtzuweisung
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Schichten wurden erfolgreich automatisch zugewiesen');
      await loadFilteredData(); // Daten neu laden
    } catch (error) {
      toast.error('Fehler bei der automatischen Zuweisung');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Organisationsfilter */}
      <OrganizationalFilter 
        onFilterChange={setSelectedFilters}
        selectedFilters={selectedFilters}
      />

      {/* Statistik-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mitarbeiter</p>
                <p className="text-2xl font-bold">{shiftStats.total_employees.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Schichten</p>
                <p className="text-2xl font-bold text-green-600">{shiftStats.active_shifts}</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Geplante Schichten</p>
                <p className="text-2xl font-bold text-blue-600">{shiftStats.upcoming_shifts}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unterbesetzt</p>
                <p className="text-2xl font-bold text-red-600">{shiftStats.understaffed_shifts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abdeckung</p>
                <p className="text-2xl font-bold text-purple-600">{shiftStats.coverage_percentage}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hauptinhalt mit Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Schichtplanung - Skalierbare Ansicht
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadFilteredData()}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Aktualisieren
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAutoAssign}
                disabled={isLoading}
              >
                <Plus className="w-4 h-4" />
                Auto-Zuweisung
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="detailed">Detailansicht</TabsTrigger>
              <TabsTrigger value="planning">Planung</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {!selectedFilters.locationId ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Wählen Sie einen Standort aus, um die Schichtübersicht zu sehen.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Schichtverteilung {selectedFilters.teamId ? 'Team-Ebene' : 
                                      selectedFilters.departmentId ? 'Abteilungs-Ebene' : 
                                      'Standort-Ebene'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['Frühschicht', 'Spätschicht', 'Nachtschicht'].map(shiftType => (
                      <Card key={shiftType}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{shiftType}</h4>
                            <Badge variant="outline">
                              0 Personen
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Besetzt:</span>
                              <span className="text-muted-foreground">
                                —/—
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: '0%' }}
                              ></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Wählen Sie ein Team aus, um Mitarbeiterdetails zu sehen.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {filteredEmployees.map(employee => (
                      <Card key={employee.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div>
                                <h4 className="font-medium">{employee.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {employee.position} • {employee.team}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {employee.current_shift ? (
                                <Badge 
                                  variant={employee.current_shift.status === 'active' ? 'default' : 'secondary'}
                                >
                                  {employee.current_shift.type} ({employee.current_shift.start_time}-{employee.current_shift.end_time})
                                </Badge>
                              ) : (
                                <Badge variant="outline">Keine aktive Schicht</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="planning" className="space-y-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">Intelligente Schichtplanung</h3>
                <p className="text-muted-foreground mb-4">
                  KI-gestützte Optimierung für {shiftStats.total_employees.toLocaleString()} Mitarbeiter
                </p>
                <div className="flex justify-center gap-2">
                  <Button onClick={handleAutoAssign} disabled={isLoading}>
                    <Plus className="w-4 h-4 mr-2" />
                    Auto-Planung starten
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Regeln konfigurieren
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};