
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, X, Sparkles, FileCheck, AlertCircle, Loader2 } from 'lucide-react';
import { documentCrudService } from '@/services/documents/documentCrudService';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadDialogProps {
  projectId: string;
  onDocumentUploaded: () => void;
}

interface AIAnalysisResult {
  document_type: string;
  category: string;
  summary: string;
  confidence: number;
  tags: string[];
  requires_approval: boolean;
  requires_signature: boolean;
}

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({ 
  projectId, 
  onDocumentUploaded 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('training');
  const [uploading, setUploading] = useState(false);
  const [enableAiAnalysis, setEnableAiAnalysis] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAiAnalysis(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    if (enableAiAnalysis) {
      setAnalyzing(true);
    }

    try {
      console.log('[DocumentUpload] Starting upload:', selectedFile.name, 'AI analysis:', enableAiAnalysis);
      
      const result = await documentCrudService.uploadDocument(
        selectedFile,
        {
          category: category as any,
          metadata: { projectId }
        },
        enableAiAnalysis
      );

      console.log('[DocumentUpload] Upload result:', result);

      if (result.aiAnalysis) {
        setAiAnalysis(result.aiAnalysis);
        toast({
          title: "Dokument hochgeladen & analysiert",
          description: `KI hat erkannt: ${result.aiAnalysis.document_type} (${result.aiAnalysis.confidence}% Konfidenz)`,
        });
      } else {
        toast({
          title: "Dokument hochgeladen",
          description: "Das Dokument wurde erfolgreich gespeichert.",
        });
        onDocumentUploaded();
        setIsOpen(false);
        setSelectedFile(null);
      }
    } catch (error: any) {
      console.error('[DocumentUpload] Upload failed:', error);
      toast({
        title: "Fehler beim Hochladen",
        description: error?.message || 'Unbekannter Fehler',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleAcceptAnalysis = () => {
    toast({
      title: "Analyse übernommen",
      description: "Die KI-Analyse wurde für das Dokument gespeichert.",
    });
    onDocumentUploaded();
    setIsOpen(false);
    setSelectedFile(null);
    setAiAnalysis(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setAiAnalysis(null);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} disabled={!projectId}>
        <Upload className="h-4 w-4 mr-2" />
        Dokument hochladen
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dokument hochladen</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Datei auswählen</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
              />
            </div>

            <div>
              <Label htmlFor="category">Kategorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training">Schulung & Weiterbildung</SelectItem>
                  <SelectItem value="recruiting">Recruiting & Onboarding</SelectItem>
                  <SelectItem value="company">Unternehmensdokumente</SelectItem>
                  <SelectItem value="employee">Mitarbeiterdokumente</SelectItem>
                  <SelectItem value="payroll">Lohn & Gehalt</SelectItem>
                  <SelectItem value="legal">Rechtliche Dokumente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* KI-Analyse Toggle */}
            <div className="flex items-center justify-between p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-600" />
                <div>
                  <p className="text-sm font-medium">KI-Analyse aktivieren</p>
                  <p className="text-xs text-muted-foreground">Automatische Erkennung von Typ, Kategorie & Freigaben</p>
                </div>
              </div>
              <Switch
                checked={enableAiAnalysis}
                onCheckedChange={setEnableAiAnalysis}
              />
            </div>

            {selectedFile && (
              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{selectedFile.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setAiAnalysis(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}

            {/* KI-Analyse Ergebnis */}
            {aiAnalysis && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 space-y-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  <p className="font-medium text-green-800 dark:text-green-200">KI-Analyse abgeschlossen</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Dokumenttyp:</span>
                    <p className="font-medium">{aiAnalysis.document_type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kategorie:</span>
                    <p className="font-medium">{aiAnalysis.category}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Konfidenz:</span>
                    <p className="font-medium">{aiAnalysis.confidence}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tags:</span>
                    <p className="font-medium">{aiAnalysis.tags?.join(', ') || '-'}</p>
                  </div>
                </div>

                <p className="text-sm italic text-muted-foreground">{aiAnalysis.summary}</p>

                <div className="flex gap-2">
                  {aiAnalysis.requires_approval && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded text-xs">
                      <AlertCircle className="h-3 w-3" />
                      Freigabe erforderlich
                    </span>
                  )}
                  {aiAnalysis.requires_signature && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs">
                      <FileCheck className="h-3 w-3" />
                      Signatur erforderlich
                    </span>
                  )}
                </div>

                <Button onClick={handleAcceptAnalysis} className="w-full">
                  Analyse übernehmen & Fertig
                </Button>
              </div>
            )}

            {/* Analyzing State */}
            {analyzing && (
              <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800 flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                <div>
                  <p className="font-medium text-violet-800 dark:text-violet-200">KI analysiert Dokument...</p>
                  <p className="text-xs text-muted-foreground">Erkennung von Typ, Kategorie und Freigabe-Anforderungen</p>
                </div>
              </div>
            )}

            {!aiAnalysis && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {analyzing ? 'Analysiere...' : 'Hochladen...'}
                    </>
                  ) : (
                    'Hochladen'
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentUploadDialog;
