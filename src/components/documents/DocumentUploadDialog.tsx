import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, CheckCircle, X, Send, UserCheck, Sparkles, AlertTriangle, FileText, Tag, Brain, Signature, Receipt, Euro } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import type { DocumentCategory, InvoiceData } from '@/types/documents';
import { useEmployeesList } from '@/hooks/useEmployeesList';
import { useDepartments } from '@/hooks/useOrganization';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload?: (
    file: File, 
    category: string, 
    metadata?: {
      employee_id?: string;
      department?: string;
      document_type?: string;
      requires_approval?: boolean;
      approver_id?: string;
      status?: string;
      ai_summary?: string;
      ai_tags?: string[];
      ai_confidence?: number;
      ai_detected_entities?: object;
      ai_invoice_data?: object;
    }
  ) => void;
  defaultCategory?: DocumentCategory;
}

const DOCUMENT_TYPES = [
  'Sonstiges',
  'Rechnung',
  'Vertrag',
  'Lohnabrechnung',
  'Krankmeldung',
  'Weiterbildungsnachweis',
  'Urlaubsantrag',
  'Arbeitszeugnis',
  'Richtlinie',
  'Datenschutz'
];

const CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'expenses', label: 'Ausgaben & Rechnungen' },
  { value: 'training', label: 'Schulung & Weiterbildung' },
  { value: 'recruiting', label: 'Recruiting & Onboarding' },
  { value: 'company', label: 'Unternehmensdokumente' },
  { value: 'employee', label: 'Mitarbeiterdokumente' },
  { value: 'payroll', label: 'Lohn & Gehalt' },
  { value: 'legal', label: 'Rechtliche Dokumente' }
];

// Dokumenttypen die Freigabe benötigen
const APPROVAL_REQUIRED_TYPES = ['Vertrag', 'Arbeitszeugnis', 'Richtlinie', 'Datenschutz'];

const DocumentUploadDialog = ({ open, onOpenChange, onUpload, defaultCategory }: DocumentUploadDialogProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiProcessed, setAiProcessed] = useState(false);
  const [documentType, setDocumentType] = useState<string>('Sonstiges');
  const [category, setCategory] = useState<string>(defaultCategory || 'company');
  const [employee, setEmployee] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [requiresSignature, setRequiresSignature] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'send' | 'self' | 'none'>('none');
  const [selectedApprover, setSelectedApprover] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  
  // AI-Analyse Ergebnisse
  const [aiAnalysis, setAiAnalysis] = useState<{
    summary: string;
    confidence: number;
    tags: string[];
    detected_entities: {
      person_name?: string;
      company_name?: string;
      date?: string;
      department?: string;
    };
    analysis_method: 'vision' | 'filename';
    invoice_data?: InvoiceData;
  } | null>(null);
  
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);

  const { employees, isLoading: loadingEmployees } = useEmployeesList();
  const { data: departments, isLoading: loadingDepartments } = useDepartments();

  // Filter für Vorgesetzte/HR (in echter Implementierung nach Rolle filtern)
  const approvers = employees?.filter(emp => 
    emp.position?.toLowerCase().includes('manager') || 
    emp.position?.toLowerCase().includes('leiter') ||
    emp.position?.toLowerCase().includes('hr') ||
    emp.department?.toLowerCase().includes('hr')
  ) || [];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);
        setAiAnalysis(null);
        
        // Echte KI-Analyse mit Vision starten
        setIsProcessing(true);
        
        try {
          // Datei als Base64 konvertieren für Bild-Analyse
          let base64Content: string | null = null;
          const isImage = file.type.startsWith('image/');
          
          if (isImage) {
            base64Content = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                // Entferne den Data-URL-Prefix (data:image/xxx;base64,)
                const base64 = result.split(',')[1];
                resolve(base64);
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          }
          
          console.log('📄 Starting AI Vision analysis...', { 
            fileName: file.name, 
            fileType: file.type,
            hasBase64: !!base64Content 
          });
          
          // Edge Function aufrufen
          const { data, error } = await supabase.functions.invoke('analyze-document-vision', {
            body: {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              base64Content
            }
          });
          
          if (error) {
            console.error('AI Analysis error:', error);
            throw new Error(error.message || 'Fehler bei der KI-Analyse');
          }
          
          if (data?.success && data?.analysis) {
            const analysis = data.analysis;
            console.log('✅ AI Vision analysis complete:', analysis);
            
            // Ergebnisse setzen
            setDocumentType(analysis.document_type);
            setCategory(analysis.category);
            setRequiresApproval(analysis.requires_approval);
            setRequiresSignature(analysis.requires_signature);
            
            setAiAnalysis({
              summary: analysis.summary,
              confidence: analysis.confidence,
              tags: analysis.tags || [],
              detected_entities: analysis.detected_entities || {},
              analysis_method: analysis.analysis_method,
              invoice_data: analysis.invoice_data || undefined
            });
            
            if (analysis.requires_approval) {
              setApprovalAction('send');
            }
            
            toast.success(`Dokument erkannt: ${analysis.document_type} (${analysis.confidence}% Konfidenz)`);
          } else {
            throw new Error('Keine Analyseergebnisse erhalten');
          }
          
          setAiProcessed(true);
        } catch (error: any) {
          console.error('AI Analysis failed:', error);
          toast.error(`KI-Analyse fehlgeschlagen: ${error.message}`);
          
          // Fallback auf Dateinamen-basierte Analyse
          let detectedType = 'Sonstiges';
          const fileName = file.name.toLowerCase();
          
          if (fileName.includes('vertrag') || fileName.includes('contract')) {
            detectedType = 'Vertrag';
          } else if (fileName.includes('lohn') || fileName.includes('gehalt')) {
            detectedType = 'Lohnabrechnung';
          } else if (fileName.includes('krank') || fileName.includes('attest')) {
            detectedType = 'Krankmeldung';
          } else if (fileName.includes('zeugnis')) {
            detectedType = 'Arbeitszeugnis';
          }
          
          setDocumentType(detectedType);
          setRequiresApproval(APPROVAL_REQUIRED_TYPES.includes(detectedType));
          setAiProcessed(true);
        } finally {
          setIsProcessing(false);
        }
      }
    },
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.document': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    }
  });

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    try {
      console.log('📄 Starting document upload...', { 
        fileName: uploadedFile.name, 
        category, 
        documentType,
        employee,
        department,
        requiresApproval,
        approvalAction,
        selectedApprover
      });
      
      // Bestimme Status basierend auf Freigabe-Aktion
      let status = 'pending';
      let approverId: string | undefined;
      
      if (requiresApproval) {
        if (approvalAction === 'self') {
          status = 'approved';
          toast.success('Dokument wurde selbst freigegeben');
        } else if (approvalAction === 'send' && selectedApprover) {
          status = 'pending';
          approverId = selectedApprover;
          const approver = employees?.find(e => e.id === selectedApprover);
          toast.info(`Freigabeanfrage an ${approver?.first_name} ${approver?.last_name} gesendet`);
        }
      }
      
      if (onUpload) {
        await onUpload(uploadedFile, category, {
          employee_id: employee || undefined,
          department: department || undefined,
          document_type: documentType,
          requires_approval: requiresApproval,
          approver_id: approverId,
          status,
          // KI-Analyse-Daten mitgeben
          ai_summary: aiAnalysis?.summary,
          ai_tags: aiAnalysis?.tags,
          ai_confidence: aiAnalysis?.confidence,
          ai_detected_entities: aiAnalysis?.detected_entities,
          ai_invoice_data: aiAnalysis?.invoice_data
        });
      }
      
      console.log('📄 Document upload successful');
      toast.success('Dokument erfolgreich hochgeladen');
      handleClose();
    } catch (error: any) {
      console.error('📄 Document upload failed:', error);
      toast.error(`Fehler beim Hochladen: ${error?.message || 'Unbekannter Fehler'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setUploadedFile(null);
    setAiProcessed(false);
    setIsProcessing(false);
    setDocumentType('Sonstiges');
    setCategory(defaultCategory || 'company');
    setEmployee('');
    setDepartment('');
    setRequiresApproval(false);
    setRequiresSignature(false);
    setApprovalAction('none');
    setSelectedApprover('');
    setAiAnalysis(null);
    onOpenChange(false);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setAiProcessed(false);
    setRequiresApproval(false);
    setRequiresSignature(false);
    setApprovalAction('none');
    setAiAnalysis(null);
  };

  // Update requiresApproval wenn documentType sich ändert
  const handleDocumentTypeChange = (type: string) => {
    setDocumentType(type);
    const needsApproval = APPROVAL_REQUIRED_TYPES.includes(type);
    setRequiresApproval(needsApproval);
    if (needsApproval && approvalAction === 'none') {
      setApprovalAction('send');
    } else if (!needsApproval) {
      setApprovalAction('none');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            Dokument hochladen
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Laden Sie Dokumente hoch und lassen Sie diese automatisch durch KI klassifizieren.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {!uploadedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Dateien hierher ziehen' : 'Dateien hierher ziehen oder'}
              </p>
              <Button type="button" variant="outline">
                Datei auswählen
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Unterstützt: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (max. 10 MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {isProcessing && (
                <div className="p-4 bg-violet-50 dark:bg-violet-950/20 rounded-lg border border-violet-200 dark:border-violet-900">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-violet-500 border-t-transparent" />
                    <span className="font-medium text-violet-900 dark:text-violet-100">
                      KI-Vision analysiert Dokument...
                    </span>
                  </div>
                  <Progress value={undefined} className="h-1" />
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-2">
                    OpenAI Vision erkennt Inhalt, Typ und Metadaten
                  </p>
                </div>
              )}

              {aiProcessed && aiAnalysis && (
                <div className="space-y-3">
                  {/* Hauptergebnis */}
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-green-900 dark:text-green-100">
                            KI-Analyse abgeschlossen
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            <Brain className="h-3 w-3 mr-1" />
                            {aiAnalysis.confidence}% Konfidenz
                          </Badge>
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                          <p>
                            <FileText className="h-3.5 w-3.5 inline mr-1" />
                            <strong>Dokumenttyp:</strong> {documentType}
                          </p>
                          {aiAnalysis.summary && (
                            <p className="text-green-600 dark:text-green-400 italic">
                              "{aiAnalysis.summary}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {aiAnalysis.tags && aiAnalysis.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {aiAnalysis.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Erkannte Entitäten */}
                  {aiAnalysis.detected_entities && Object.keys(aiAnalysis.detected_entities).some(k => aiAnalysis.detected_entities[k as keyof typeof aiAnalysis.detected_entities]) && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Erkannte Informationen:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-300">
                        {aiAnalysis.detected_entities.person_name && (
                          <span>👤 {aiAnalysis.detected_entities.person_name}</span>
                        )}
                        {aiAnalysis.detected_entities.company_name && (
                          <span>🏢 {aiAnalysis.detected_entities.company_name}</span>
                        )}
                        {aiAnalysis.detected_entities.date && (
                          <span>📅 {aiAnalysis.detected_entities.date}</span>
                        )}
                        {aiAnalysis.detected_entities.department && (
                          <span>🏷️ {aiAnalysis.detected_entities.department}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Anforderungen */}
                  {(requiresApproval || requiresSignature) && (
                    <div className="flex gap-2">
                      {requiresApproval && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Freigabe erforderlich
                        </Badge>
                      )}
                      {requiresSignature && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          <Signature className="h-3 w-3 mr-1" />
                          Signatur erforderlich
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Rechnungsdaten */}
                  {documentType === 'Rechnung' && aiAnalysis.invoice_data && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900">
                      <div className="flex items-center gap-2 mb-3">
                        <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium text-emerald-900 dark:text-emerald-100">
                          Erkannte Rechnungsdaten
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {aiAnalysis.invoice_data.vendor_name && (
                          <div>
                            <span className="text-muted-foreground">Lieferant:</span>
                            <p className="font-medium">{aiAnalysis.invoice_data.vendor_name}</p>
                          </div>
                        )}
                        {aiAnalysis.invoice_data.invoice_number && (
                          <div>
                            <span className="text-muted-foreground">Rechnungsnr.:</span>
                            <p className="font-medium">{aiAnalysis.invoice_data.invoice_number}</p>
                          </div>
                        )}
                        {aiAnalysis.invoice_data.total_amount !== undefined && (
                          <div>
                            <span className="text-muted-foreground">Betrag:</span>
                            <p className="font-medium text-emerald-700 dark:text-emerald-300">
                              <Euro className="h-3 w-3 inline mr-1" />
                              {aiAnalysis.invoice_data.total_amount.toFixed(2)} {aiAnalysis.invoice_data.currency || 'EUR'}
                            </p>
                          </div>
                        )}
                        {aiAnalysis.invoice_data.invoice_date && (
                          <div>
                            <span className="text-muted-foreground">Datum:</span>
                            <p className="font-medium">{aiAnalysis.invoice_data.invoice_date}</p>
                          </div>
                        )}
                        {aiAnalysis.invoice_data.tax_amount !== undefined && (
                          <div>
                            <span className="text-muted-foreground">MwSt:</span>
                            <p className="font-medium">{aiAnalysis.invoice_data.tax_amount.toFixed(2)} {aiAnalysis.invoice_data.currency || 'EUR'}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Als Ausgabe erfassen Button */}
                      <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-800">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                          onClick={() => {
                            // In Zukunft: Dialog öffnen mit vorausgefüllten Daten
                            toast.info(
                              `Rechnung von ${aiAnalysis.invoice_data?.vendor_name || 'Unbekannt'} über ${aiAnalysis.invoice_data?.total_amount?.toFixed(2) || '0.00'} ${aiAnalysis.invoice_data?.currency || 'EUR'} kann als Ausgabe erfasst werden.`,
                              {
                                action: {
                                  label: 'Zum Ausgaben-Modul',
                                  onClick: () => window.location.href = '/expenses'
                                }
                              }
                            );
                          }}
                        >
                          <Receipt className="h-4 w-4 mr-2" />
                          Als Ausgabe erfassen
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Übernimmt die erkannten Daten ins Ausgaben-Modul
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Analyse-Methode */}
                  <p className="text-xs text-muted-foreground">
                    Analyse via: {aiAnalysis.analysis_method === 'vision' ? 'OpenAI Vision (Bildanalyse)' : 'Dateinamen-Analyse'}
                  </p>
                </div>
              )}

              {aiProcessed && !aiAnalysis && (
                <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Analyse abgeschlossen
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Erkannter Dokumenttyp: <strong>{documentType}</strong>
                      {requiresApproval && ' (Freigabe erforderlich)'}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dokumenttyp</Label>
                  <Select value={documentType} onValueChange={handleDocumentTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                          {APPROVAL_REQUIRED_TYPES.includes(type) && ' 🔒'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kategorie</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mitarbeiter</Label>
                  <Select value={employee} onValueChange={setEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mitarbeiter auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingEmployees ? (
                        <SelectItem value="loading" disabled>Lädt...</SelectItem>
                      ) : (
                        employees?.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name || `${emp.first_name} ${emp.last_name}`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Abteilung</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Abteilung auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingDepartments ? (
                        <SelectItem value="loading" disabled>Lädt...</SelectItem>
                      ) : (
                        departments?.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Freigabe-Sektion */}
              {requiresApproval && aiProcessed && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900 space-y-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900 dark:text-amber-100">
                        Freigabe erforderlich
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Dieses Dokument ({documentType}) benötigt eine Freigabe.
                      </p>
                    </div>
                  </div>

                  <RadioGroup value={approvalAction} onValueChange={(v) => setApprovalAction(v as any)}>
                    <div className="flex items-center space-x-2 p-3 rounded-lg bg-white dark:bg-gray-900 border">
                      <RadioGroupItem value="send" id="send" />
                      <Label htmlFor="send" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Send className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">An Zuständigen senden</p>
                          <p className="text-xs text-muted-foreground">
                            Freigabeanfrage an einen Vorgesetzten oder HR senden
                          </p>
                        </div>
                      </Label>
                    </div>

                    {approvalAction === 'send' && (
                      <div className="ml-6 mt-2">
                        <Select value={selectedApprover} onValueChange={setSelectedApprover}>
                          <SelectTrigger>
                            <SelectValue placeholder="Freigeber auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {approvers.length === 0 ? (
                              <SelectItem value="none" disabled>Keine Freigeber gefunden</SelectItem>
                            ) : (
                              approvers.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id}>
                                  {emp.first_name} {emp.last_name} ({emp.position || emp.department})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 p-3 rounded-lg bg-white dark:bg-gray-900 border">
                      <RadioGroupItem value="self" id="self" />
                      <Label htmlFor="self" className="flex items-center gap-2 cursor-pointer flex-1">
                        <UserCheck className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="font-medium">Selbst freigeben</p>
                          <p className="text-xs text-muted-foreground">
                            Dokument sofort als freigegeben markieren (nur mit Berechtigung)
                          </p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Abbrechen
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!uploadedFile || isProcessing || isUploading || (requiresApproval && approvalAction === 'send' && !selectedApprover)}
          >
            {isUploading ? 'Wird hochgeladen...' : 'Hochladen'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;