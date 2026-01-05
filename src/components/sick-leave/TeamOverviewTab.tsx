import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Activity, Calendar, ChevronRight, CheckCircle, Inbox } from 'lucide-react';
import { TeamStatusOverviewDialog } from './TeamStatusOverviewDialog';

const TeamOverviewTab = () => {
  const [teamStatusOpen, setTeamStatusOpen] = useState(false);

  // Echte Daten aus Datenbank laden - zunächst leere Arrays
  const teamMembers: { name: string; role: string; status: string; avatar: string }[] = [];

  const activeCount = teamMembers.filter(m => m.status === 'active').length;
  const sickCount = teamMembers.filter(m => m.status === 'sick').length;
  const vacationCount = teamMembers.filter(m => m.status === 'vacation').length;
  const totalCount = teamMembers.length;
  const activePercentage = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aktiv</Badge>;
      case 'sick':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Krank</Badge>;
      case 'vacation':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Urlaub</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Unternehmensweite Anwesenheit</p>
                <p className="text-2xl font-bold">{activePercentage}%</p>
                <p className="text-xs text-muted-foreground">{activeCount} von {totalCount} Mitarbeitenden</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Krankmeldungen (Woche)</p>
                <p className="text-2xl font-bold">{sickCount}</p>
                <p className="text-xs text-muted-foreground">{sickCount} Mitarbeitende</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Schichtanpassungen</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Automatisch vorgeschlagen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Status Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Team Status</CardTitle>
              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                {activePercentage}% anwesend
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Summary */}
            <div className="flex gap-3">
              <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-700">{activeCount}</p>
                <p className="text-xs text-green-600">Anwesend</p>
              </div>
              <div className="flex-1 bg-red-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-red-700">{sickCount}</p>
                <p className="text-xs text-red-600">Krank</p>
              </div>
              <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-blue-700">{vacationCount}</p>
                <p className="text-xs text-blue-600">Urlaub</p>
              </div>
            </div>

            {/* Team Members List or Empty State */}
            {teamMembers.length > 0 ? (
              <div className="space-y-2">
                {teamMembers.slice(0, 5).map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-100 text-gray-700 text-xs font-medium">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    {getStatusBadge(member.status)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Inbox className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Keine Teammitglieder vorhanden</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Gesamt: {activeCount} von {totalCount}
              </p>
              <Button 
                variant="link" 
                className="text-primary p-0 h-auto"
                onClick={() => setTeamStatusOpen(true)}
              >
                Details <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Replacement Suggestions Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Ersatzvorschläge für kritische Positionen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6 text-center bg-muted/30 rounded-lg">
              <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Keine kritischen Positionen mit Ersatzbedarf</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Status Dialog */}
      <TeamStatusOverviewDialog 
        open={teamStatusOpen} 
        onOpenChange={setTeamStatusOpen} 
      />
    </div>
  );
};

export default TeamOverviewTab;