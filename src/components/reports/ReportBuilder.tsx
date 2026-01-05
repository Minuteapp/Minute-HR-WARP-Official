
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FilePlus2, Download, FileText, CheckCircle2 } from "lucide-react";
import { reportService } from '@/services/reportService';
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const ReportBuilder = () => {
  const { toast } = useToast();
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('monthly');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([]);
  const [customizationOptions, setCustomizationOptions] = useState({
    includeBranding: true,
    includeLogo: true,
    addSignatureField: false,
    addFooter: true,
    applyDataMasking: false
  });
  const [distributionOptions, setDistributionOptions] = useState({
    saveToDocuments: true,
    sendEmail: false,
    scheduleReport: false,
  });
  const [isBuilding, setIsBuilding] = useState(false);
  const [builtReport, setBuiltReport] = useState<any>(null);

  const dataSources = [
    { id: 'employees', label: 'Mitarbeiterdaten' },
    { id: 'time_entries', label: 'Zeiterfassung' },
    { id: 'projects', label: 'Projekte' },
    { id: 'expenses', label: 'Ausgaben' },
    { id: 'absence_requests', label: 'Abwesenheiten' }
  ];

  const handleDataSourceToggle = (value: string) => {
    setSelectedDataSources(current => 
      current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]
    );
  };

  const handleBuildReport = async () => {
    if (!reportName) {
      toast({
        title: "Berichtsname erforderlich",
        description: "Bitte geben Sie einen Namen für den Bericht ein.",
        variant: "destructive",
      });
      return;
    }

    if (selectedDataSources.length === 0) {
      toast({
        title: "Datenquellen erforderlich",
        description: "Bitte wählen Sie mindestens eine Datenquelle aus.",
        variant: "destructive",
      });
      return;
    }

    setIsBuilding(true);

    try {
      // Bericht in der Datenbank erstellen
      const report = {
        id: crypto.randomUUID(),
        title: reportName,
        type: reportType,
        description: reportDescription,
        dataSources: selectedDataSources,
        customization: customizationOptions,
        distribution: distributionOptions,
        createdAt: new Date().toISOString()
      };

      // TODO: Hier API-Aufruf zum Speichern des Berichts
      await new Promise(resolve => setTimeout(resolve, 500));

      setBuiltReport(report);
      setIsBuilding(false);

      toast({
        title: "Bericht erstellt",
        description: `Der Bericht "${reportName}" wurde erfolgreich erstellt.`,
      });
    } catch (error) {
      setIsBuilding(false);
      toast({
        title: "Fehler",
        description: "Bericht konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Report Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="basic">Grunddaten</TabsTrigger>
              <TabsTrigger value="sources">Datenquellen</TabsTrigger>
              <TabsTrigger value="customize">Anpassung</TabsTrigger>
              <TabsTrigger value="distribution">Verteilung</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Berichtsname</Label>
                <Input 
                  id="report-name" 
                  placeholder="z.B. Monatlicher Zeiterfassungsbericht" 
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="report-type">Berichtstyp</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Berichtstyp auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monatsbericht</SelectItem>
                    <SelectItem value="project">Projektbericht</SelectItem>
                    <SelectItem value="expense">Kostenbericht</SelectItem>
                    <SelectItem value="travel">Reisekostenbericht</SelectItem>
                    <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="report-description">Beschreibung</Label>
                <Input 
                  id="report-description" 
                  placeholder="Beschreibung des Berichtszwecks" 
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="sources" className="space-y-4">
              <div className="space-y-2">
                <Label>Datenquellen auswählen</Label>
                <div className="space-y-2 mt-2">
                  {dataSources.map(source => (
                    <div key={source.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={source.id}
                        checked={selectedDataSources.includes(source.id)}
                        onCheckedChange={() => handleDataSourceToggle(source.id)}
                      />
                      <label
                        htmlFor={source.id}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {source.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="customize" className="space-y-4">
              <div className="space-y-2">
                <Label>Anpassungsoptionen</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="brand"
                      checked={customizationOptions.includeBranding}
                      onCheckedChange={(checked) => 
                        setCustomizationOptions(prev => ({...prev, includeBranding: Boolean(checked)}))
                      }
                    />
                    <label
                      htmlFor="brand"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Firmenbranding einbeziehen
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="logo"
                      checked={customizationOptions.includeLogo}
                      onCheckedChange={(checked) => 
                        setCustomizationOptions(prev => ({...prev, includeLogo: Boolean(checked)}))
                      }
                    />
                    <label
                      htmlFor="logo"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Firmenlogo einbeziehen
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="signature"
                      checked={customizationOptions.addSignatureField}
                      onCheckedChange={(checked) => 
                        setCustomizationOptions(prev => ({...prev, addSignatureField: Boolean(checked)}))
                      }
                    />
                    <label
                      htmlFor="signature"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Unterschriftenfeld hinzufügen
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="footer"
                      checked={customizationOptions.addFooter}
                      onCheckedChange={(checked) => 
                        setCustomizationOptions(prev => ({...prev, addFooter: Boolean(checked)}))
                      }
                    />
                    <label
                      htmlFor="footer"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Fußzeile hinzufügen (Ersteller, Zeitstempel)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="masking"
                      checked={customizationOptions.applyDataMasking}
                      onCheckedChange={(checked) => 
                        setCustomizationOptions(prev => ({...prev, applyDataMasking: Boolean(checked)}))
                      }
                    />
                    <label
                      htmlFor="masking"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      DSGVO-Datenmaske anwenden
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="distribution" className="space-y-4">
              <div className="space-y-2">
                <Label>Verteilungsoptionen</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="save-docs"
                      checked={distributionOptions.saveToDocuments}
                      onCheckedChange={(checked) => 
                        setDistributionOptions(prev => ({...prev, saveToDocuments: Boolean(checked)}))
                      }
                    />
                    <label
                      htmlFor="save-docs"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Im DMS speichern
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="send-email"
                      checked={distributionOptions.sendEmail}
                      onCheckedChange={(checked) => 
                        setDistributionOptions(prev => ({...prev, sendEmail: Boolean(checked)}))
                      }
                    />
                    <label
                      htmlFor="send-email"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Per E-Mail versenden
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="schedule"
                      checked={distributionOptions.scheduleReport}
                      onCheckedChange={(checked) => 
                        setDistributionOptions(prev => ({...prev, scheduleReport: Boolean(checked)}))
                      }
                    />
                    <label
                      htmlFor="schedule"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Automatisch zeitplanen
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleBuildReport} disabled={isBuilding}>
              {isBuilding ? "Bericht wird erstellt..." : "Bericht erstellen"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Berichtsvorschau</CardTitle>
        </CardHeader>
        <CardContent>
          {builtReport ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold">{builtReport.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {builtReport.type === 'monthly' ? 'Monatsbericht' :
                   builtReport.type === 'project' ? 'Projektbericht' :
                   builtReport.type === 'expense' ? 'Kostenbericht' :
                   builtReport.type === 'travel' ? 'Reisekostenbericht' : 'Benutzerdefiniert'}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Erstellt am:</strong> {format(new Date(builtReport.createdAt), 'dd.MM.yyyy HH:mm')}</p>
                <p><strong>Datenquellen:</strong> {builtReport.dataSources.length}</p>
                <p><strong>Enthält Firmenbranding:</strong> {builtReport.customization.includeBranding ? 'Ja' : 'Nein'}</p>
                <p><strong>Im DMS gespeichert:</strong> {builtReport.distribution.saveToDocuments ? 'Ja' : 'Nein'}</p>
              </div>
              <div className="pt-4 flex flex-col items-center space-y-2">
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" /> Als PDF exportieren
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" /> Bericht bearbeiten
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FilePlus2 className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-sm text-gray-500">Erstellen Sie einen Bericht, um eine Vorschau zu sehen</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportBuilder;
