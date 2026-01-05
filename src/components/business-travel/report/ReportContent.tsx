
import { BusinessTripReport } from "@/types/business-travel";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ReportContentProps {
  report: BusinessTripReport;
}

const ReportContent = ({ report }: ReportContentProps) => {
  const getSuccessColor = (rating: number) => {
    if (rating >= 8) return "bg-green-500";
    if (rating >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Reisebeschreibung</h4>
        <p className="text-gray-700 whitespace-pre-wrap">{report.content}</p>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Erfolgsbewertung</h4>
        <div className="flex items-center gap-3">
          <Progress 
            value={report.success_rating * 10} 
            className="flex-1"
          />
          <Badge className={getSuccessColor(report.success_rating)}>
            {report.success_rating}/10
          </Badge>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Feedback & Verbesserungsvorschläge</h4>
        <p className="text-gray-700 whitespace-pre-wrap">{report.feedback}</p>
      </div>
      
      <div className="pt-4 border-t text-sm text-gray-500">
        <p>Erstellt am {format(new Date(report.created_at), 'dd. MMMM yyyy, HH:mm', { locale: de })}</p>
        {report.updated_at !== report.created_at && (
          <p>Zuletzt bearbeitet am {format(new Date(report.updated_at), 'dd. MMMM yyyy, HH:mm', { locale: de })}</p>
        )}
      </div>
    </div>
  );
};

export default ReportContent;
