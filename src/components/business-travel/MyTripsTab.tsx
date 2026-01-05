import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyTrips } from "@/hooks/useMyTrips";
import TripCard from "./TripCard";
import { 
  Plane, 
  Euro, 
  Leaf, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Download 
} from "lucide-react";
import { useState } from "react";

interface MyTripsTabProps {
  onTripSelect: (tripId: string) => void;
}

const MyTripsTab = ({ onTripSelect }: MyTripsTabProps) => {
  const { 
    trips, 
    stats, 
    filterCounts, 
    statusFilter, 
    setStatusFilter, 
    searchQuery, 
    setSearchQuery,
    isLoading 
  } = useMyTrips();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
  };

  const filterCards = [
    { key: "all", label: "Alle Reisen", icon: Plane, count: filterCounts.all, color: "blue" },
    { key: "planned", label: "Geplant", icon: Clock, count: filterCounts.planned, color: "yellow" },
    { key: "completed", label: "Abgeschlossen", icon: CheckCircle, count: filterCounts.completed, color: "green" },
    { key: "pending", label: "Ausstehend", icon: AlertCircle, count: filterCounts.pending, color: "red" },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Lade Reisen...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Meine Reisen</h2>
        <p className="text-muted-foreground">Verwalten Sie Ihre persönlichen Geschäftsreisen</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Plane className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gesamt Reisen</p>
                <p className="text-2xl font-bold">{stats.totalTrips}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <Euro className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Euro className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ausgaben</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CO₂</p>
                <p className="text-2xl font-bold">{stats.totalCO2} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {filterCards.map((filter) => {
          const Icon = filter.icon;
          const isActive = statusFilter === filter.key;
          
          return (
            <Card 
              key={filter.key}
              className={`cursor-pointer transition-all ${
                isActive 
                  ? "ring-2 ring-primary bg-primary/5" 
                  : "hover:bg-muted/50"
              }`}
              onClick={() => setStatusFilter(filter.key)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`p-2 rounded-full ${
                  filter.color === "blue" ? "bg-blue-100 dark:bg-blue-900/30" :
                  filter.color === "yellow" ? "bg-yellow-100 dark:bg-yellow-900/30" :
                  filter.color === "green" ? "bg-green-100 dark:bg-green-900/30" :
                  "bg-red-100 dark:bg-red-900/30"
                }`}>
                  <Icon className={`h-5 w-5 ${
                    filter.color === "blue" ? "text-blue-600 dark:text-blue-400" :
                    filter.color === "yellow" ? "text-yellow-600 dark:text-yellow-400" :
                    filter.color === "green" ? "text-green-600 dark:text-green-400" :
                    "text-red-600 dark:text-red-400"
                  }`} />
                </div>
                <div>
                  <p className="font-medium">{filter.label}</p>
                  <p className="text-2xl font-bold">{filter.count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Destination, Titel, Projekt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="planned">Geplant</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
            <SelectItem value="pending">Ausstehend</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Zeige 1 - {trips.length} von {trips.length} Reisen
      </p>

      {/* Trip Cards Grid */}
      {trips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plane className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Keine Reisen gefunden</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Versuchen Sie eine andere Suche" : "Erstellen Sie Ihre erste Geschäftsreise"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard 
              key={trip.id} 
              trip={trip} 
              onClick={() => onTripSelect(trip.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTripsTab;
