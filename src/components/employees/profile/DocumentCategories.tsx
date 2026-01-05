
import { FileText, FolderOpen, MessageSquare, Upload, Download, Trash2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import type { DocumentCategory } from '@/types/documents';

interface DocumentCategoriesProps {
  employeeId: string;
  className?: string;
}

interface CategoryType {
  title: string;
  description: string;
  icon: any; // Using any for Lucide icons
  count: number;
  type: DocumentCategory;
}

export const documentCategories: CategoryType[] = [
  {
    title: 'Verträge & Dokumente',
    description: 'Arbeitsverträge, Zertifikate und wichtige Dokumente',
    icon: FileText,
    count: 0,
    type: 'employee'
  },
  {
    title: 'Schulungen & Zertifikate',
    description: 'Absolvierte und geplante Schulungen',
    icon: FolderOpen,
    count: 0,
    type: 'training'
  },
  {
    title: 'Sonstige Dokumente',
    description: 'Weitere wichtige Dokumente',
    icon: MessageSquare,
    count: 0,
    type: 'company'
  }
];

export const DocumentCategories = ({ employeeId, className }: DocumentCategoriesProps) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('employee');
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState<string>('');
  const [showCategoryDocuments, setShowCategoryDocuments] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: documents = [], refetch } = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('archived', false);
      
      if (error) throw error;
      return data;
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', documentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
      toast.success("Dokument erfolgreich gelöscht");
    },
    onError: (error) => {
      console.error('Error deleting document:', error);
      toast.error("Fehler beim Löschen des Dokuments");
    }
  });

  const handleUpload = (category: DocumentCategory, title: string) => {
    setSelectedCategory(category);
    setSelectedCategoryTitle(title);
    setShowUploadDialog(true);
  };

  const handleCategoryClick = (category: DocumentCategory, title: string) => {
    setSelectedCategory(category);
    setSelectedCategoryTitle(title);
    setShowCategoryDocuments(true);
  };
  
  const handleBackToCategoriesList = () => {
    setShowCategoryDocuments(false);
  };

  const handleDeleteDocument = (documentId: string) => {
    if (confirm("Möchten Sie dieses Dokument wirklich löschen?")) {
      deleteDocumentMutation.mutate(documentId);
    }
  };

  const handleDownloadDocument = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('employee-documents')
        .download(filePath);
      
      if (error) throw error;
      
      // Erstelle ein Blob und einen Download-Link
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Download gestartet");
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error("Fehler beim Herunterladen des Dokuments");
    }
  };

  // Zähle Dokumente pro Kategorie
  const documentCounts = documents.reduce((acc, doc) => {
    const type = (doc.document_type as DocumentCategory) || 'employee';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<DocumentCategory, number>);

  // Filtere Dokumente für die ausgewählte Kategorie
  const categoryDocuments = documents.filter(
    doc => (doc.document_type as DocumentCategory) === selectedCategory
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          {showCategoryDocuments ? selectedCategoryTitle : "Dokumente"}
        </h2>
        {showCategoryDocuments ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBackToCategoriesList}>
              Zurück
            </Button>
            <Button onClick={() => handleUpload(selectedCategory, selectedCategoryTitle)} className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Dokument hochladen
            </Button>
          </div>
        ) : (
          <Button onClick={() => setShowUploadDialog(true)} className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Dokument hochladen
          </Button>
        )}
      </div>

      {!showCategoryDocuments ? (
        // Zeige Kategorien an
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentCategories.map((category, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer border"
              onClick={() => handleCategoryClick(category.type, category.title)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {documentCounts[category.type] || 0}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Zeige Dokumente für die ausgewählte Kategorie
        <div className="bg-white rounded-lg border p-4">
          {categoryDocuments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Keine Dokumente in dieser Kategorie vorhanden.</p>
              <Button onClick={() => handleUpload(selectedCategory, selectedCategoryTitle)} variant="outline" className="mt-4">
                <Upload className="w-4 h-4 mr-2" />
                Dokument hochladen
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryDocuments.map((doc) => (
                <div key={doc.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h4 className="font-medium">{doc.filename}</h4>
                    <p className="text-sm text-gray-500">
                      Hochgeladen am {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownloadDocument(doc.file_path, doc.filename)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Löschen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <DocumentUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        defaultCategory={selectedCategory}
        onUpload={async (file: File, category: string) => {
          try {
            const fileExt = file.name.split('.').pop();
            const filePath = `${employeeId}/${crypto.randomUUID()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('employee-documents')
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { error: dbError } = await supabase
              .from('employee_documents')
              .insert({
                employee_id: employeeId,
                filename: file.name,
                file_path: filePath,
                file_size: file.size,
                document_type: category || 'employee',
                mime_type: file.type,
                category: 'employee'
              });

            if (dbError) throw dbError;

            toast.success("Dokument erfolgreich hochgeladen");
            refetch();
          } catch (error) {
            console.error('Error uploading document:', error);
            toast.error("Fehler beim Hochladen des Dokuments");
            throw error;
          }
        }}
      />
    </div>
  );
};
