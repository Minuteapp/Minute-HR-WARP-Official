import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExtendedBusinessTrip } from "@/types/business-travel-extended";
import { Calendar, Euro, Leaf, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface TripCardProps {
  trip: ExtendedBusinessTrip;
  onClick: () => void;
}

const TripCard = ({ trip, onClick }: TripCardProps) => {
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
    };

    const statusInfo = statusMap[status?.toLowerCase()] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  const getDurationDays = () => {
    if (trip.duration_days) return trip.duration_days;
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const projects = (trip as any).trip_projects || [];
  const tasks = (trip as any).trip_tasks || [];

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

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48">
        <img 
          src={getCityImage()} 
          alt={trip.city || trip.destination || "Reiseziel"}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {getStatusBadge(trip.status)}
        </div>
        <div className="absolute bottom-3 left-3 text-white">
          <p className="text-sm opacity-90">{trip.country || "Deutschland"}</p>
          <p className="text-xl font-bold">{trip.city || trip.destination}</p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold line-clamp-1">{trip.title || trip.destination}</h3>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
          <span className="text-xs">({getDurationDays()} Tage)</span>
        </div>

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

        {projects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {projects.slice(0, 2).map((p: any) => (
              <Badge key={p.id} variant="secondary" className="text-xs">
                {p.project_name}
              </Badge>
            ))}
            {projects.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{projects.length - 2}
              </Badge>
            )}
          </div>
        )}

        {tasks.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckSquare className="h-4 w-4" />
            <span>{tasks.filter((t: any) => t.is_completed).length}/{tasks.length} Aufgaben</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TripCard;
