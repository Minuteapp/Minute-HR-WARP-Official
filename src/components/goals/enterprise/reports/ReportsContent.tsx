import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportByLevelTable } from "./ReportByLevelTable";
import { ReportByDelaysTable } from "./ReportByDelaysTable";
import { ReportByImpactTable } from "./ReportByImpactTable";
import { ReportByOKRTable } from "./ReportByOKRTable";
import { BarChart3, AlertTriangle, TrendingUp, Target } from "lucide-react";

interface ReportsContentProps {
  reportType: string;
}

export const ReportsContent = ({ reportType }: ReportsContentProps) => {
  const getReportConfig = () => {
    switch (reportType) {
      case 'delays':
        return {
          title: 'Zielverzögerungen',
          description: 'Übersicht aller verzögerten Ziele und Risiken',
          icon: AlertTriangle,
          component: <ReportByDelaysTable />
        };
      case 'impact':
        return {
          title: 'Ziel-Impact-Analyse',
          description: 'Analyse der Auswirkungen und Abhängigkeiten zwischen Zielen',
          icon: TrendingUp,
          component: <ReportByImpactTable />
        };
      case 'okr':
        return {
          title: 'OKR-Fortschritt',
          description: 'Fortschritt aller Objectives und Key Results',
          icon: Target,
          component: <ReportByOKRTable />
        };
      case 'level':
      default:
        return {
          title: 'Zielerreichung nach Ebene',
          description: 'Aggregierte Übersicht der Zielerreichung pro Hierarchieebene',
          icon: BarChart3,
          component: <ReportByLevelTable />
        };
    }
  };

  const config = getReportConfig();
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {config.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </CardHeader>
      <CardContent>
        {config.component}
      </CardContent>
    </Card>
  );
};
