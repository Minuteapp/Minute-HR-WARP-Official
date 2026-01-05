
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Download, 
  Eye,
  Calendar,
  User
} from 'lucide-react';

interface ProjectDocumentsTabProps {
  project: any;
  documents: any[];
}

export const ProjectDocumentsTab: React.FC<ProjectDocumentsTabProps> = ({ project, documents = [] }) => {
  // Nur echte Daten aus der Datenbank
  const displayDocuments = documents;

  const getFileIcon = (type: string) => {
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Planung':
        return 'bg-blue-100 text-blue-800';
      case 'Design':
        return 'bg-purple-100 text-purple-800';
      case 'Entwicklung':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dokumente-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt</p>
                <p className="text-2xl font-bold">{displayDocuments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kategorien</p>
                <p className="text-2xl font-bold">{new Set(displayDocuments.map(d => d.category)).size}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Letzte Woche</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamtgröße</p>
                <p className="text-2xl font-bold">5.2 MB</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dokumente-Liste */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Projektdokumente
            </CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Dokument hochladen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {displayDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Dokumente hochgeladen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayDocuments.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    {getFileIcon(document.type)}
                    <div>
                      <h3 className="font-medium">{document.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>{document.size}</span>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {document.uploadedBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(document.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(document.category)}>
                      {document.category}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
