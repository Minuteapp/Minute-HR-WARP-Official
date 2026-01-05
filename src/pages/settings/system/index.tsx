
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SystemSettings from "@/components/settings/SystemSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";

export default function SystemSettingsPage() {
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
          <h1 className="text-2xl font-semibold text-gray-900">System & Sicherheit</h1>
        </div>
      </div>

      <div className="space-y-6">
        <SystemSettings />
        <SecuritySettings />
      </div>
    </div>
  );
}
