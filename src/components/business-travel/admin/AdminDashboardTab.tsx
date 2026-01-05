import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useBusinessTripsAdmin } from "@/hooks/useBusinessTripsAdmin";
import { 
  Euro, 
  Users, 
  Building2, 
  Plane, 
  Clock, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Settings,
  Link,
  MapPin
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const AdminDashboardTab = () => {
  const { stats, upcomingTrips, activeTrips, departmentOverview, activityLog, isLoading } = useBusinessTripsAdmin();
  const [upcomingOpen, setUpcomingOpen] = useState(true);
  const [activeOpen, setActiveOpen] = useState(true);
  const [departmentsOpen, setDepartmentsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  const paginatedDepartments = departmentOverview.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(departmentOverview.length / itemsPerPage);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd.MM.yyyy", { locale: de });
  };

  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), "HH:mm", { locale: de });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Lade Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Administrator Dashboard</h2>
          <p className="text-muted-foreground">
            Vollständige Übersicht über alle Abteilungen und Mitarbeiter
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">Enterprise: {stats.activeEmployees} Mitarbeiter</Badge>
            <Badge variant="secondary">{stats.departmentsCount} Abteilungen</Badge>
            <Badge variant="secondary">{departmentOverview.length || 1} Standorte</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Gesamtexport
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Einstellungen
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Euro className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gesamtbudget</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</p>
                <p className="text-xs text-green-600">+12% zum Vorjahr</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                <Users className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktive Mitarbeiter</p>
                <p className="text-2xl font-bold">{stats.activeEmployees}</p>
                <p className="text-xs text-muted-foreground">+5 diesen Monat</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <Building2 className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abteilungen</p>
                <p className="text-2xl font-bold">{stats.departmentsCount}</p>
                <p className="text-xs text-muted-foreground">{departmentOverview.length || 1} Standorte</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Plane className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Neue Reiseanträge</p>
                <p className="text-2xl font-bold">{stats.newRequestsCount}</p>
                <p className="text-xs text-muted-foreground">Letzte 7 Tage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Offene Anträge</p>
                <p className="text-2xl font-bold">{stats.pendingRequestsCount}</p>
                <p className="text-xs text-orange-600">Benötigt Prüfung</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming and Active Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Collapsible open={upcomingOpen} onOpenChange={setUpcomingOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Anstehende Reisen</CardTitle>
                    <Badge variant="secondary">{upcomingTrips.length}</Badge>
                  </div>
                  <ChevronDown className={`h-5 w-5 transition-transform ${upcomingOpen ? "rotate-180" : ""}`} />
                </div>
                <p className="text-sm text-muted-foreground">Nächste 7 Tage</p>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {upcomingTrips.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">Keine anstehenden Reisen</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingTrips.map((trip) => (
                      <div key={trip.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{trip.title || trip.destination}</p>
                            <p className="text-sm text-muted-foreground">
                              {trip.city && trip.country ? `${trip.city}, ${trip.country}` : trip.destination}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatDate(trip.start_date)}</p>
                          <Badge variant="outline" className="text-xs">{trip.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4">
                  Alle anstehenden Reisen
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card>
          <Collapsible open={activeOpen} onOpenChange={setActiveOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Aktuell unterwegs</CardTitle>
                    <Badge variant="secondary">{activeTrips.length}</Badge>
                  </div>
                  <ChevronDown className={`h-5 w-5 transition-transform ${activeOpen ? "rotate-180" : ""}`} />
                </div>
                <p className="text-sm text-muted-foreground">Mitarbeiter auf Geschäftsreise</p>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {activeTrips.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">Niemand aktuell unterwegs</p>
                ) : (
                  <div className="space-y-3">
                    {activeTrips.map((trip) => (
                      <div key={trip.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Plane className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="font-medium">{trip.title || trip.destination}</p>
                            <p className="text-sm text-muted-foreground">
                              {trip.city && trip.country ? `${trip.city}, ${trip.country}` : trip.destination}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">bis {formatDate(trip.end_date)}</p>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Aktiv
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4">
                  <MapPin className="h-4 w-4 mr-2" />
                  Live-Karte anzeigen
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      {/* Departments and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Collapsible open={departmentsOpen} onOpenChange={setDepartmentsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Abteilungsübersicht</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Seite {currentPage + 1} von {Math.max(1, totalPages)}
                    </span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${departmentsOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {paginatedDepartments.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">Keine Abteilungsdaten verfügbar</p>
                ) : (
                  <div className="space-y-3">
                    {paginatedDepartments.map((dept) => (
                      <div key={dept.department} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{dept.department}</p>
                            <p className="text-sm text-muted-foreground">{dept.employeeCount} Mitarbeiter</p>
                          </div>
                          <Badge variant="outline">{dept.activeTrips} aktive Reisen</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Budget: {formatCurrency(dept.budget)}</span>
                          <span className="text-muted-foreground">Ausgaben: {formatCurrency(dept.spent)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Zurück
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Weiter
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Systemaktivität</CardTitle>
              <Button variant="ghost" size="sm">Alle</Button>
            </div>
          </CardHeader>
          <CardContent>
            {activityLog.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Keine Aktivitäten vorhanden</p>
            ) : (
              <div className="space-y-3">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div 
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status_color === "green" ? "bg-green-500" :
                        activity.status_color === "orange" ? "bg-orange-500" :
                        activity.status_color === "blue" ? "bg-blue-500" :
                        "bg-gray-500"
                      }`} 
                    />
                    <div className="flex-1">
                      <p className="text-sm">{activity.activity_message}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {activity.department && <span>{activity.department}</span>}
                        <span>{formatTime(activity.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Schnellaktionen</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <p className="font-medium text-center">Benutzer</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Building2 className="h-8 w-8 text-yellow-600 mb-2" />
              <p className="font-medium text-center">Abteilungen</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Settings className="h-8 w-8 text-gray-600 mb-2" />
              <p className="font-medium text-center">Richtlinien</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Link className="h-8 w-8 text-purple-600 mb-2" />
              <p className="font-medium text-center">Integration</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardTab;
