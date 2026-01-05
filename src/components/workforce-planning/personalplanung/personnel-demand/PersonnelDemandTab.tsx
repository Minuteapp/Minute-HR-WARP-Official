import { useState } from "react";
import { DemandPlanningHeader } from "./DemandPlanningHeader";
import { AIForecastCard } from "./AIForecastCard";
import { DemandSourcesGrid } from "./DemandSourcesGrid";
import { GapAnalysisChart } from "./GapAnalysisChart";
import { DemandTimelineChart } from "./DemandTimelineChart";
import { DemandRolesTable } from "./DemandRolesTable";
import { NewDemandDialog } from "./NewDemandDialog";

export const PersonnelDemandTab = () => {
  const [isNewDemandOpen, setIsNewDemandOpen] = useState(false);

  return (
    <div className="space-y-6">
      <DemandPlanningHeader onNewDemand={() => setIsNewDemandOpen(true)} />
      
      <AIForecastCard />
      
      <DemandSourcesGrid />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GapAnalysisChart />
        <DemandTimelineChart />
      </div>
      
      <DemandRolesTable />
      
      <NewDemandDialog 
        open={isNewDemandOpen} 
        onOpenChange={setIsNewDemandOpen}
      />
    </div>
  );
};
