
import { Card } from "@/components/ui/card";
import { BusinessTrip } from "@/types/business-travel";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar, CheckCircle2, XCircle, ClipboardCheck, Clock } from "lucide-react";

interface BusinessTripStatusCardProps {
  trip: BusinessTrip;
}

const BusinessTripStatusCard = ({ trip }: BusinessTripStatusCardProps) => {
  const getStatusColor = () => {
    switch (trip.status) {
      case "pending":
        return "text-yellow-600";
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "completed":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };
  
  const getStatusIcon = () => {
    switch (trip.status) {
      case "pending":
        return <Clock className={`h-5 w-5 ${getStatusColor()}`} />;
      case "approved":
        return <CheckCircle2 className={`h-5 w-5 ${getStatusColor()}`} />;
      case "rejected":
        return <XCircle className={`h-5 w-5 ${getStatusColor()}`} />;
      case "completed":
        return <ClipboardCheck className={`h-5 w-5 ${getStatusColor()}`} />;
      default:
        return <Clock className={`h-5 w-5 ${getStatusColor()}`} />;
    }
  };
  
  const getStatusText = () => {
    switch (trip.status) {
      case "pending":
        return "Ausstehend";
      case "approved":
        return "Genehmigt";
      case "rejected":
        return "Abgelehnt";
      case "completed":
        return "Abgeschlossen";
      case "cancelled":
        return "Storniert";
      default:
        return trip.status;
    }
  };
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Status</h3>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {getStatusIcon()}
          <div>
            <p className="font-medium">Status</p>
            <p className={getStatusColor()}>{getStatusText()}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-gray-500" />
          <div>
            <p className="font-medium">Beantragt am</p>
            <p>{format(new Date(trip.created_at), "dd. MMMM yyyy", { locale: de })}</p>
          </div>
        </div>
        
        {trip.approved_at && (
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">
                {trip.status === "approved" ? "Genehmigt am" : "Abgelehnt am"}
              </p>
              <p>{format(new Date(trip.approved_at), "dd. MMMM yyyy", { locale: de })}</p>
            </div>
          </div>
        )}
        
        {trip.report_submitted_at && (
          <div className="flex items-start gap-3">
            <ClipboardCheck className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">Bericht eingereicht</p>
              <p>{format(new Date(trip.report_submitted_at), "dd. MMMM yyyy", { locale: de })}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BusinessTripStatusCard;
