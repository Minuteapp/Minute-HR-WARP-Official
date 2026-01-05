import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, ArrowUpRight, ArrowDownRight, Minus, Filter, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

interface CalibrationEmployee {
  id: string;
  name: string;
  position: string;
  department: string;
  performance_rating: 1 | 2 | 3;
  potential_rating: 1 | 2 | 3;
  succession_readiness: 'ready_now' | 'ready_1_year' | 'ready_2_years' | 'not_ready';
  flight_risk_level: 'low' | 'medium' | 'high';
  calibration_notes?: string;
}

interface MatrixCell {
  performance: number;
  potential: number;
  label: string;
  color: string;
  description: string;
}

export const CalibrationMatrix = () => {
  const { tenantCompany } = useTenant();
  const currentCompanyId = tenantCompany?.id;
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedCycle, setSelectedCycle] = useState<string>('current');
  
  // ECHTE DATEN: Laden aus Supabase mit company_id Filter
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['calibration-employees', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      
      const { data, error } = await supabase
        .from('calibration_employees')
        .select(`
          id,
          performance_rating,
          potential_rating,
          succession_readiness,
          flight_risk_level,
          calibration_notes,
          employees(first_name, last_name, position, department)
        `)
        .eq('company_id', currentCompanyId);

      if (error) {
        console.error('Error fetching calibration data:', error);
        return [];
      }

      return (data || []).map((item: any): CalibrationEmployee => ({
        id: item.id,
        name: item.employees 
          ? `${item.employees.first_name || ''} ${item.employees.last_name || ''}`.trim() || 'Unbekannt'
          : 'Unbekannt',
        position: item.employees?.position || 'Unbekannt',
        department: item.employees?.department || 'Unbekannt',
        performance_rating: item.performance_rating || 2,
        potential_rating: item.potential_rating || 2,
        succession_readiness: item.succession_readiness || 'not_ready',
        flight_risk_level: item.flight_risk_level || 'low',
        calibration_notes: item.calibration_notes
      }));
    },
    enabled: !!currentCompanyId
  });

  const matrixCells: MatrixCell[] = [
    { performance: 3, potential: 3, label: 'Stars', color: 'bg-green-500', description: 'Top Performer mit hohem Potenzial' },
    { performance: 3, potential: 2, label: 'Core Players', color: 'bg-blue-500', description: 'Zuverlässige Leistungsträger' },
    { performance: 3, potential: 1, label: 'Specialists', color: 'bg-purple-500', description: 'Experten in ihrem Bereich' },
    { performance: 2, potential: 3, label: 'High Potential', color: 'bg-yellow-500', description: 'Hohes Entwicklungspotenzial' },
    { performance: 2, potential: 2, label: 'Solid Performers', color: 'bg-gray-400', description: 'Konstante Leistung' },
    { performance: 2, potential: 1, label: 'Workhorses', color: 'bg-orange-500', description: 'Fleißige Arbeiter' },
    { performance: 1, potential: 3, label: 'Rough Diamonds', color: 'bg-cyan-500', description: 'Ungeschliffene Diamanten' },
    { performance: 1, potential: 2, label: 'Inconsistent Players', color: 'bg-red-400', description: 'Inkonsistente Leistung' },
    { performance: 1, potential: 1, label: 'Low Performers', color: 'bg-red-600', description: 'Entwicklung erforderlich' }
  ];

  const getEmployeesInCell = (performance: number, potential: number) => {
    return employees.filter(emp => 
      emp.performance_rating === performance && 
      emp.potential_rating === potential &&
      (selectedDepartment === 'all' || emp.department === selectedDepartment)
    );
  };

  const getCellInfo = (performance: number, potential: number) => {
    return matrixCells.find(cell => cell.performance === performance && cell.potential === potential);
  };

  const getFlightRiskIcon = (level: CalibrationEmployee['flight_risk_level']) => {
    switch (level) {
      case 'low': return <ArrowDownRight className="h-3 w-3 text-green-600" />;
      case 'medium': return <Minus className="h-3 w-3 text-yellow-600" />;
      case 'high': return <ArrowUpRight className="h-3 w-3 text-red-600" />;
    }
  };

  const getReadinessColor = (readiness: CalibrationEmployee['succession_readiness']) => {
    switch (readiness) {
      case 'ready_now': return 'bg-green-100 text-green-800';
      case 'ready_1_year': return 'bg-blue-100 text-blue-800';
      case 'ready_2_years': return 'bg-yellow-100 text-yellow-800';
      case 'not_ready': return 'bg-gray-100 text-gray-800';
    }
  };

  const getReadinessText = (readiness: CalibrationEmployee['succession_readiness']) => {
    switch (readiness) {
      case 'ready_now': return 'Bereit';
      case 'ready_1_year': return '1 Jahr';
      case 'ready_2_years': return '2 Jahre';
      case 'not_ready': return 'Nicht bereit';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">9-Box Kalibrierung</h2>
          <p className="text-sm text-gray-500">Performance vs. Potenzial Matrix mit Drag & Drop</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Kalibrierungs-Session
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <Select value={selectedCycle} onValueChange={setSelectedCycle}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Zyklus auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Aktueller Zyklus</SelectItem>
            <SelectItem value="q4-2024">Q4 2024</SelectItem>
            <SelectItem value="q3-2024">Q3 2024</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Abteilung" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Product">Product</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Customer Success">Customer Success</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Weitere Filter
        </Button>
      </div>

      {employees.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Kalibrierungsdaten</h3>
              <p className="text-muted-foreground mb-4">
                Es wurden noch keine Mitarbeiter für die Kalibrierung hinzugefügt.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Kalibrierung starten
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 9-Box Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>9-Box Performance Matrix</CardTitle>
              <CardDescription>Drag & Drop Kalibrierung - Performance (X-Achse) vs. Potenzial (Y-Achse)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-1 max-w-4xl">
                {/* Header Row */}
                <div className="p-2"></div>
                <div className="p-2 text-center font-medium text-sm">
                  Entwicklungsbedürftig<br/>
                  <span className="text-xs text-gray-500">(Performance 1)</span>
                </div>
                <div className="p-2 text-center font-medium text-sm">
                  Erfüllt Erwartungen<br/>
                  <span className="text-xs text-gray-500">(Performance 2)</span>
                </div>
                <div className="p-2 text-center font-medium text-sm">
                  Übertrifft Erwartungen<br/>
                  <span className="text-xs text-gray-500">(Performance 3)</span>
                </div>

                {/* Row 1 - High Potential */}
                <div className="p-2 text-center font-medium text-sm transform -rotate-90 flex items-center justify-center">
                  <span>Hohes Potenzial (3)</span>
                </div>
                {[1, 2, 3].map(performance => {
                  const cellInfo = getCellInfo(performance, 3);
                  const employeesInCell = getEmployeesInCell(performance, 3);
                  return (
                    <div 
                      key={`${performance}-3`}
                      className={`${cellInfo?.color} min-h-32 p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-500 transition-colors`}
                    >
                      <div className="text-white font-medium text-xs mb-2">{cellInfo?.label}</div>
                      <div className="space-y-1">
                        {employeesInCell.map(employee => (
                          <div 
                            key={employee.id}
                            className="bg-white/90 p-2 rounded text-xs cursor-move hover:bg-white transition-colors"
                            draggable
                          >
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-gray-600">{employee.position}</div>
                            <div className="flex items-center gap-1 mt-1">
                              {getFlightRiskIcon(employee.flight_risk_level)}
                              <Badge variant="outline" className={`${getReadinessColor(employee.succession_readiness)} border-0 text-xs`}>
                                {getReadinessText(employee.succession_readiness)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Row 2 - Medium Potential */}
                <div className="p-2 text-center font-medium text-sm transform -rotate-90 flex items-center justify-center">
                  <span>Mittleres Potenzial (2)</span>
                </div>
                {[1, 2, 3].map(performance => {
                  const cellInfo = getCellInfo(performance, 2);
                  const employeesInCell = getEmployeesInCell(performance, 2);
                  return (
                    <div 
                      key={`${performance}-2`}
                      className={`${cellInfo?.color} min-h-32 p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-500 transition-colors`}
                    >
                      <div className="text-white font-medium text-xs mb-2">{cellInfo?.label}</div>
                      <div className="space-y-1">
                        {employeesInCell.map(employee => (
                          <div 
                            key={employee.id}
                            className="bg-white/90 p-2 rounded text-xs cursor-move hover:bg-white transition-colors"
                            draggable
                          >
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-gray-600">{employee.position}</div>
                            <div className="flex items-center gap-1 mt-1">
                              {getFlightRiskIcon(employee.flight_risk_level)}
                              <Badge variant="outline" className={`${getReadinessColor(employee.succession_readiness)} border-0 text-xs`}>
                                {getReadinessText(employee.succession_readiness)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Row 3 - Low Potential */}
                <div className="p-2 text-center font-medium text-sm transform -rotate-90 flex items-center justify-center">
                  <span>Niedriges Potenzial (1)</span>
                </div>
                {[1, 2, 3].map(performance => {
                  const cellInfo = getCellInfo(performance, 1);
                  const employeesInCell = getEmployeesInCell(performance, 1);
                  return (
                    <div 
                      key={`${performance}-1`}
                      className={`${cellInfo?.color} min-h-32 p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-500 transition-colors`}
                    >
                      <div className="text-white font-medium text-xs mb-2">{cellInfo?.label}</div>
                      <div className="space-y-1">
                        {employeesInCell.map(employee => (
                          <div 
                            key={employee.id}
                            className="bg-white/90 p-2 rounded text-xs cursor-move hover:bg-white transition-colors"
                            draggable
                          >
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-gray-600">{employee.position}</div>
                            <div className="flex items-center gap-1 mt-1">
                              {getFlightRiskIcon(employee.flight_risk_level)}
                              <Badge variant="outline" className={`${getReadinessColor(employee.succession_readiness)} border-0 text-xs`}>
                                {getReadinessText(employee.succession_readiness)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Legende */}
          <Card>
            <CardHeader>
              <CardTitle>Legende & Aktionsempfehlungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {matrixCells.map(cell => (
                  <div key={`${cell.performance}-${cell.potential}`} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${cell.color}`}></div>
                    <div>
                      <div className="font-medium text-sm">{cell.label}</div>
                      <div className="text-xs text-gray-600">{cell.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-2">Flight Risk Indikatoren:</h4>
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3 text-green-600" />
                    <span>Niedrig</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Minus className="h-3 w-3 text-yellow-600" />
                    <span>Mittel</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-red-600" />
                    <span>Hoch</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verteilungsstatistiken */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {employees.filter(e => e.performance_rating === 3 && e.potential_rating === 3).length}
                </div>
                <p className="text-sm text-gray-600">Stars</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {employees.filter(e => e.potential_rating === 3).length}
                </div>
                <p className="text-sm text-gray-600">High Potential</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {employees.filter(e => e.flight_risk_level === 'high').length}
                </div>
                <p className="text-sm text-gray-600">Flight Risk</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
