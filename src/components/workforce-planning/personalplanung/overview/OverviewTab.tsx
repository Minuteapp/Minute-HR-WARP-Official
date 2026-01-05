import { PersonalplanungKPICards } from "./PersonalplanungKPICards";
import { HandlungsbedarfSection } from "./HandlungsbedarfSection";
import { HeadcountChart } from "./HeadcountChart";
import { DepartmentLoadChart } from "./DepartmentLoadChart";
import { QuickAccessCards } from "./QuickAccessCards";

export const OverviewTab = () => {
  // Keine Mockup-Daten - Komponenten zeigen leere Zustände
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <PersonalplanungKPICards />

      {/* Handlungsbedarf */}
      <HandlungsbedarfSection />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HeadcountChart />
        <DepartmentLoadChart />
      </div>

      {/* Schnellzugriff */}
      <QuickAccessCards />
    </div>
  );
};
