import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet } from "lucide-react";

interface ReportsExportButtonsProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  isExporting?: boolean;
}

export const ReportsExportButtons = ({
  onExportPDF,
  onExportExcel,
  isExporting = false
}: ReportsExportButtonsProps) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="destructive" 
        onClick={onExportPDF}
        disabled={isExporting}
        className="bg-red-600 hover:bg-red-700"
      >
        <FileText className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
      <Button 
        variant="default" 
        onClick={onExportExcel}
        disabled={isExporting}
        className="bg-green-600 hover:bg-green-700"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Export Excel
      </Button>
    </div>
  );
};
