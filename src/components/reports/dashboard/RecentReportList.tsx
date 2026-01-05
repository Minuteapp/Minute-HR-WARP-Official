
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Archive, Trash2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Report } from "@/types/reports";
import { format } from "date-fns";

interface RecentReportListProps {
  reports: Report[];
  isLoading: boolean;
  onArchive: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const RecentReportList = ({ reports, isLoading, onArchive, onDelete }: RecentReportListProps) => {
  // Sortiere Berichte nach Erstellungsdatum, neueste zuerst
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5); // Nur die 5 neuesten anzeigen

  if (isLoading) {
    return (
      <div className="px-6 py-4">
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (recentReports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-gray-500 mb-4">Keine kürzlich erstellten Berichte vorhanden</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {recentReports.map((report) => (
        <div key={report.id} className="flex items-center justify-between p-4 hover:bg-gray-50 border-b">
          <div className="flex flex-col">
            <p className="font-medium">{report.title}</p>
            <p className="text-sm text-muted-foreground">
              Erstellt am {format(new Date(report.created_at), 'dd.MM.yyyy')}
            </p>
            <div className="flex items-center mt-1">
              <span className={`px-2 py-1 rounded-full text-xs ${
                report.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                report.status === 'approved' ? 'bg-green-100 text-green-800' : 
                report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                report.status === 'archived' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
              }`}>
                {report.status === 'draft' ? 'Entwurf' :
                 report.status === 'pending' ? 'Ausstehend' :
                 report.status === 'approved' ? 'Genehmigt' : 
                 report.status === 'rejected' ? 'Abgelehnt' :
                 report.status === 'archived' ? 'Archiviert' : report.status}
              </span>
              <span className="ml-2 text-xs text-muted-foreground capitalize">{report.type}</span>
            </div>
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

export default RecentReportList;
