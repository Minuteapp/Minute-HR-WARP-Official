import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  Download,
  Settings,
  Eye,
  X
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { ExcelMappingTemplate } from '@/types/budgetExecutive';

interface ExcelUploadPanelProps {
  onUpload: (file: File) => Promise<void>;
}

export const ExcelUploadPanel = ({ onUpload }: ExcelUploadPanelProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [mappingTemplate, setMappingTemplate] = useState<string>('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Mock mapping templates
  const mappingTemplates: ExcelMappingTemplate[] = [
    {
      id: '1',
      template_name: 'Standard Steuerberater Format',
      file_pattern: '*steuerberater*',
      column_mappings: {
        revenue: 'Umsätze',
        personnel_costs: 'Personalkosten',
        operating_costs: 'Betriebskosten',
        material_costs: 'Wareneinsatz',
        depreciation: 'Abschreibungen',
        interest: 'Zinsen',
        taxes: 'Steuern'
      },
      validation_rules: {},
      is_default: true,
      usage_count: 25,
      created_at: '2025-01-01',
      updated_at: '2025-01-01'
    },
    {
      id: '2',
      template_name: 'DATEV Export Format',
      file_pattern: '*datev*',
      column_mappings: {
        revenue: 'Erlöse',
        personnel_costs: 'Löhne und Gehälter',
        operating_costs: 'Sonstige betriebliche Aufwendungen',
        material_costs: 'Aufwendungen für RHB',
        depreciation: 'Abschreibungen auf Sachanlagen',
        interest: 'Zinsen und ähnliche Aufwendungen',
        taxes: 'Steuern'
      },
      validation_rules: {},
      is_default: false,
      usage_count: 12,
      created_at: '2025-01-01',
      updated_at: '2025-01-01'
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Validiere Dateityp
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Ungültiger Dateityp",
          description: "Bitte wählen Sie eine Excel- (.xlsx, .xls) oder CSV-Datei aus.",
          variant: "destructive"
        });
        setSelectedFile(null);
        return;
      }

      // Auto-detect template based on filename
      const filename = file.name.toLowerCase();
      const autoTemplate = mappingTemplates.find(template => 
        template.file_pattern && filename.includes(template.file_pattern.replace('*', ''))
      );
      
      if (autoTemplate) {
        setMappingTemplate(autoTemplate.id);
        toast({
          title: "Template erkannt",
          description: `"${autoTemplate.template_name}" wurde automatisch ausgewählt.`
        });
      }

      // Simuliere Preview-Daten
      generatePreviewData();
    }
  };

  const generatePreviewData = () => {
    // Empty preview - actual data comes from file upload
    const mockData: any[] = [];
    setPreviewData(mockData);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Keine Datei ausgewählt",
        description: "Bitte wählen Sie zuerst eine Datei aus.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simuliere Upload-Progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await onUpload(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast({
        title: "Upload erfolgreich",
        description: "Die Excel-Datei wurde erfolgreich verarbeitet."
      });

      // Reset nach erfolgreicher Verarbeitung
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        setShowPreview(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);

    } catch (error) {
      toast({
        title: "Upload-Fehler",
        description: "Die Datei konnte nicht verarbeitet werden.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Excel Upload & Parsing</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Templates verwalten
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Template herunterladen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload-Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Datei hochladen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mapping Template Auswahl */}
            <div>
              <Label htmlFor="mapping-template">Mapping Template</Label>
              <Select value={mappingTemplate} onValueChange={setMappingTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Template auswählen (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {mappingTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{template.template_name}</span>
                        {template.is_default && (
                          <Badge variant="secondary" className="ml-2">Standard</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mappingTemplate && (
                <div className="text-xs text-muted-foreground mt-1">
                  Verwendungen: {mappingTemplates.find(t => t.id === mappingTemplate)?.usage_count}
                </div>
              )}
            </div>

            {/* File Input */}
            <div>
              <Label htmlFor="file-upload">Excel/CSV Datei</Label>
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Unterstützte Formate: .xlsx, .xls, .csv (max. 10MB)
              </div>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload läuft...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Upload Button */}
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Verarbeitung läuft...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Datei hochladen und verarbeiten
                </>
              )}
            </Button>

            {/* Preview Button */}
            {selectedFile && !isUploading && (
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(!showPreview)}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Preview ausblenden' : 'Daten-Preview anzeigen'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Preview/Mapping Panel */}
        <Card>
          <CardHeader>
            <CardTitle>
              {showPreview ? 'Daten-Preview' : 'Spalten-Mapping'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showPreview && previewData.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Erste 5 Zeilen der Excel-Datei:
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {Object.keys(previewData[0] || {}).map((key) => (
                          <th key={key} className="text-left p-2 font-medium">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((row, index) => (
                        <tr key={index} className="border-b">
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td key={cellIndex} className="p-2">
                              {typeof value === 'number' ? value.toLocaleString() : value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : mappingTemplate ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Spalten-Zuordnung für "{mappingTemplates.find(t => t.id === mappingTemplate)?.template_name}":
                </div>
                <div className="space-y-2">
                  {Object.entries(mappingTemplates.find(t => t.id === mappingTemplate)?.column_mappings || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                      <Badge variant="outline">{value}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Wählen Sie ein Template oder laden Sie eine Datei hoch, um die Zuordnung zu sehen.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Upload-Tipps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <div>
                <span className="font-medium">Spaltenüberschriften:</span> Erste Zeile sollte Spaltenbezeichnungen enthalten
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <div>
                <span className="font-medium">Zahlenformat:</span> Negative Werte mit Minus-Zeichen oder in Klammern
              </div>
            </div>
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5" />
              <div>
                <span className="font-medium">Dateigröße:</span> Maximal 10MB pro Upload
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};