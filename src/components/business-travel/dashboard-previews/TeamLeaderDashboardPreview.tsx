import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Clock, CheckCircle, Euro, Download, 
  Plus, MapPin, Calendar, ChevronRight, Plane
} from 'lucide-react';
import { DashboardStats } from '@/hooks/useTravelDashboardStats';
import { formatCurrency } from '@/lib/utils';

interface TeamLeaderDashboardPreviewProps {
  stats: DashboardStats;
  upcomingTrips: any[];
  activeTrips: any[];
}

export function TeamLeaderDashboardPreview({ 
  stats, 
  upcomingTrips, 
  activeTrips 
}: TeamLeaderDashboardPreviewProps) {
  const budgetUsedPercent = stats.teamBudget > 0 
    ? Math.round((stats.teamUsedBudget / stats.teamBudget) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Team Leader Dashboard</h3>
          <p className="text-muted-foreground">
            EMEA Sales Team - Verwalten Sie Ihr Team und Genehmigungen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Neue Geschäftsreise
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Team-Report exportieren
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.teamMembers}</p>
            <p className="text-sm text-muted-foreground">Team-Mitglieder</p>
            <p className="text-xs text-muted-foreground">EMEA Sales Team</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <Euro className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs text-muted-foreground">{budgetUsedPercent}% verbraucht</span>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(stats.teamBudget)}</p>
            <p className="text-sm text-muted-foreground">Team-Budget</p>
            <Progress value={budgetUsedPercent} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.teamPendingApprovals}</p>
            <p className="text-sm text-muted-foreground">Zu Genehmigen</p>
            <p className="text-xs text-muted-foreground">Anträge warten</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.teamApprovedThisMonth}</p>
            <p className="text-sm text-muted-foreground">Genehmigt</p>
            <p className="text-xs text-muted-foreground">Diesen Monat</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Team Upcoming Trips */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Anstehende Team-Reisen
              </CardTitle>
              <Badge variant="secondary">{upcomingTrips.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingTrips.length > 0 ? (
              <div className="space-y-3">
                {upcomingTrips.slice(0, 4).map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {trip.employees?.first_name?.[0]}{trip.employees?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {trip.employees?.first_name} {trip.employees?.last_name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {trip.destination}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(trip.start_date).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Keine anstehenden Team-Reisen
              </p>
            )}
            <Button variant="ghost" className="w-full mt-3 text-sm" size="sm">
              Alle Team-Reisen anzeigen <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Team Currently Traveling */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Team aktuell unterwegs
              </CardTitle>
              <Badge className="bg-green-100 text-green-700">
                {Math.min(activeTrips.length, stats.teamMembers)} Reisende
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {activeTrips.length > 0 ? (
              <div className="space-y-3">
                {activeTrips.slice(0, 4).map((trip) => {
                  const endDate = new Date(trip.end_date);
                  const today = new Date();
                  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={trip.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {trip.employees?.first_name?.[0]}{trip.employees?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {trip.employees?.first_name} {trip.employees?.last_name}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {trip.destination}
                          </div>
                        </div>
                      </div>
                      <Badge variant={daysLeft <= 1 ? "destructive" : "secondary"} className="text-xs">
                        {daysLeft === 0 ? 'Heute' : `${daysLeft}T übrig`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Keine Team-Mitglieder unterwegs
              </p>
            )}
            <Button variant="ghost" className="w-full mt-3 text-sm" size="sm">
              Team-Kalender anzeigen <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
