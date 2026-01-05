import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DepartmentTeamsTab = () => {
  const teams = [
    { name: 'Backend Team A', members: 24, lead: 'Thomas Schmidt', projects: 8, avgHours: 38.2 },
    { name: 'Backend Team B', members: 22, lead: 'Maria Weber', projects: 7, avgHours: 37.8 },
    { name: 'Frontend Team', members: 28, lead: 'Max Müller', projects: 9, avgHours: 38.5 },
    { name: 'Mobile Team', members: 18, lead: 'Sarah Klein', projects: 5, avgHours: 37.2 },
    { name: 'Infrastructure', members: 16, lead: 'Leon Wagner', projects: 6, avgHours: 39.1 },
    { name: 'Quality Assurance', members: 20, lead: 'Laura Hoffmann', projects: 12, avgHours: 37.9 },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Teams (6)</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {teams.map((team, index) => (
            <Card key={index} className="p-5 border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-base">{team.name}</h4>
                  <p className="text-sm text-muted-foreground">Team Lead: {team.lead}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  {team.members} MA
                </Badge>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Aktive Projekte</span>
                  <span className="font-medium">{team.projects}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ø Arbeitsstunden</span>
                  <span className="font-medium">{team.avgHours} h/Woche</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DepartmentTeamsTab;
