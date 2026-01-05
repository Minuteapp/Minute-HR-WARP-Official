
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const BusinessTripNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/business-travel')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Geschäftsreise nicht gefunden</h2>
        <p className="text-gray-600 mb-6">Die gesuchte Geschäftsreise existiert nicht oder wurde gelöscht.</p>
        <Button onClick={() => navigate('/business-travel')}>
          Zurück zur Übersicht
        </Button>
      </div>
    </div>
  );
};

export default BusinessTripNotFound;
