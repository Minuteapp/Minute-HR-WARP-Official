import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  onSuccess: () => void;
}

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  isOpen,
  onClose,
  employeeId,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type_id: '',
    issue_date: '',
    expiry_date: '',
    issued_by: '',
    document_number: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();

  // Fetch document types
  const { data: documentTypes = [] } = useQuery({
    queryKey: ['employee-document-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_document_types')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "Datei zu groß",
          description: "Die maximale Dateigröße beträgt 50MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Dateityp nicht unterstützt",
          description: "Erlaubte Dateitypen: PDF, JPEG, PNG, WebP, DOC, DOCX",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      // Auto-fill title if empty
      if (!formData.title) {
        setFormData(prev => ({
          ...prev,
          title: selectedFile.name.split('.')[0]
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Keine Datei ausgewählt",
        description: "Bitte wählen Sie eine Datei zum Hochladen aus.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.document_type_id) {
      toast({
        title: "Fehlende Angaben",
        description: "Titel und Dokumenttyp sind erforderlich.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${employeeId}/${Date.now()}-${formData.title}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: employeeId,
          document_type_id: formData.document_type_id,
          title: formData.title,
          description: formData.description,
          file_path: uploadData.path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          document_number: formData.document_number || null,
          issue_date: formData.issue_date || null,
          expiry_date: formData.expiry_date || null,
          issued_by: formData.issued_by || null,
          status: 'active',
          uploaded_by: employeeId // Could be current user ID
        });

      if (dbError) throw dbError;

      toast({
        title: "Dokument hochgeladen",
        description: `${formData.title} wurde erfolgreich hochgeladen.`,
      });

      // Reset form
      setFile(null);
      setFormData({
        title: '',
        description: '',
        document_type_id: '',
        issue_date: '',
        expiry_date: '',
        issued_by: '',
        document_number: ''
      });
      
      onSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload fehlgeschlagen",
        description: "Das Dokument konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFormData({
      title: '',
      description: '',
      document_type_id: '',
      issue_date: '',
      expiry_date: '',
      issued_by: '',
      document_number: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Dokument hochladen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Datei auswählen *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
              {file ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Datei hier ablegen oder klicken</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    PDF, JPEG, PNG, WebP, DOC, DOCX (max. 50MB)
                  </p>
                  <Button type="button" variant="outline">
                    Datei auswählen
                  </Button>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Dokumenttitel eingeben"
                required
              />
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="document-type">Dokumenttyp *</Label>
              <Select
                value={formData.document_type_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, document_type_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Typ auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Zusätzliche Informationen zum Dokument"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Document Number */}
            <div className="space-y-2">
              <Label htmlFor="document-number">Dokumentnummer</Label>
              <Input
                id="document-number"
                value={formData.document_number}
                onChange={(e) => setFormData(prev => ({ ...prev, document_number: e.target.value }))}
                placeholder="z.B. AV-2024-001"
              />
            </div>

            {/* Issued By */}
            <div className="space-y-2">
              <Label htmlFor="issued-by">Ausgestellt von</Label>
              <Input
                id="issued-by"
                value={formData.issued_by}
                onChange={(e) => setFormData(prev => ({ ...prev, issued_by: e.target.value }))}
                placeholder="z.B. Einwohnermeldeamt"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Issue Date */}
            <div className="space-y-2">
              <Label htmlFor="issue-date">Ausstellungsdatum</Label>
              <Input
                id="issue-date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiry-date">Ablaufdatum</Label>
              <Input
                id="expiry-date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isUploading}
            >
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || !file}
              className="flex-1"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Wird hochgeladen...
                </div>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Dokument hochladen
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;