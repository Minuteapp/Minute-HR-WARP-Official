import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Euro, Users, Building2, Plane, Clock, TrendingUp, 
  Download, Settings, MapPin, Calendar, ChevronRight,
  Activity
} from 'lucide-react';
import { DashboardStats } from '@/hooks/useTravelDashboardStats';
import { formatCurrency } from '@/lib/utils';

interface AdminDashboardPreviewProps {
  stats: DashboardStats;
  upcomingTrips: any[];
  activeTrips: any[];
  departments: any[];
}

export function AdminDashboardPreview({ 
  stats, 
  upcomingTrips, 
  activeTrips,
  departments 
}: AdminDashboardPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">System Administrator Dashboard</h3>
          <p className="text-muted-foreground">
            Vollständige Übersicht über alle Abteilungen und Mitarbeiter
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-violet-100 text-violet-700 border-violet-200">
              Enterprise: {stats.totalEmployees} Mitarbeiter
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              {stats.totalDepartments} Abteilungen
            </Badge>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              3 Länder
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Gesamtexport
          </Button>
          <Button variant="default" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Einstellungen
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <Euro className="h-5 w-5 text-green-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-2">
              {formatCurrency(stats.totalBudget)}
            </p>
            <p className="text-sm text-muted-foreground">Gesamtbudget</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalEmployees}</p>
            <p className="text-sm text-muted-foreground">Aktive Mitarbeiter</p>
            <p className="text-xs text-green-600">+{Math.floor(stats.totalEmployees * 0.02)} diesen Monat</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Building2 className="h-5 w-5 text-violet-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalDepartments}</p>
            <p className="text-sm text-muted-foreground">Abteilungen</p>
            <p className="text-xs text-muted-foreground">3 Länder</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Plane className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.newRequestsThisWeek}</p>
            <p className="text-sm text-muted-foreground">Neue Reiseanträge</p>
            <p className="text-xs text-muted-foreground">Letzte 7 Tage</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.pendingApprovals}</p>
            <p className="text-sm text-muted-foreground">Offene Anträge</p>
            <p className="text-xs text-yellow-600">Benötigt Prüfung</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Upcoming Trips */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Anstehende Reisen
              </CardTitle>
              <Badge variant="secondary">Nächste 7 Tage</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingTrips.length > 0 ? (
              <div className="space-y-3">
                {upcomingTrips.slice(0, 3).map((trip) => (
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
                Keine anstehenden Reisen
              </p>
            )}
            <Button variant="ghost" className="w-full mt-3 text-sm" size="sm">
              Alle anstehenden Reisen <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Active Trips */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Aktuell unterwegs
              </CardTitle>
              <Badge className="bg-green-100 text-green-700">{stats.activeTrips} Reisende</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {activeTrips.length > 0 ? (
              <div className="space-y-3">
                {activeTrips.slice(0, 3).map((trip) => {
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
                Keine aktiven Reisen
              </p>
            )}
            <Button variant="ghost" className="w-full mt-3 text-sm" size="sm">
              Live-Karte anzeigen <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Department Overview */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Abteilungsübersicht
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                1-{Math.min(6, departments.length)}/{departments.length}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {departments.slice(0, 6).map((dept) => (
                <div key={dept.id} className="p-2 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm truncate">{dept.name}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>{dept.employees?.[0]?.count || 0} MA</span>
                    <span>{formatCurrency(dept.budget || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Systemaktivität
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 border-l-2 border-green-500 bg-green-50/50 rounded-r">
                <div className="text-xs">
                  <p className="font-medium">Reiseantrag genehmigt</p>
                  <p className="text-muted-foreground">Vor 5 Minuten</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 border-l-2 border-blue-500 bg-blue-50/50 rounded-r">
                <div className="text-xs">
                  <p className="font-medium">Neuer Beleg hochgeladen</p>
                  <p className="text-muted-foreground">Vor 12 Minuten</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 border-l-2 border-yellow-500 bg-yellow-50/50 rounded-r">
                <div className="text-xs">
                  <p className="font-medium">Budget-Warnung</p>
                  <p className="text-muted-foreground">Vor 1 Stunde</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
