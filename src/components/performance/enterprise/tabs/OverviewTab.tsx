import { useState } from "react";
import { OverviewKPICards } from "../overview/OverviewKPICards";
import { OverviewFilters } from "../overview/OverviewFilters";
import { TeamOverviewList } from "../overview/TeamOverviewList";

export function OverviewTab() {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Performance-Übersicht</h2>
        <OverviewFilters
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />
      </div>

      <OverviewKPICards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamOverviewList />
      </div>
    </div>
  );
}
