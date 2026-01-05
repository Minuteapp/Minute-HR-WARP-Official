
import { useParams } from "react-router-dom";
import { useTripManagement } from "@/hooks/business-travel/useTripManagement";
import { useExpenseManagement } from "@/hooks/business-travel/useExpenseManagement";
import { useReportManagement } from "@/hooks/business-travel/useReportManagement";
import { BusinessTripDetails } from "./BusinessTripDetails";
import BusinessTripSkeleton from "./BusinessTripSkeleton";
import BusinessTripNotFound from "./BusinessTripNotFound";
import BusinessTripHeader from "./BusinessTripHeader";

const BusinessTripDetailContainer = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
    trip,
    isLoadingTrip,
    tripError,
    approveTrip,
    rejectTrip,
    completeTrip,
    flightManagement,
    aiSuggestions
  } = useTripManagement(id);

  const { expenses, isLoadingExpenses } = useExpenseManagement(id || '');
  const { report, isLoadingReport } = useReportManagement(id || '');

  if (isLoadingTrip) {
    return <BusinessTripSkeleton />;
  }

  if (tripError || !trip) {
    return <BusinessTripNotFound />;
  }

  const handleApprove = async () => {
    if (trip.id) {
      await approveTrip(trip.id);
    }
  };

  const handleReject = async () => {
    if (trip.id) {
      await rejectTrip(trip.id, 'Grund für Ablehnung');
    }
  };

  const handleComplete = async () => {
    if (trip.id) {
      await completeTrip(trip.id);
    }
  };

  return (
    <div className="w-full py-6">
      <BusinessTripHeader
        trip={trip}
        onApprove={handleApprove}
        onReject={handleReject}
        onComplete={handleComplete}
      />
      
      <BusinessTripDetails 
        trip={trip}
        flightManagement={flightManagement}
        aiSuggestions={aiSuggestions}
        expenses={expenses}
        report={report}
        isLoadingExpenses={isLoadingExpenses}
        isLoadingReport={isLoadingReport}
        onApprove={handleApprove}
        onReject={handleReject}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default BusinessTripDetailContainer;
