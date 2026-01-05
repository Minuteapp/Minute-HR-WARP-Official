import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useTimeImport, ImportEntry } from "@/hooks/time-tracking/useTimeImport";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TimeImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onImportComplete: () => void;
}

type Step = 'upload' | 'preview' | 'importing' | 'complete';

export const TimeImportDialog = ({ 
  open, 
  onOpenChange, 
  userId,
  onImportComplete 
}: TimeImportDialogProps) => {
  const [step, setStep] = useState<Step>('upload');
  const [entries, setEntries] = useState<ImportEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const { importFromExcel, confirmImport, generateTemplate, isImporting } = useTimeImport();

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const data = await importFromExcel(file);
    
    if (data.length > 0) {
      setEntries(data);
      setStep('preview');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  const handleImport = async () => {
    setStep('importing');
    setProgress(0);

    const validEntries = entries.filter(e => e.isValid);
    const totalSteps = validEntries.length;
    
    // Simuliere Progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 300);

    const result = await confirmImport(validEntries, userId);
    
    clearInterval(progressInterval);
    setProgress(100);

    setTimeout(() => {
      setStep('complete');
      onImportComplete();
    }, 500);
  };

  const handleClose = () => {
    setStep('upload');
    setEntries([]);
    setProgress(0);
    onOpenChange(false);
  };

  const validCount = entries.filter(e => e.isValid).length;
  const invalidCount = entries.length - validCount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Zeiteinträge importieren</DialogTitle>
          <DialogDescription>
            Importieren Sie mehrere Zeiteinträge aus einer Excel-Datei
          </DialogDescription>
        </DialogHeader>

        {/* Schritt 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Laden Sie eine Excel-Datei (.xlsx, .xls) hoch
              </p>
              <Button variant="outline" size="sm" onClick={generateTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Vorlage herunterladen
              </Button>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
                <p className="text-lg">Datei hier ablegen...</p>
              ) : (
                <>
                  <p className="text-lg mb-2">Datei hier ablegen oder klicken zum Auswählen</p>
                  <p className="text-sm text-muted-foreground">
                    Nur Excel-Dateien (.xlsx, .xls) werden akzeptiert
                  </p>
                </>
              )}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erwartetes Format:</strong>
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                  <li>Datum: DD.MM.YYYY (z.B. 01.01.2025)</li>
                  <li>Startzeit & Endzeit: HH:MM (z.B. 09:00)</li>
                  <li>Pause: Minuten als Zahl (z.B. 30)</li>
                  <li>Ort: office, home oder mobile</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Schritt 2: Vorschau & Validierung */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {validCount} Gültig
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {invalidCount} Ungültig
                </Badge>
              )}
            </div>

            <ScrollArea className="h-96 border rounded-lg">
              <div className="p-4 space-y-2">
                {entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      entry.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {entry.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            Zeile {entry.row}: {entry.date} | {entry.startTime} - {entry.endTime}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground ml-6">
                          {entry.project && `📊 ${entry.project} | `}
                          📍 {entry.location} | ⏸ {entry.breakMinutes} min
                        </div>
                        {entry.note && (
                          <div className="text-sm text-muted-foreground ml-6 mt-1">
                            💬 {entry.note}
                          </div>
                        )}
                        {entry.errors.length > 0 && (
                          <div className="ml-6 mt-2 space-y-1">
                            {entry.errors.map((error, i) => (
                              <p key={i} className="text-sm text-red-600">• {error}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('upload')}>
                Zurück
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleImport}
                disabled={validCount === 0 || isImporting}
              >
                {validCount} Einträge importieren
              </Button>
            </div>
          </div>
        )}

        {/* Schritt 3: Importieren */}
        {step === 'importing' && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <div className="inline-block p-4 rounded-full bg-blue-100 mb-4">
                <Upload className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Importiere Einträge...</h3>
              <p className="text-muted-foreground">
                Bitte warten Sie, während die Daten importiert werden
              </p>
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {progress}% abgeschlossen
              </p>
            </div>
          </div>
        )}

        {/* Schritt 4: Fertig */}
        {step === 'complete' && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <div className="inline-block p-4 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Import erfolgreich!</h3>
              <p className="text-muted-foreground">
                {validCount} Zeiteinträge wurden erfolgreich importiert
              </p>
            </div>

            <Button className="w-full" onClick={handleClose}>
              Schließen
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
