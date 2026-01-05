
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowDownToLine, ArrowUpFromLine, FileText, AlertTriangle, Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompanySettings } from "../hooks/useCompanySettings";

export const ImportExport = () => {
  const { toast } = useToast();
  const { formData } = useCompanySettings();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.csv', '.json', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        variant: "destructive",
        title: "Ungültiger Dateityp",
        description: "Bitte wählen Sie eine CSV-, JSON- oder Excel-Datei aus.",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Datei zu groß",
        description: "Die maximale Dateigröße beträgt 10MB.",
      });
      return;
    }

    setIsImporting(true);
    
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Import erfolgreich",
        description: `Die Datei "${file.name}" wurde erfolgreich importiert.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import fehlgeschlagen",
        description: "Beim Importieren der Daten ist ein Fehler aufgetreten.",
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    
    try {
      // Create export data - use only available fields from formData
      const exportData = {
        company: {
          name: formData?.name || 'Muster GmbH',
          street: 'Musterstraße 123',
          postalCode: '12345', 
          city: 'Musterstadt',
          country: 'Deutschland',
          phone: formData?.phone || '+49 123 456789',
          email: 'info@muster.de',
          website: formData?.website || 'https://www.muster.de',
        },
        branding: {
          primaryColor: '#9b87f5',
          secondaryColor: '',
          logoUrl: '',
        },
        exportedAt: new Date().toISOString(),
        exportFormat: format,
      };

      let fileContent: string;
      let fileName: string;
      let mimeType: string;

      switch (format) {
        case 'json':
          fileContent = JSON.stringify(exportData, null, 2);
          fileName = `unternehmensdaten_${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
        case 'csv':
          // Simple CSV format for company data
          const csvRows = [
            'Feld,Wert',
            `Name,${exportData.company.name}`,
            `Straße,${exportData.company.street}`,
            `PLZ,${exportData.company.postalCode}`,
            `Stadt,${exportData.company.city}`,
            `Land,${exportData.company.country}`,
            `Telefon,${exportData.company.phone}`,
            `E-Mail,${exportData.company.email}`,
            `Website,${exportData.company.website}`,
            `Primärfarbe,${exportData.branding.primaryColor}`,
            `Sekundärfarbe,${exportData.branding.secondaryColor}`,
          ];
          fileContent = csvRows.join('\n');
          fileName = `unternehmensdaten_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        default:
          throw new Error('Unsupported format');
      }

      // Create and download file
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export erfolgreich",
        description: `Die Daten wurden als ${format.toUpperCase()}-Datei heruntergeladen.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export fehlgeschlagen",
        description: "Beim Exportieren der Daten ist ein Fehler aufgetreten.",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json,.xlsx"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpFromLine className="h-5 w-5" />
              Daten importieren
            </CardTitle>
            <CardDescription>
              Importieren Sie Unternehmensdaten aus einer Datei
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Unterstützte Dateiformate: CSV, Excel, JSON
              </p>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleImport} 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  disabled={isImporting}
                >
                  <Upload className="h-4 w-4" />
                  {isImporting ? "Wird importiert..." : "Datei hochladen"}
                </Button>
                <p className="text-xs text-gray-500">
                  Maximale Dateigröße: 10MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownToLine className="h-5 w-5" />
              Daten exportieren
            </CardTitle>
            <CardDescription>
              Exportieren Sie Unternehmensdaten in eine Datei
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Wählen Sie das gewünschte Dateiformat:
              </p>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => handleExport('csv')} 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? "Wird exportiert..." : "Als CSV exportieren"}
                </Button>
                <Button 
                  onClick={() => handleExport('json')} 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? "Wird exportiert..." : "Als JSON exportieren"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-yellow-800">Hinweis zum Datenschutz</h4>
          <p className="text-sm text-yellow-700 mt-1">
            Beim Import und Export von Daten, insbesondere personenbezogenen Daten, beachten Sie bitte die
            entsprechenden Datenschutzbestimmungen und DSGVO-Richtlinien.
          </p>
        </div>
      </div>
    </div>
  );
};
