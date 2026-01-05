import { Card } from "@/components/ui/card";

const TeamStatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Mein Team */}
      <Card className="p-5 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
        <p className="text-sm font-medium text-muted-foreground">Mein Team</p>
        <p className="text-3xl font-bold mt-2">--</p>
        <p className="text-sm text-primary mt-1">-- aktiv, -- Urlaub</p>
      </Card>

      {/* Gesamte Abteilung */}
      <Card className="p-5 border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
        <p className="text-sm font-medium text-muted-foreground">Gesamte Abteilung</p>
        <p className="text-3xl font-bold mt-2">--</p>
        <p className="text-sm text-primary mt-1">--</p>
      </Card>

      {/* Avg. Stunden/Woche */}
      <Card className="p-5 border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
        <p className="text-sm font-medium text-muted-foreground">Avg. Stunden/Woche</p>
        <p className="text-3xl font-bold mt-2">-- h</p>
        <p className="text-sm text-green-600 mt-1">-- vs. letzte Woche</p>
      </Card>

      {/* Ausnahmen */}
      <Card className="p-5 border-2 border-red-100 bg-gradient-to-br from-red-50 to-white">
        <p className="text-sm font-medium text-muted-foreground">Ausnahmen</p>
        <p className="text-3xl font-bold mt-2">--</p>
        <p className="text-sm text-destructive mt-1">Erfordern Aufmerksamkeit</p>
      </Card>
    </div>
  );
};

export default TeamStatsCards;
