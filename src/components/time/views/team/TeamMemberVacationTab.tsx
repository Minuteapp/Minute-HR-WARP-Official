import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";

const TeamMemberVacationTab = () => {
  return (
    <div className="space-y-6">
      {/* Vacation Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
          <p className="text-sm font-medium text-muted-foreground">Urlaubsanspruch</p>
          <p className="text-3xl font-bold mt-2">-- Tage</p>
          <p className="text-sm text-primary mt-1">Pro Jahr</p>
        </Card>

        <Card className="p-5 border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-white">
          <p className="text-sm font-medium text-muted-foreground">Genommen</p>
          <p className="text-3xl font-bold mt-2">-- Tage</p>
          <p className="text-sm text-destructive mt-1">--</p>
        </Card>

        <Card className="p-5 border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
          <p className="text-sm font-medium text-muted-foreground">Verbleibend</p>
          <p className="text-3xl font-bold mt-2">-- Tage</p>
          <p className="text-sm text-green-600 mt-1">Noch verfügbar</p>
        </Card>
      </div>

      {/* Urlaubsübersicht */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4">Urlaubsübersicht</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Urlaubsnutzung</span>
              <span className="text-sm font-medium">-- / -- Tage</span>
            </div>
            <Progress value={0} className="h-3" />
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-muted-foreground mb-2">Krankheitstage dieses Jahr</p>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="font-medium">-- Krankheitstage</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TeamMemberVacationTab;
