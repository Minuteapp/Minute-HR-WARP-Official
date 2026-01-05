
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DatePicker } from "@/components/ui/date-picker";
import { format, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, X, Calendar, Users, FileText, Zap, Filter } from "lucide-react";
import { useShiftPlanning } from '@/hooks/useShiftPlanning';
import { toast } from "sonner";

// In einer vollständigen Implementierung würden diese Daten von einer API kommen
const qualifications = [
  "Erste Hilfe", "Teamleitung", "Kassierer", "Lagerist", "Kundenberater", "Sicherheit"
];

const ShiftAssignment = () => {
  const [activeTab, setActiveTab] = useState("manual");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedShiftType, setSelectedShiftType] = useState<string | null>(null);
  const { employees, shiftTypes, isLoading } = useShiftPlanning();
  
  // Demo-Funktionen
  const assignEmployee = (employeeId, shiftId) => {
    toast.success(`Mitarbeiter ${employeeId} wurde Schicht ${shiftId} zugewiesen`);
  };
  
  const removeAssignment = (employeeId, shiftId) => {
    toast.success(`Mitarbeiter ${employeeId} wurde von Schicht ${shiftId} entfernt`);
  };
  
  const autoAssign = () => {
    toast.success("Automatische Zuweisung durchgeführt");
  };
  
  const clearAssignments = () => {
    toast.success("Alle Zuweisungen wurden zurückgesetzt");
  };
  
  // Filterfunktionen
  const filterByQualification = (qualification) => {
    toast.success(`Filter für Qualifikation "${qualification}" angewendet`);
  };
  
  const filterByAvailability = () => {
    toast.success("Filter für Verfügbarkeit angewendet");
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Mitarbeiterzuweisung</h2>
          <p className="text-sm text-muted-foreground">
            Weisen Sie Mitarbeiter Schichten zu und verwalten Sie deren Verfügbarkeit
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <TabsTrigger value="manual" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Manuelle Zuweisung
          </TabsTrigger>
          <TabsTrigger value="auto" className="flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Automatische Zuweisung
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Massenzuweisung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Manuelle Schichtzuweisung</CardTitle>
              <CardDescription>
                Weisen Sie Mitarbeiter individuell den Schichten zu und passen Sie Zuweisungen an
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="w-full md:w-1/3">
                  <label className="text-sm font-medium mb-2 block">Datum wählen</label>
                  <DatePicker 
                    date={selectedDate} 
                    onChange={(date) => date && setSelectedDate(date)}
                  />
                </div>
                <div className="w-full md:w-2/3">
                  <label className="text-sm font-medium mb-2 block">Schichttyp</label>
                  <div className="grid grid-cols-3 gap-2">
                    {shiftTypes.map(type => (
                      <Button
                        key={type.id}
                        variant={selectedShiftType === type.id ? "default" : "outline"}
                        onClick={() => setSelectedShiftType(type.id)}
                        className="justify-start"
                      >
                        <div className={`w-3 h-3 rounded-full ${type.color || 'bg-blue-500'} mr-2`}></div>
                        {type.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => filterByAvailability()}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Nur verfügbare Mitarbeiter
                </Button>
                
                <Button variant="outline" size="sm" onClick={() => toast.success("Filter zurückgesetzt")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter zurücksetzen
                </Button>
              </div>
              
              <div className="space-y-2 mb-3">
                <label className="text-sm font-medium">Qualifikationsfilter</label>
                <div className="flex flex-wrap gap-2">
                  {qualifications.map(qual => (
                    <Button 
                      key={qual} 
                      variant="outline" 
                      size="sm"
                      onClick={() => filterByQualification(qual)}
                    >
                      {qual}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mitarbeiter</TableHead>
                      <TableHead>Abteilung</TableHead>
                      <TableHead>Qualifikationen</TableHead>
                      <TableHead>Verfügbarkeit</TableHead>
                      <TableHead className="text-right">Aktion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map(employee => {
                      // Verfügbarkeitsstatus wird aus der DB geladen
                      // TODO: Echte Verfügbarkeitsdaten aus shift_assignments laden
                      
                      return (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}`} />
                                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-xs text-muted-foreground">#{employee.id.substring(0, 8)}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {employee.qualifications.map((qual, idx) => (
                                <span 
                                  key={idx} 
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {qual}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center text-green-600">
                              <Check className="h-4 w-4 mr-1" />
                              Verfügbar
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => assignEmployee(employee.id, selectedShiftType)}
                            >
                              Zuweisen
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="auto" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Automatische Schichtzuweisung</CardTitle>
              <CardDescription>
                Lassen Sie das System Mitarbeiter automatisch Schichten zuweisen basierend auf verschiedenen Kriterien
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Zuweisungskriterien</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Zeitraum</label>
                      <div className="flex items-center space-x-2">
                        <DatePicker 
                          date={selectedDate} 
                          onChange={(date) => date && setSelectedDate(date)}
                        />
                        <span>bis</span>
                        <DatePicker 
                          date={addDays(selectedDate, 7)} 
                          onChange={(date) => date && console.log(date)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prioritäten</label>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Qualifikation</span>
                          <span className="font-medium">Hoch</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Mitarbeiterwünsche</span>
                          <span className="font-medium">Mittel</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Gleichmäßige Verteilung</span>
                          <span className="font-medium">Hoch</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Kostenoptimierung</span>
                          <span className="font-medium">Niedrig</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Regelprüfung</label>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Gesetzliche Ruhezeiten</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Max. wöchentliche Arbeitszeit</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Qualifikationsanforderungen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Vorschau</h3>
                  <div className="bg-muted p-4 rounded-lg h-[300px] flex flex-col justify-center items-center">
                    <p className="text-center text-muted-foreground">
                      Noch keine Vorschau verfügbar. 
                      <br />
                      Starten Sie die automatische Zuweisung, um eine Vorschau zu sehen.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={clearAssignments}>
                  Zurücksetzen
                </Button>
                <Button onClick={autoAssign}>
                  <Zap className="h-4 w-4 mr-2" />
                  Automatisch zuweisen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bulk" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Massenzuweisung</CardTitle>
              <CardDescription>
                Weisen Sie mehreren Mitarbeitern Schichten zu oder importieren Sie Zuweisungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">Import aus Datei</h3>
                  <p className="text-sm text-center text-muted-foreground mb-4">
                    Ziehen Sie eine Datei hierher oder klicken Sie, um eine Datei auszuwählen
                  </p>
                  <Button variant="outline">Datei auswählen</Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Unterstützte Formate: .xlsx, .csv
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Vorlagen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button variant="outline" className="justify-start" onClick={() => toast.success("Vorlage 'Standard Wochenplan' geladen")}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Standard Wochenplan
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => toast.success("Vorlage 'Sommerzeiten' geladen")}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Sommerzeiten
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => toast.success("Vorlage 'Feiertage' geladen")}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Feiertage
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={() => toast.success("Massenzuweisung gespeichert")}>
                    Zuweisungen speichern
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftAssignment;
