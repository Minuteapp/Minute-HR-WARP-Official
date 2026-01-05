
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { format, addMonths, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { Download, FileText, FileSpreadsheet, Table, Calendar, Users, Filter, BarChart } from "lucide-react";
import { toast } from "sonner";
import { useShiftPlanning } from '@/hooks/useShiftPlanning';

const ReportExport = () => {
  const [activeTab, setActiveTab] = useState("shifts");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addMonths(new Date(), 1));
  const [exportFormat, setExportFormat] = useState("pdf");
  const [reportType, setReportType] = useState("detail");
  const { shiftTypes, employees } = useShiftPlanning();

  const handleExport = () => {
    toast.success(`Bericht wird als ${exportFormat.toUpperCase()} exportiert`);
    // Hier würde die Export-Logik implementiert werden
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Berichte & Exporte</h2>
          <p className="text-sm text-muted-foreground">
            Erstellen und exportieren Sie Schichtpläne, Analysen und Mitarbeiterberichte
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="shifts" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Schichtpläne</span>
            <span className="inline md:hidden">Schichten</span>
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Mitarbeiterberichte</span>
            <span className="inline md:hidden">Mitarbeiter</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Schichtanalyse</span>
            <span className="inline md:hidden">Analyse</span>
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center">
            <Table className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Lohnexport</span>
            <span className="inline md:hidden">Lohn</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Schichtplanerstellung & Export</CardTitle>
              <CardDescription>
                Erstellen und exportieren Sie Schichtpläne für verschiedene Zeiträume und Mitarbeitergruppen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Startdatum</label>
                    <DatePicker 
                      date={startDate} 
                      onChange={(date) => date && setStartDate(date)}
                      locale={de}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Enddatum</label>
                    <DatePicker 
                      date={endDate} 
                      onChange={(date) => date && setEndDate(date)}
                      locale={de}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Berichtstyp</label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Berichtstyp wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Übersicht</SelectItem>
                        <SelectItem value="detail">Detailliert</SelectItem>
                        <SelectItem value="daily">Täglich</SelectItem>
                        <SelectItem value="weekly">Wöchentlich</SelectItem>
                        <SelectItem value="monthly">Monatlich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Exportformat</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant={exportFormat === "pdf" ? "default" : "outline"}
                        className="flex items-center justify-center"
                        onClick={() => setExportFormat("pdf")}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button 
                        variant={exportFormat === "excel" ? "default" : "outline"}
                        className="flex items-center justify-center"
                        onClick={() => setExportFormat("excel")}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Excel
                      </Button>
                      <Button 
                        variant={exportFormat === "csv" ? "default" : "outline"}
                        className="flex items-center justify-center"
                        onClick={() => setExportFormat("csv")}
                      >
                        <Table className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Filter</label>
                    <div className="grid grid-cols-1 gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <Users className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Mitarbeiter wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                          {employees.map(employee => (
                            <SelectItem key={employee.id} value={employee.id}>{employee.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <Calendar className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Schichttypen wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Schichttypen</SelectItem>
                          {shiftTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                {exportFormat === "pdf" ? "PDF exportieren" : 
                  exportFormat === "excel" ? "Excel exportieren" : "CSV exportieren"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="employees" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mitarbeiterberichte</CardTitle>
              <CardDescription>
                Erstellen Sie detaillierte Berichte über Schichtverteilung, Arbeitszeiten und Abwesenheiten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-3">Verfügbare Berichte</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button variant="outline" className="justify-start" onClick={handleExport}>
                      <Users className="h-4 w-4 mr-2" />
                      Mitarbeiterauslastung
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={handleExport}>
                      <BarChart className="h-4 w-4 mr-2" />
                      Schichtverteilung
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={handleExport}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Arbeitszeiten
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={handleExport}>
                      <Filter className="h-4 w-4 mr-2" />
                      Qualifikationsverteilung
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Mitarbeiter</label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <Users className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Mitarbeiter wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                        {employees.map(employee => (
                          <SelectItem key={employee.id} value={employee.id}>{employee.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Exportformat</label>
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger>
                        <FileText className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Format wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Schichtanalyse</CardTitle>
              <CardDescription>
                Analysieren Sie Schichtverteilung, Besetzung und Effizienz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Schichtverteilung nach Mitarbeiter</h3>
                  <div className="h-[200px] flex items-center justify-center">
                    {employees.length > 0 ? (
                      <div className="flex items-end gap-2 w-full">
                        {employees.slice(0, 8).map((_, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-primary/80 rounded-t"
                              style={{ height: '20px' }}
                            ></div>
                            <span className="text-xs mt-1 truncate w-full text-center">M{index + 1}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Keine Daten verfügbar</p>
                    )}
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Schichttypen-Verteilung</h3>
                  <div className="h-[200px] flex items-center justify-center">
                    <div className="relative h-40 w-40">
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-primary/80" 
                          style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)' }}>
                        </div>
                        <div className="absolute top-0 left-0 w-full h-full bg-blue-500/80" 
                          style={{ clipPath: 'polygon(50% 50%, 100% 100%, 0% 100%)' }}>
                        </div>
                        <div className="absolute top-0 left-0 w-full h-full bg-amber-500/80" 
                          style={{ clipPath: 'polygon(50% 50%, 0% 100%, 0% 0%, 50% 0%)' }}>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white h-20 w-20 m-auto">
                      </div>
                    </div>
                    <div className="ml-4 space-y-2">
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-primary/80 rounded mr-2"></div>
                        <span className="text-xs">Früh (45%)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-blue-500/80 rounded mr-2"></div>
                        <span className="text-xs">Spät (35%)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-amber-500/80 rounded mr-2"></div>
                        <span className="text-xs">Nacht (20%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Analyse exportieren
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payroll" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lohndatenexport</CardTitle>
              <CardDescription>
                Exportieren Sie Schichtdaten für die Lohnabrechnung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Abrechnungszeitraum</label>
                    <Select defaultValue="currentMonth">
                      <SelectTrigger>
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Zeitraum wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="currentMonth">Aktueller Monat</SelectItem>
                        <SelectItem value="lastMonth">Vormonat</SelectItem>
                        <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Exportformat</label>
                    <Select defaultValue="datev">
                      <SelectTrigger>
                        <FileText className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Format wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="datev">DATEV</SelectItem>
                        <SelectItem value="lexware">Lexware</SelectItem>
                        <SelectItem value="sage">Sage</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-3">Daten zur Lohnabrechnung</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                      Reguläre Arbeitszeiten
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                      Zuschläge (Nacht, Sonntag, Feiertag)
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                      Überstunden
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                      Abwesenheiten (Urlaub, Krankheit)
                    </li>
                  </ul>
                </div>
                
                <Button className="w-full" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Lohndaten exportieren
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Hilfsfunktion für den CheckIcon
const CheckIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default ReportExport;
