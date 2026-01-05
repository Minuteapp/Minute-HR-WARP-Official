
import { BusinessTrip } from "@/types/business-travel";
import { Car, Train, Plane, Bus, CarTaxiFront } from "lucide-react";

interface BusinessTripTransportIconProps {
  trip: BusinessTrip;
}

const BusinessTripTransportIcon = ({ trip }: BusinessTripTransportIconProps) => {
  switch (trip.transport) {
    case "car":
      return <Car className="h-5 w-5 text-gray-500 mt-0.5" />;
    case "train":
      return <Train className="h-5 w-5 text-gray-500 mt-0.5" />;
    case "plane":
      return <Plane className="h-5 w-5 text-gray-500 mt-0.5" />;
    default:
      return <Car className="h-5 w-5 text-gray-500 mt-0.5" />;
  }
};

export default BusinessTripTransportIcon;
