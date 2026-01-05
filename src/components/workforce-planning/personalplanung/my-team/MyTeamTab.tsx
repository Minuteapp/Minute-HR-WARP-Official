import { TeamAnalysisHeader } from "./TeamAnalysisHeader";
import { TeamKPICards } from "./TeamKPICards";
import { CapacityAnalysisChart } from "./CapacityAnalysisChart";
import { AIWarningBox } from "./AIWarningBox";
import { WorkingTimeModelChart } from "./WorkingTimeModelChart";
import { ContractTypeChart } from "./ContractTypeChart";
import { TeamDetailTable } from "./TeamDetailTable";

export const MyTeamTab = () => {
  // Keine Mockup-Daten - Komponenten zeigen leere Zustände
  return (
    <div className="space-y-6">
      {/* Header mit Filtern */}
      <TeamAnalysisHeader />

      {/* KPI Cards */}
      <TeamKPICards />

      {/* Kapazitätsanalyse Chart */}
      <CapacityAnalysisChart />

      {/* KI-Warnung (nur anzeigen wenn isVisible=true) */}
      <AIWarningBox isVisible={false} />

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkingTimeModelChart />
        <ContractTypeChart />
      </div>

      {/* Detail-Tabelle */}
      <TeamDetailTable />
    </div>
  );
};
