import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DocumentRow from './DocumentRow';

interface DocumentItem {
  id: string;
  filename: string;
  author: string;
  date: Date;
  size: string;
  category: string;
  projectName: string;
  downloadUrl: string;
}

interface DocumentsViewProps {
  documents: DocumentItem[];
}

const DocumentsView = ({ documents }: DocumentsViewProps) => {
  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Projekt-Dokumente</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <DocumentRow key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Keine Dokumente vorhanden
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsView;
