import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Upload, File, FileSpreadsheet, FileImage } from 'lucide-react';

interface ProjectDocumentsTabNewProps {
  project: any;
}

export const ProjectDocumentsTabNew: React.FC<ProjectDocumentsTabNewProps> = ({ project }) => {
  const documents = [
    { id: 1, name: 'Projektplan_v2.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: '10.01.2025', icon: FileText },
    { id: 2, name: 'Budget_Kalkulation.xlsx', type: 'xlsx', size: '856 KB', uploadedAt: '08.01.2025', icon: FileSpreadsheet },
    { id: 3, name: 'Architektur_Diagramm.png', type: 'image', size: '1.2 MB', uploadedAt: '05.01.2025', icon: FileImage },
    { id: 4, name: 'Anforderungsspezifikation.docx', type: 'doc', size: '1.8 MB', uploadedAt: '03.01.2025', icon: File },
    { id: 5, name: 'Stakeholder_Präsentation.pptx', type: 'pptx', size: '4.5 MB', uploadedAt: '01.01.2025', icon: File },
    { id: 6, name: 'Risikoanalyse.pdf', type: 'pdf', size: '890 KB', uploadedAt: '28.12.2024', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Upload-Button */}
      <div className="flex justify-end">
        <Button className="bg-primary text-primary-foreground">
          <Upload className="h-4 w-4 mr-2" />
          Dokument hochladen
        </Button>
      </div>

      {/* Dokumente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Projekt-Dokumente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {documents.map((doc) => {
              const IconComponent = doc.icon;
              return (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.size} • Hochgeladen am {doc.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};