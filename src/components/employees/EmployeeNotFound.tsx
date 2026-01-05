import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserX } from "lucide-react";

const EmployeeNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/employees')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
          <UserX className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Mitarbeiter nicht gefunden</h2>
        <p className="text-gray-600 mb-6">Der gesuchte Mitarbeiter existiert nicht oder wurde gelöscht.</p>
        <Button onClick={() => navigate('/employees')}>
          Zurück zur Mitarbeiterübersicht
        </Button>
      </div>
    </div>
  );
};

export default EmployeeNotFound;