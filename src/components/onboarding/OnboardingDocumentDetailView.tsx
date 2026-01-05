import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  FileText, 
  Eye, 
  Download,
  CheckCircle,
  Calendar,
  User
} from "lucide-react";

interface Document {
  id: number;
  employee: {
    name: string;
    position: string;
    initials: string;
  };
  document: string;
  size: string;
  category: string;
  type: string;
  status: 'signed' | 'rejected';
  uploadDate: string;
  uploadedBy: string;
  signedDate: string | null;
  department: string;
  priority: 'Hoch' | 'Mittel' | 'Niedrig';
}

interface OnboardingDocumentDetailViewProps {
  document: Document;
  onBack: () => void;
}

const OnboardingDocumentDetailView = ({ document, onBack }: OnboardingDocumentDetailViewProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Mittel':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Niedrig':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2 pl-0 hover:bg-transparent">
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Übersicht
      </Button>

      {/* Document Header */}
      <div className="flex items-start gap-4">
        <div className={`p-4 rounded-lg ${document.status === 'signed' ? 'bg-green-100' : 'bg-gray-100'}`}>
          <FileText className={`h-8 w-8 ${document.status === 'signed' ? 'text-green-600' : 'text-gray-600'}`} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{document.document}</h2>
            <Badge 
              className={
                document.status === 'signed' 
                  ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100" 
                  : "bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
              }
            >
              {document.status === 'signed' ? 'Signiert' : 'Abgelehnt'}
            </Badge>
            <Badge variant="outline">{document.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Größe: {document.size}</p>
        </div>
      </div>

      {/* Employee & Department */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">Mitarbeiter</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                {document.employee.initials}
              </div>
              <div>
                <p className="font-medium">{document.employee.name}</p>
                <p className="text-sm text-muted-foreground">{document.employee.position}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">Abteilung</p>
            <p className="font-medium">{document.department}</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className={`grid gap-4 ${document.status === 'signed' ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {/* Uploaded Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Hochgeladen</span>
            </div>
            <p className="font-medium">{document.uploadDate}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <User className="h-3 w-3" />
              <span>von {document.uploadedBy}</span>
            </div>
          </CardContent>
        </Card>

        {/* Signed Card - only for signed documents */}
        {document.status === 'signed' && document.signedDate && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Signiert</span>
              </div>
              <p className="font-medium text-green-700">{document.signedDate}</p>
              <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                <CheckCircle className="h-3 w-3" />
                <span>Rechtsgültig</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Priority Card */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Priorität</p>
            <Badge className={getPriorityColor(document.priority)}>
              {document.priority}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button className="w-full gap-2">
          <Eye className="h-4 w-4" />
          Dokument anzeigen
        </Button>
        <Button variant="outline" className="w-full gap-2">
          <Download className="h-4 w-4" />
          Herunterladen
        </Button>
      </div>
    </div>
  );
};

export default OnboardingDocumentDetailView;
