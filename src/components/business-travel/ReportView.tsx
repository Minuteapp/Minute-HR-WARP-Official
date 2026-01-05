
import { Card } from "@/components/ui/card";
import { BusinessTripReport } from "@/types/business-travel";
import { useState } from "react";
import ReportFormDialog from "./ReportFormDialog";
import ReportHeader from "./report/ReportHeader";
import ReportContent from "./report/ReportContent";
import ReportEmptyState from "./report/ReportEmptyState";
import ReportSkeleton from "./report/ReportSkeleton";

interface ReportViewProps {
  report: BusinessTripReport | null;
  isLoading: boolean;
  tripId: string;
  canEdit: boolean;
}

const ReportView = ({ report, isLoading, tripId, canEdit }: ReportViewProps) => {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  if (isLoading) {
    return <ReportSkeleton />;
  }

  return (
    <>
      <Card className="p-6">
        <ReportHeader 
          report={report} 
          canEdit={canEdit} 
          onEdit={() => setIsReportDialogOpen(true)} 
        />
        
        {!report ? (
          <ReportEmptyState 
            canEdit={canEdit} 
            onCreateReport={() => setIsReportDialogOpen(true)} 
          />
        ) : (
          <ReportContent report={report} />
        )}
      </Card>
      
      <ReportFormDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        tripId={tripId}
        existingReport={report}
      />
    </>
  );
};

export default ReportView;
