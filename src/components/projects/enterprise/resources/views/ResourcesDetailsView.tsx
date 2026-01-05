import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ResourceDetailsRow from './ResourceDetailsRow';

interface ResourceMemberDetail {
  id: string;
  initials: string;
  name: string;
  location: string;
  role: string;
  department: string;
  utilizationPercent: number;
  projects: { projectId: string }[];
  availableThisWeek: number;
  availableThisMonth: number;
  weeklyCost: number;
  hourlyRate: number;
  performanceScore: number;
  onTimePercent: number;
}

interface ResourcesDetailsViewProps {
  members: ResourceMemberDetail[];
}

const ResourcesDetailsView = ({ members }: ResourcesDetailsViewProps) => {
  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle>Detaillierte Ressourcen-Übersicht</CardTitle>
        <CardDescription>Alle Mitarbeiter mit erweiterten Informationen</CardDescription>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Keine Ressourcen gefunden</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Mitarbeiter</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rolle</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Auslastung</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Projekte</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Verfügbar</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Kosten/Woche</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Performance</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <ResourceDetailsRow key={member.id} member={member} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourcesDetailsView;
