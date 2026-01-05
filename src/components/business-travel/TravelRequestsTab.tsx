import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTravelRequests, TravelRequestWithEmployee } from "@/hooks/useTravelRequests";
import TripCardExtended from "./TripCardExtended";
import {
  Plane,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  Search,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";

interface TravelRequestsTabProps {
  onTripClick: (tripId: string) => void;
  onNewTrip: () => void;
}

const TravelRequestsTab = ({ onTripClick, onNewTrip }: TravelRequestsTabProps) => {
  const {
    trips,
    stats,
    departments,
    isLoading,
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
    timeframeFilter,
    setTimeframeFilter,
    kpiFilter,
    setKpiFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    itemsPerPage,
  } = useTravelRequests();

  const kpiCards = [
    {
      key: "new",
      label: "Neue Anträge",
      value: stats.newRequests,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      subtitle: "Letzte 7 Tage",
    },
    {
      key: "all",
      label: "Alle Reisen",
      value: stats.allTrips,
      icon: Plane,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      subtitle: "Gesamt",
    },
    {
      key: "approved",
      label: "Genehmigt",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      subtitle: "Bestätigt",
    },
    {
      key: "rejected",
      label: "Abgelehnt",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      subtitle: "Nicht genehmigt",
    },
    {
      key: "archived",
      label: "Archiviert",
      value: stats.archived,
      icon: Archive,
      color: "text-gray-500",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
      borderColor: "border-gray-200 dark:border-gray-800",
      subtitle: "Abgeschlossen",
    },
  ];

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reiseverwaltung - Alle Mitarbeiter</h2>
          <p className="text-muted-foreground">
            Durchsuchen und verwalten Sie alle Geschäftsreisen
            <Button variant="link" className="p-0 ml-2 h-auto text-primary">
              <Settings className="h-3 w-3 mr-1" />
              Admin-Ansicht
            </Button>
          </p>
        </div>
        <Button onClick={onNewTrip}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Reise
        </Button>
      </div>

      {/* KPI Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpiCards.map((kpi) => (
          <Card
            key={kpi.key}
            className={`cursor-pointer transition-all hover:shadow-md ${
              kpiFilter === kpi.key
                ? `ring-2 ring-primary ${kpi.borderColor}`
                : "hover:border-primary/50"
            }`}
            onClick={() => setKpiFilter(kpiFilter === kpi.key ? "all" : kpi.key)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <span className="text-2xl font-bold">{kpi.value}</span>
              </div>
              <p className="text-sm font-medium mt-2">{kpi.label}</p>
              <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Mitarbeiter, Destination, Abteilung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Alle Abteilungen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="pending">Ausstehend</SelectItem>
            <SelectItem value="approved">Genehmigt</SelectItem>
            <SelectItem value="rejected">Abgelehnt</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Alle Zeiträume" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Zeiträume</SelectItem>
            <SelectItem value="week">Nächste 7 Tage</SelectItem>
            <SelectItem value="month">Nächste 30 Tage</SelectItem>
            <SelectItem value="quarter">Nächste 90 Tage</SelectItem>
            <SelectItem value="past">Vergangene</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Zeige {startItem} - {endItem} von {totalItems} Reisen
        </span>
        <div className="flex items-center gap-2">
          <span>
            Seite {currentPage} von {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Trip Cards Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Lade Reiseanträge...
        </div>
      ) : trips.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
            Keine Reiseanträge gefunden
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCardExtended
              key={trip.id}
              trip={trip}
              onClick={() => onTripClick(trip.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TravelRequestsTab;
