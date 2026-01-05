import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Plane, 
  Hotel, 
  Receipt,
  File,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { TripDocument } from "@/types/business-travel-extended";

interface TripDocumentsTabProps {
  documents: TripDocument[];
  notes?: string | null;
}

const TripDocumentsTab = ({ documents, notes }: TripDocumentsTabProps) => {
  const getDocumentIcon = (type: TripDocument['document_type']) => {
    switch (type) {
      case 'travel_request':
        return <FileText className="h-5 w-5" />;
      case 'approval':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'flight_ticket':
        return <Plane className="h-5 w-5" />;
      case 'hotel_booking':
        return <Hotel className="h-5 w-5" />;
      case 'receipt':
        return <Receipt className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const getDocumentColor = (type: TripDocument['document_type']) => {
    switch (type) {
      case 'travel_request':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      case 'approval':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'flight_ticket':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'hotel_booking':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'receipt':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatFileSize = (sizeKb: number | null) => {
    if (!sizeKb) return 'N/A';
    if (sizeKb >= 1024) {
      return `${(sizeKb / 1024).toFixed(1)} MB`;
    }
    return `${sizeKb} KB`;
  };

  const handleDownload = (doc: TripDocument) => {
    if (doc.file_path) {
      window.open(doc.file_path, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Dokumente & Anhänge</h2>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Dokumente vorhanden</p>
            <p className="text-sm mt-2">Laden Sie Reisedokumente hoch</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getDocumentColor(doc.document_type)}`}>
                    {getDocumentIcon(doc.document_type)}
                  </div>
                  
                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{doc.document_name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Erstellt: {format(new Date(doc.created_at), "dd. MMM yyyy", { locale: de })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Größe: {formatFileSize(doc.file_size_kb)}
                    </p>
                  </div>
                  
                  {/* Download Button */}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDownload(doc)}
                    disabled={!doc.file_path}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Additional Notes */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4" />
            Zusätzliche Hinweise
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notes ? (
            <p className="text-sm text-muted-foreground">{notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Keine zusätzlichen Hinweise vorhanden.
            </p>
          )}
          <div className="flex items-center gap-2 mt-4 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Alle erforderlichen Dokumente vorhanden</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripDocumentsTab;