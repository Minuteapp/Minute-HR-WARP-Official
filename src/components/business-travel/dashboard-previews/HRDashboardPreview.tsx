import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, Clock, CheckCircle, Euro, Download, 
  CheckCheck, MapPin, Calendar, ChevronRight, Plane
} from 'lucide-react';
import { DashboardStats } from '@/hooks/useTravelDashboardStats';
import { formatCurrency } from '@/lib/utils';

interface HRDashboardPreviewProps {
  stats: DashboardStats;
  upcomingTrips: any[];
  activeTrips: any[];
  departments: any[];
}

export function HRDashboardPreview({ 
  stats, 
  upcomingTrips, 
  activeTrips,
  departments 
}: HRDashboardPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">HR Administrator Dashboard</h3>
          <p className="text-muted-foreground">
            Verwalten Sie alle Mitarbeiter, Genehmigungen und HR-Prozesse
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              {stats.totalEmployees} Mitarbeiter
            </Badge>
            {stats.pendingApprovals > 0 && (
              <Badge className="bg-red-100 text-red-700 border-red-200">
                {stats.pendingApprovals} ausstehende Genehmigungen
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            HR-Report exportieren
          </Button>
          <Button variant="default" size="sm" className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Batch-Genehmigung
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
            <p className="text-2xl font-bold mt-2">{stats.totalEmployees}</p>
            <p className="text-sm text-muted-foreground">Mitarbeiter gesamt</p>
            <p className="text-xs text-green-600">+{Math.floor(stats.totalEmployees * 0.02)} diesen Monat</p>
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
            <p className="text-sm text-muted-foreground">Zu Genehmigen</p>
            <p className="text-xs text-muted-foreground">Anträge ausstehend</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.approvedThisMonth}</p>
            <p className="text-sm text-muted-foreground">Genehmigt</p>
            <p className="text-xs text-muted-foreground">Diesen Monat</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Euro className="h-5 w-5 text-violet-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(stats.totalExpenses)}</p>
            <p className="text-sm text-muted-foreground">Gesamt-Spesen</p>
            <p className="text-xs text-green-600">+12% zum Vorjahr</p>
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
              Alle Reisen anzeigen <ChevronRight className="h-4 w-4 ml-1" />
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
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Ausstehende Genehmigungen
              </CardTitle>
              <Badge className="bg-yellow-100 text-yellow-700">{stats.pendingApprovals}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: Math.min(3, stats.pendingApprovals || 1) }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-yellow-100 text-yellow-700">
                        {String.fromCharCode(65 + i)}M
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">Reiseantrag #{1000 + i}</p>
                      <p className="text-xs text-muted-foreground">Seit {i + 1} Tag(en)</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="default" className="w-full mt-3" size="sm">
              <CheckCheck className="h-4 w-4 mr-2" />
              Alle prüfen
            </Button>
          </CardContent>
        </Card>

        {/* Department Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Abteilungsübersicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {departments.slice(0, 4).map((dept) => (
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
      </div>
    </div>
  );
}
