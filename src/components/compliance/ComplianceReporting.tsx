
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FileText, Download, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const ComplianceReporting = () => {
  const [reportType, setReportType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const reportTypes = [
    { value: 'audit_summary', label: 'Audit-Zusammenfassung', icon: FileText },
    { value: 'risk_dashboard', label: 'Risiko-Dashboard', icon: TrendingUp },
    { value: 'policy_compliance', label: 'Richtlinien-Compliance', icon: BarChart3 },
    { value: 'incident_analysis', label: 'Vorfallsanalyse', icon: PieChart },
  ];

  const predefinedReports = [
    { name: 'Monatsbericht Compliance', type: 'Standardbericht', lastGenerated: '2024-01-15' },
    { name: 'Quartalsbericht Risiken', type: 'Risikoanalyse', lastGenerated: '2024-01-10' },
    { name: 'Jahresbericht Audits', type: 'Audit-Zusammenfassung', lastGenerated: '2024-01-05' },
    { name: 'Policy Compliance Status', type: 'Richtlinien-Compliance', lastGenerated: '2024-01-12' },
  ];

  const handleGenerateReport = () => {
    console.log('Generiere Bericht:', { reportType, dateFrom, dateTo });
    // Hier würde die Berichtsgenerierung implementiert werden
  };

  const selectedReportType = reportTypes.find(rt => rt.value === reportType);

  return (
    <div className="space-y-6">
      {/* Bericht erstellen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Neuen Bericht erstellen
          </CardTitle>
          <CardDescription>
            Erstellen Sie individuelle Compliance-Berichte für verschiedene Bereiche
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Berichtstyp</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Berichtstyp auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Zeitraum</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "dd.MM.yyyy", { locale: de }) : "Von"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                      locale={de}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "dd.MM.yyyy", { locale: de }) : "Bis"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      locale={de}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {selectedReportType && (
            <div className="p-4 bg-blue-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <selectedReportType.icon className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">{selectedReportType.label}</h3>
              </div>
              <p className="text-sm text-blue-700">
                {reportType === 'audit_summary' && 'Zusammenfassung aller durchgeführten Audits, Befunde und Korrekturmaßnahmen.'}
                {reportType === 'risk_dashboard' && 'Übersicht über alle identifizierten Risiken, Bewertungen und Mitigationsmaßnahmen.'}
                {reportType === 'policy_compliance' && 'Status der Richtlinien-Compliance, Bestätigungen und ausstehende Schulungen.'}
                {reportType === 'incident_analysis' && 'Analyse aller gemeldeten Vorfälle, Trends und präventive Maßnahmen.'}
              </p>
            </div>
          )}

          <Button 
            onClick={handleGenerateReport}
            disabled={!reportType}
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            Bericht generieren
          </Button>
        </CardContent>
      </Card>

      {/* Vordefinierte Berichte */}
      <Card>
        <CardHeader>
          <CardTitle>Vordefinierte Berichte</CardTitle>
          <CardDescription>
            Standardberichte für regelmäßige Compliance-Berichterstattung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predefinedReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">{report.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Badge variant="outline">{report.type}</Badge>
                      <span>Zuletzt generiert: {report.lastGenerated}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    Aktualisieren
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Berichts-Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Berichts-Templates</CardTitle>
          <CardDescription>
            Anpassbare Vorlagen für verschiedene Compliance-Berichte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.value} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm">{type.label}</h3>
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      Template anpassen
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
