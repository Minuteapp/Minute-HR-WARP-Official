
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BusinessTrip } from "@/types/business-travel";

interface BusinessTripHeaderProps {
  trip: BusinessTrip;
  onApprove?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
}

const BusinessTripHeader = ({ trip, onApprove, onReject, onComplete }: BusinessTripHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/business-travel')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Geschäftsreise: {trip.destination}</h1>
      </div>
    </div>
  );
};

export default BusinessTripHeader;
