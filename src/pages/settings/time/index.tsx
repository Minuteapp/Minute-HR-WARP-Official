import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimeTrackingGeneralSettings from "./components/TimeTrackingGeneralSettings";
import WorkTimeRulesSettings from "./components/WorkTimeRulesSettings";
import RecordingMethodsSettings from "./components/RecordingMethodsSettings";
import DeviceTerminalSettings from "./components/DeviceTerminalSettings";
import CountryPartnerSettings from "./components/CountryPartnerSettings";
import AISmartDetectionSettings from "./components/AISmartDetectionSettings";
import TimeTrackingRoleVisibility from "./components/TimeTrackingRoleVisibility";
import TimeTrackingNotifications from "./components/TimeTrackingNotifications";
import ReportingExportSettings from "./components/ReportingExportSettings";

export default function TimeTrackingSettingsPage() {
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
          <h1 className="text-2xl font-semibold text-gray-900">Zeiterfassung</h1>
        </div>
      </div>

      <div className="bg-background rounded-lg border">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="work-rules">Arbeitszeitregeln</TabsTrigger>
            <TabsTrigger value="recording-methods">Erfassungsmethoden</TabsTrigger>
            <TabsTrigger value="devices">Geräte & Terminals</TabsTrigger>
            <TabsTrigger value="countries">Länder</TabsTrigger>
            <TabsTrigger value="ai-detection">KI & Smart Detection</TabsTrigger>
            <TabsTrigger value="roles">Rollen & Sichtbarkeit</TabsTrigger>
            <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
            <TabsTrigger value="reporting">Reporting & Export</TabsTrigger>
          </TabsList>
          
          <div className="mt-6 px-6 pb-6">
            <TabsContent value="general" className="mt-0">
              <TimeTrackingGeneralSettings />
            </TabsContent>
            
            <TabsContent value="work-rules" className="mt-0">
              <WorkTimeRulesSettings />
            </TabsContent>
            
            <TabsContent value="recording-methods" className="mt-0">
              <RecordingMethodsSettings />
            </TabsContent>
            
            <TabsContent value="devices" className="mt-0">
              <DeviceTerminalSettings />
            </TabsContent>
            
            <TabsContent value="countries" className="mt-0">
              <CountryPartnerSettings />
            </TabsContent>
            
            <TabsContent value="ai-detection" className="mt-0">
              <AISmartDetectionSettings />
            </TabsContent>
            
            <TabsContent value="roles" className="mt-0">
              <TimeTrackingRoleVisibility />
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
              <TimeTrackingNotifications />
            </TabsContent>
            
            <TabsContent value="reporting" className="mt-0">
              <ReportingExportSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}