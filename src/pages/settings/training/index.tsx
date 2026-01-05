
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import TrainingSettings from "@/components/settings/TrainingSettings";

export default function TrainingSettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate("/settings")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">Weiterbildung & Schulungen</h1>
        </div>
      </div>

      <TrainingSettings />
    </div>
  );
}
