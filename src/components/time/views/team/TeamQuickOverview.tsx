import { Card } from "@/components/ui/card";

const TeamQuickOverview = () => {
  return (
    <Card className="p-5 h-fit">
      <h3 className="font-semibold mb-4">Schnellübersicht</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Aktiv</span>
          <span className="font-semibold">--</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Pause</span>
          <span className="font-semibold">--</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Urlaub</span>
          <span className="font-semibold">--</span>
        </div>
      </div>
    </Card>
  );
};

export default TeamQuickOverview;
