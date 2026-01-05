import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const IncentivesRewards = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg border-primary/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Anreize & Belohnungen</h3>
            <p className="text-sm text-gray-500">Übersicht der Vergütungen und Boni</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Neue Belohnung
          </Button>
        </div>
        <div className="text-center text-gray-500 py-8">
          Keine Anreize oder Belohnungen vorhanden
        </div>
      </Card>
    </div>
  );
};

export default IncentivesRewards;