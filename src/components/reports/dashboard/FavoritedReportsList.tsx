
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Archive, Trash2, Star } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Report } from "@/types/reports";

interface FavoritedReportsListProps {
  reports: Report[];
  isLoading: boolean;
  onArchive: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const FavoritedReportsList = ({ reports, isLoading, onArchive, onDelete }: FavoritedReportsListProps) => {
  if (isLoading) {
    return (
      <div className="px-6 py-4">
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <Star className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-gray-500 mb-4">Keine favorisierten Berichte vorhanden</p>
        <p className="text-xs text-muted-foreground">
          Fügen Sie Berichte zu Ihren Favoriten hinzu, um schnelleren Zugriff zu erhalten
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {reports.map((report) => (
        <div key={report.id} className="flex items-center justify-between p-4 hover:bg-gray-50 border-b">
          <div className="flex flex-col">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-2" />
              <p className="font-medium">{report.title}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {report.description?.substring(0, 50) || 'Keine Beschreibung'}
              {(report.description || '').length > 50 ? '...' : ''}
            </p>
            <span className={`mt-1 px-2 py-1 rounded-full text-xs inline-block ${
              report.type === 'monthly' ? 'bg-blue-100 text-blue-800' :
              report.type === 'project' ? 'bg-green-100 text-green-800' :
              report.type === 'expense' ? 'bg-yellow-100 text-yellow-800' :
              report.type === 'travel' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100'
            }`}>
              {report.type === 'monthly' ? 'Monatsbericht' :
               report.type === 'project' ? 'Projektbericht' :
               report.type === 'expense' ? 'Kostenbericht' :
               report.type === 'travel' ? 'Reisekostenbericht' : report.type}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Optionen öffnen</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onArchive(report.id)}>
                <Archive className="mr-2 h-4 w-4" /> Archivieren
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(report.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
};

export default FavoritedReportsList;
