import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TravelRequestWithEmployee } from "@/hooks/useTravelRequests";
import { Calendar, Euro, Leaf, CheckSquare, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface TripCardExtendedProps {
  trip: TravelRequestWithEmployee;
  onClick: () => void;
}

const TripCardExtended = ({ trip, onClick }: TripCardExtendedProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd.MM.yyyy", { locale: de });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      genehmigt: { label: "Genehmigt", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      approved: { label: "Genehmigt", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      confirmed: { label: "Bestätigt", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      ausstehend: { label: "Ausstehend", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
      pending: { label: "Ausstehend", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
      abgeschlossen: { label: "Abgeschlossen", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
      completed: { label: "Abgeschlossen", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
      geplant: { label: "Geplant", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
      planned: { label: "Geplant", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
      active: { label: "Aktiv", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 animate-pulse" },
      rejected: { label: "Abgelehnt", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
      abgelehnt: { label: "Abgelehnt", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    };

    const statusInfo = statusMap[status?.toLowerCase()] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  const getUpcomingBadge = () => {
    const now = new Date();
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);

    if (now >= startDate && now <= endDate) {
      return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Aktiv</Badge>;
    }
    if (startDate > now) {
      const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 7) {
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">In {daysUntil} Tagen</Badge>;
      }
    }
    return null;
  };

  const getDurationDays = () => {
    if (trip.duration_days) return trip.duration_days;
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // City images fallback
  const getCityImage = () => {
    if (trip.destination_image_url) return trip.destination_image_url;
    
    const cityImages: Record<string, string> = {
      "münchen": "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800",
      "munich": "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800",
      "berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800",
      "frankfurt": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800",
      "hamburg": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
      "london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
      "paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
      "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
      "tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
    };

    const cityKey = (trip.city || trip.destination || "").toLowerCase();
    return cityImages[cityKey] || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800";
  };

  const isHighPriority = trip.priority === "high";

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-40">
        <img 
          src={getCityImage()} 
          alt={trip.city || trip.destination || "Reiseziel"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {getStatusBadge(trip.status)}
          {getUpcomingBadge()}
        </div>
        
        {/* High Priority Badge */}
        {isHighPriority && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-red-500 text-white">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Hohe Priorität
            </Badge>
          </div>
        )}

        {/* Location */}
        <div className="absolute bottom-3 left-3 text-white">
          <p className="text-sm opacity-90">{trip.country || "Deutschland"}</p>
          <p className="text-lg font-bold">{trip.city || trip.destination}</p>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        {/* Employee Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={trip.employee_avatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(trip.employee_name || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{trip.employee_name}</p>
            <p className="text-xs text-muted-foreground truncate">{trip.employee_department}</p>
          </div>
        </div>

        {/* Trip Title */}
        <h3 className="font-semibold line-clamp-1">{trip.title || trip.destination}</h3>
        
        {/* Date & Duration */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
          <span className="text-xs">({getDurationDays()} Tage)</span>
        </div>

        {/* Cost & CO2 */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Euro className="h-4 w-4 text-muted-foreground" />
            <span>{formatCurrency(trip.total_cost || 0)}</span>
            <span className="text-muted-foreground">/ {formatCurrency(trip.budget || 0)}</span>
          </div>
          {trip.co2_emission && trip.co2_emission > 0 && (
            <div className="flex items-center gap-1 text-green-600">
              <Leaf className="h-4 w-4" />
              <span>{trip.co2_emission} kg</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCardExtended;
