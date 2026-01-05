import { useState } from "react";
import { MeasuresHeader } from "./MeasuresHeader";
import { MeasuresFilterTabs } from "./MeasuresFilterTabs";
import { MeasuresKPICards } from "./MeasuresKPICards";
import { MeasureCard } from "./MeasureCard";
import { MeasuresSuccessCard } from "./MeasuresSuccessCard";
import { NewMeasureDialog } from "./NewMeasureDialog";

interface Measure {
  id: string;
  title: string;
  description: string;
  status: 'in_progress' | 'planned' | 'completed';
  priority: 'high' | 'medium' | 'low';
  type: string;
  responsible: string;
  startDate: string;
  endDate: string;
  budget: number;
  progress: number;
  integrations: string[];
  milestones: { id: string; name: string; date: string; completed: boolean }[];
  risks: string[];
}

export const MeasuresTab = () => {
  const [isNewMeasureOpen, setIsNewMeasureOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [measures] = useState<Measure[]>([]);

  const filterCounts = {
    all: measures.length,
    inProgress: measures.filter(m => m.status === 'in_progress').length,
    planned: measures.filter(m => m.status === 'planned').length,
    highPriority: measures.filter(m => m.priority === 'high').length,
  };

  const filteredMeasures = measures.filter(measure => {
    switch (activeFilter) {
      case 'inProgress':
        return measure.status === 'in_progress';
      case 'planned':
        return measure.status === 'planned';
      case 'highPriority':
        return measure.priority === 'high';
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      <MeasuresHeader onNewMeasure={() => setIsNewMeasureOpen(true)} />
      
      <MeasuresFilterTabs 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={filterCounts}
      />
      
      <MeasuresKPICards />
      
      {filteredMeasures.length > 0 ? (
        <div className="space-y-4">
          {filteredMeasures.map(measure => (
            <MeasureCard key={measure.id} measure={measure} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Keine Maßnahmen vorhanden. Klicken Sie auf "Neue Maßnahme" um eine Maßnahme anzulegen.
        </div>
      )}
      
      <MeasuresSuccessCard />
      
      <NewMeasureDialog 
        open={isNewMeasureOpen} 
        onOpenChange={setIsNewMeasureOpen}
      />
    </div>
  );
};
