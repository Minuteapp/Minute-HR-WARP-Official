
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye } from 'lucide-react';
import { useSimilarDocuments } from '@/hooks/useDocumentLinking';
import { formatDate } from '@/lib/utils';

interface SimilarDocumentsProps {
  documentId: string;
  onDocumentClick?: (documentId: string) => void;
}

export const SimilarDocuments: React.FC<SimilarDocumentsProps> = ({ 
  documentId, 
  onDocumentClick 
}) => {
  const { data: similarDocs = [], isLoading } = useSimilarDocuments(documentId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ähnliche Dokumente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (similarDocs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ähnliche Dokumente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Keine ähnlichen Dokumente gefunden.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Ähnliche Dokumente ({similarDocs.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {similarDocs.slice(0, 5).map((doc) => (
          <div 
            key={doc.document_id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => onDocumentClick?.(doc.document_id)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{doc.documents.title}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {doc.documents.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {Math.round(doc.relevance_score * 100)}% ähnlich
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatDate(doc.documents.created_at)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
        
        {similarDocs.length > 5 && (
          <p className="text-sm text-gray-500 text-center pt-2">
            ... und {similarDocs.length - 5} weitere ähnliche Dokumente
          </p>
        )}
      </CardContent>
    </Card>
  );
};
