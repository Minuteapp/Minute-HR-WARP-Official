import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ReportsHeader } from "../reports/ReportsHeader";
import { ReportsFilters } from "../reports/ReportsFilters";
import { ReportsExportButtons } from "../reports/ReportsExportButtons";
import { ReportsContent } from "../reports/ReportsContent";
import { ReportsIntegrationBox } from "../reports/ReportsIntegrationBox";
import { toast } from "sonner";

export const ReportsExportTab = () => {
  const [reportType, setReportType] = useState("level");
  const [level, setLevel] = useState("all");
  const [goalType, setGoalType] = useState("all");
  const [period, setPeriod] = useState("year");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // PDF export logic would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("PDF-Export erfolgreich erstellt");
    } catch (error) {
      toast.error("Fehler beim PDF-Export");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Excel export logic would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Excel-Export erfolgreich erstellt");
    } catch (error) {
      toast.error("Fehler beim Excel-Export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ReportsHeader />
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="flex-1">
                <ReportsFilters
                  reportType={reportType}
                  setReportType={setReportType}
                  level={level}
                  setLevel={setLevel}
                  goalType={goalType}
                  setGoalType={setGoalType}
                  period={period}
                  setPeriod={setPeriod}
                />
              </div>
              <ReportsExportButtons
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                isExporting={isExporting}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <ReportsContent reportType={reportType} />
      
      <ReportsIntegrationBox />
    </div>
  );
};
