
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, Download, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: 'pending' | 'signed' | 'rejected';
  uploadedAt?: string;
  signedAt?: string;
  fileUrl?: string;
}

const DOCUMENT_TYPES: DocumentType[] = [
  { id: '1', name: 'Arbeitsvertrag', description: 'Der unterschriebene Arbeitsvertrag', required: true },
  { id: '2', name: 'Verhaltenskodex', description: 'Der Verhaltenskodex des Unternehmens', required: true },
  { id: '3', name: 'Datenschutzerklärung', description: 'Erklärung zum Schutz personenbezogener Daten', required: true },
  { id: '4', name: 'IT-Richtlinien', description: 'Richtlinien zur IT-Nutzung', required: false }
];

const OnboardingDocuments = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Arbeitsvertrag',
      type: DOCUMENT_TYPES[0],
      status: 'pending'
    },
    {
      id: '2',
      name: 'Verhaltenskodex',
      type: DOCUMENT_TYPES[1],
      status: 'pending'
    }
  ]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentTypeId: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDocumentIcon = (status: string) => {
    switch(status) {
      case 'signed': return <Check className="h-5 w-5 text-green-500" />;
      case 'rejected': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <File className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'signed': return 'Unterschrieben';
      case 'rejected': return 'Abgelehnt';
      default: return 'Ausstehend';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'signed': return 'text-green-500 bg-green-50';
      case 'rejected': return 'text-red-500 bg-red-50';
      default: return 'text-yellow-500 bg-yellow-50';
    }
  };

  const handleUpload = () => {
    if (!uploadForm.documentTypeId || !selectedFile) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte wählen Sie einen Dokumenttyp und eine Datei aus."
      });
      return;
    }

    const selectedType = DOCUMENT_TYPES.find(type => type.id === uploadForm.documentTypeId);
    
    if (!selectedType) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Ungültiger Dokumenttyp."
      });
      return;
    }

    const newDocument: Document = {
      id: Math.random().toString(36).substr(2, 9),
      name: selectedFile.name,
      type: selectedType,
      status: 'pending',
      uploadedAt: new Date().toISOString(),
      fileUrl: URL.createObjectURL(selectedFile) // This would be a server URL in a real app
    };

    setDocuments([...documents, newDocument]);
    setIsUploadDialogOpen(false);
    setUploadForm({ documentTypeId: '', description: '' });
    setSelectedFile(null);

    toast({
      title: "Dokument hochgeladen",
      description: "Das Dokument wurde erfolgreich hochgeladen."
    });
  };

  const handleSignDocument = (id: string) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, status: 'signed', signedAt: new Date().toISOString() } : doc
    ));

    toast({
      title: "Dokument unterschrieben",
      description: "Das Dokument wurde erfolgreich unterschrieben."
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Dokumente</CardTitle>
              <CardDescription>
                Wichtige Dokumente für Ihr Onboarding-Prozess.
              </CardDescription>
            </div>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <UploadCloud className="h-4 w-4 mr-2" />
              Dokument hochladen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Dokumente suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="space-y-4 mt-6">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-10">
                <File className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">Keine Dokumente gefunden.</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsUploadDialogOpen(true)}>
                  Dokument hochladen
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Typ</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Erforderlich</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 flex items-center">
                          <div className="mr-2">
                            {getDocumentIcon(doc.status)}
                          </div>
                          <span className="font-medium">{doc.name}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">{doc.type.name}</td>
                        <td className="px-4 py-3 text-sm">
                          {doc.type.required ? 'Ja' : 'Nein'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                            {getStatusText(doc.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Ansehen
                            </Button>
                            {doc.status === 'pending' && (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleSignDocument(doc.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Unterschreiben
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Dokument hochladen</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Dokumenttyp</Label>
              <Select
                value={uploadForm.documentTypeId}
                onValueChange={(value) => setUploadForm({...uploadForm, documentTypeId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Dokumenttyp auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} {type.required ? '(Erforderlich)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung (optional)</Label>
              <Textarea
                id="description"
                rows={2}
                value={uploadForm.description}
                onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                placeholder="Zusätzliche Informationen zum Dokument"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Datei</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="h-10 w-10 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Klicken Sie zum Hochladen</span> oder ziehen Sie die Datei hierher
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOCX, JPG oder PNG (max. 10MB)
                    </p>
                  </div>
                  <input
                    id="file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {selectedFile && (
                <div className="mt-2 flex items-center">
                  <File className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm">{selectedFile.name}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleUpload}>Hochladen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OnboardingDocuments;
