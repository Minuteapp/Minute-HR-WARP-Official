import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { OKRsHeader } from "../okrs/OKRsHeader";
import { OKRsFilters } from "../okrs/OKRsFilters";
import { OKRsGrid } from "../okrs/OKRsGrid";
import { CreateGoalModal } from "../okrs/CreateGoalModal";

export const OKRsKPIsTab = () => {
  const [levelFilter, setLevelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleEditGoal = (id: string) => {
    // TODO: Implement edit functionality
    console.log('Edit goal:', id);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <OKRsHeader />
        
        <OKRsFilters
          levelFilter={levelFilter}
          typeFilter={typeFilter}
          onLevelChange={setLevelFilter}
          onTypeChange={setTypeFilter}
          onCreateClick={() => setCreateModalOpen(true)}
        />
        
        <OKRsGrid
          levelFilter={levelFilter}
          typeFilter={typeFilter}
          onEditGoal={handleEditGoal}
        />
        
        <CreateGoalModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
        />
      </CardContent>
    </Card>
  );
};
