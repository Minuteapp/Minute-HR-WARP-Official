
import { Badge } from "@/components/ui/badge";
import { BusinessTrip } from "@/types/business-travel";

interface BusinessTripStatusBadgeProps {
  trip: BusinessTrip;
}

const BusinessTripStatusBadge = ({ trip }: BusinessTripStatusBadgeProps) => {
  switch (trip.status) {
    case "pending":
      return (
        <Badge 
          variant="outline" 
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          Ausstehend
        </Badge>
      );
    case "approved":
      return (
        <Badge 
          variant="outline" 
          className="bg-green-50 text-green-700 border-green-200"
        >
          Genehmigt
        </Badge>
      );
    case "rejected":
      return (
        <Badge 
          variant="outline" 
          className="bg-red-50 text-red-700 border-red-200"
        >
          Abgelehnt
        </Badge>
      );
    case "completed":
      return (
        <Badge 
          variant="outline" 
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Abgeschlossen
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {trip.status}
        </Badge>
      );
  }
};

export default BusinessTripStatusBadge;
