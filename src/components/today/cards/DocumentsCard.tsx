
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface DocumentsCardProps {
  darkMode: boolean;
  onToggleVisibility: () => void;
}

// Keine Mockup-Daten - in einer echten Anwendung aus einer API oder Store laden
const documents: any[] = [];

const DocumentsCard = ({ darkMode, onToggleVisibility }: DocumentsCardProps) => {
  const navigate = useNavigate();
  
  // Sortiere Dokumente: Dringend > Fällig > Neu > Rest
  const sortedDocuments = [...documents].sort((a, b) => {
    if (a.urgent !== b.urgent) {
      return a.urgent ? -1 : 1;
    }
    if (a.status !== b.status) {
      if (a.status === 'pending_signature') return -1;
      if (b.status === 'pending_signature') return 1;
      if (a.status === 'pending_approval') return -1;
      if (b.status === 'pending_approval') return 1;
    }
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });
  
  const urgentCount = documents.filter(d => d.urgent).length;
  
  const getDocumentIcon = (type: string) => {
    switch(type) {
      case 'contract': return '📝';
      case 'gdpr': return '🔒';
      case 'planning': return '📊';
      case 'expense': return '💰';
      default: return '📄';
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending_signature':
        return <Badge variant="destructive">Unterschrift erforderlich</Badge>;
      case 'pending_review':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Durchsicht erforderlich</Badge>;
      case 'pending_approval':
        return <Badge variant="default" className="bg-yellow-500">Genehmigung ausstehend</Badge>;
      case 'new':
        return <Badge variant="default" className="bg-green-500">Neu</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card className={`today-card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <FileText className="h-5 w-5 text-primary" />
          Dokumente
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/documents')}>
              Alle Dokumente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/documents', { state: { upload: true } })}>
              Dokument hochladen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleVisibility}>
              Card ausblenden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {urgentCount > 0 && (
          <div className={`p-2 rounded-md mb-3 text-sm flex items-center font-medium ${
            darkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'
          }`}>
            <span>⚠️ {urgentCount} {urgentCount === 1 ? 'Dokument erfordert' : 'Dokumente erfordern'} Aufmerksamkeit</span>
          </div>
        )}
        
        <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
          {documents.length > 0 ? (
            documents.map((document) => (
              <div
                key={document.id}
                className={`p-3 rounded-md flex items-start gap-3 ${
                  document.urgent 
                    ? darkMode ? 'bg-red-900/30' : 'bg-red-50'
                    : darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="mt-0.5 text-xl flex-shrink-0">
                  {getDocumentIcon(document.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{document.title}</h4>
                  
                  <div className="mt-1">{getStatusBadge(document.status)}</div>
                  
                  {document.dueDate && (
                    <p className={`text-xs mt-2 ${
                      document.urgent 
                        ? darkMode ? 'text-red-300' : 'text-red-600'
                        : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Fällig: {format(new Date(document.dueDate), 'dd.MM.yyyy', { locale: de })}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Keine ausstehenden Dokumente
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => navigate('/documents')}
        >
          Alle anzeigen
        </Button>
        <Button
          variant="default"
          size="sm"
          className="w-full ml-2"
          onClick={() => navigate('/documents', { state: { upload: true } })}
        >
          <Upload className="h-4 w-4 mr-1" />
          Hochladen
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentsCard;
