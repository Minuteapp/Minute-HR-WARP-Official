import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Upload, 
  File, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Lock,
  Users
} from 'lucide-react';
import PolicyAwareComponent from '@/components/system/PolicyAwareComponent';
import { usePolicyEnforcement } from '@/hooks/system/usePolicyEnforcement';
import { useDropzone } from 'react-dropzone';

interface DocumentUploadData {
  file: File | null;
  title: string;
  sensitivityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  documentType: string;
  retentionPolicy: string;
  encryptionRequired: boolean;
  accessRestrictions: string[];
}

const PolicyAwareDocumentUpload = () => {
  const { guards } = usePolicyEnforcement();
  const [formData, setFormData] = useState<DocumentUploadData>({
    file: null,
    title: '',
    sensitivityLevel: 'internal',
    documentType: '',
    retentionPolicy: '',
    encryptionRequired: false,
    accessRestrictions: []
  });
  const [policyValidation, setPolicyValidation] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Policy Context für Dokument-Upload
  const policyContext = {
    document_type: formData.documentType,
    confidential: formData.sensitivityLevel === 'confidential' || formData.sensitivityLevel === 'restricted',
    sensitivity_level: formData.sensitivityLevel,
    file_size_mb: formData.file ? Math.round(formData.file.size / (1024 * 1024)) : 0,
    file_type: formData.file?.type || '',
    encryption_required: formData.encryptionRequired,
    retention_policy: formData.retentionPolicy
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFormData({...formData, file: acceptedFiles[0]});
    }
  }, [formData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024 // 50MB limit
  });

  const validatePolicyCompliance = async () => {
    const canUpload = await guards.canUploadDocument(policyContext);
    
    const validation = {
      allowed: canUpload,
      warnings: [] as string[],
      requirements: [] as string[],
      enforced_policies: [] as string[]
    };

    // Prüfe Klassifizierungspflicht
    if (!formData.sensitivityLevel) {
      validation.requirements.push('Sensibilitätsstufe muss festgelegt werden');
    }

    // Prüfe Retention Policy
    if (!formData.retentionPolicy && formData.sensitivityLevel !== 'public') {
      validation.requirements.push('Aufbewahrungsrichtlinie muss definiert werden');
    }

    // Verschlüsselung für sensible Dokumente
    if ((formData.sensitivityLevel === 'confidential' || formData.sensitivityLevel === 'restricted') 
        && !formData.encryptionRequired) {
      validation.enforced_policies.push('Verschlüsselung wird automatisch aktiviert');
      setFormData({...formData, encryptionRequired: true});
    }

    // Dateigröße prüfen
    if (policyContext.file_size_mb > 25) {
      validation.warnings.push(`Große Datei (${policyContext.file_size_mb}MB) - Admin-Genehmigung erforderlich`);
    }

    // Audit-Trail Anforderung
    validation.enforced_policies.push('Upload wird vollständig protokolliert (DSGVO-Compliance)');

    setPolicyValidation(validation);
    return validation;
  };

  const handleUpload = async () => {
    if (!formData.file) return;

    setIsUploading(true);
    
    const validation = await validatePolicyCompliance();
    
    if (validation.allowed) {
      console.log('Dokument wird hochgeladen mit Policy-Kontext:', policyContext);
      // Hier würde der eigentliche Upload erfolgen
      setTimeout(() => {
        setIsUploading(false);
        alert('Dokument erfolgreich hochgeladen!');
      }, 2000);
    } else {
      setIsUploading(false);
    }
  };

  return (
    <PolicyAwareComponent 
      moduleName="documents" 
      requiredActions={['upload']}
      context={policyContext}
      showStatus={true}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Dokument hochladen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
              {formData.file ? (
                <div>
                  <p className="font-medium">{formData.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(formData.file.size / (1024 * 1024))} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">Datei hier ablegen oder klicken</p>
                  <p className="text-sm text-muted-foreground">
                    Maximale Dateigröße: 50MB
                  </p>
                </div>
              )}
            </div>

            {/* Document Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc-title">Dokumenttitel</Label>
                <Input
                  id="doc-title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Aussagekräftiger Titel für das Dokument"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-type">Dokumenttyp</Label>
                  <Select value={formData.documentType} onValueChange={(value) => 
                    setFormData({...formData, documentType: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Typ auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Vertrag</SelectItem>
                      <SelectItem value="invoice">Rechnung</SelectItem>
                      <SelectItem value="hr_document">HR-Dokument</SelectItem>
                      <SelectItem value="technical">Technische Dokumentation</SelectItem>
                      <SelectItem value="policy">Richtlinie</SelectItem>
                      <SelectItem value="other">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sensitivity">Sensibilitätsstufe *</Label>
                  <Select value={formData.sensitivityLevel} onValueChange={(value: any) => 
                    setFormData({...formData, sensitivityLevel: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Eye className="h-3 w-3" />
                          Öffentlich
                        </div>
                      </SelectItem>
                      <SelectItem value="internal">
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          Intern
                        </div>
                      </SelectItem>
                      <SelectItem value="confidential">
                        <div className="flex items-center gap-2">
                          <Lock className="h-3 w-3" />
                          Vertraulich
                        </div>
                      </SelectItem>
                      <SelectItem value="restricted">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          Geheim
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retention">Aufbewahrungsrichtlinie</Label>
                <Select value={formData.retentionPolicy} onValueChange={(value) => 
                  setFormData({...formData, retentionPolicy: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Richtlinie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_year">1 Jahr</SelectItem>
                    <SelectItem value="3_years">3 Jahre</SelectItem>
                    <SelectItem value="7_years">7 Jahre (Steuerrecht)</SelectItem>
                    <SelectItem value="10_years">10 Jahre</SelectItem>
                    <SelectItem value="permanent">Dauerhaft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Encryption Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="encryption"
                  checked={formData.encryptionRequired}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, encryptionRequired: !!checked})
                  }
                />
                <Label htmlFor="encryption">Verschlüsselung erforderlich</Label>
              </div>
            </div>

            {/* Policy Validation Results */}
            {policyValidation && (
              <div className="space-y-3">
                {/* Enforced Policies */}
                {policyValidation.enforced_policies.length > 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Automatisch durchgesetzte Richtlinien</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {policyValidation.enforced_policies.map((policy: string, index: number) => (
                          <li key={index} className="text-sm">{policy}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Warnings */}
                {policyValidation.warnings.length > 0 && (
                  <Alert className="border-yellow-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Hinweise</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {policyValidation.warnings.map((warning: string, index: number) => (
                          <li key={index} className="text-sm">{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Requirements */}
                {policyValidation.requirements.length > 0 && (
                  <Alert className="border-red-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erforderliche Angaben</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {policyValidation.requirements.map((req: string, index: number) => (
                          <li key={index} className="text-sm">{req}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Upload Button */}
            <Button 
              onClick={handleUpload}
              disabled={isUploading || !formData.file || !formData.title || !formData.documentType}
              className="w-full"
            >
              {isUploading ? 'Wird hochgeladen...' : 'Dokument hochladen'}
            </Button>
          </CardContent>
        </Card>

        {/* Active Document Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Aktive Dokumentenrichtlinien
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="text-sm font-medium">Klassifizierung verpflichtend</span>
                </div>
                <Badge className="bg-red-100 text-red-800">Aktiv</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">DSGVO-Compliance-Modus</span>
                </div>
                <Badge className="bg-red-100 text-red-800">Aktiv</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-medium">Export-Beschränkungen</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Überwacht</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PolicyAwareComponent>
  );
};

export default PolicyAwareDocumentUpload;