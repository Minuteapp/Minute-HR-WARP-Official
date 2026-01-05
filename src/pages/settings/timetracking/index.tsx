import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import TimeTrackingGeneralSettings from "./components/TimeTrackingGeneralSettings";
import WorkTimeModelsLaws from "./components/WorkTimeModelsLaws";
import TerminalDeviceManagement from "./components/TerminalDeviceManagement";
import QRCodeSmartDetection from "./components/QRCodeSmartDetection";
import LocationGeofencing from "./components/LocationGeofencing";
import AutomationAI from "./components/AutomationAI";
import PayrollIntegrations from "./components/PayrollIntegrations";
import TimeTrackingCompliance from "./components/TimeTrackingCompliance";
import BreaksRestPeriodsTab from "./components/BreaksRestPeriodsTab";
import BookingRulesCorrectionsTab from "./components/BookingRulesCorrectionsTab";
import OvertimeBonusesTab from "./components/OvertimeBonusesTab";
import ApprovalsControlTab from "./components/ApprovalsControlTab";
import { SettingsPermissionGuard } from '@/components/settings/SettingsPermissionGuard';

export default function TimeTrackingSettingsPage() {
  const navigate = useNavigate();

  return (
    <SettingsPermissionGuard moduleId="timetracking">
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
            <h1 className="text-2xl font-semibold text-foreground">Zeiterfassung</h1>
          </div>
        </div>

        <div className="bg-background rounded-lg border">
          <Tabs defaultValue="general" className="w-full">
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-max p-1">
                <TabsTrigger value="general">Allgemein</TabsTrigger>
                <TabsTrigger value="worktime-laws">Arbeitszeitmodelle</TabsTrigger>
                <TabsTrigger value="breaks">Pausen & Ruhezeiten</TabsTrigger>
                <TabsTrigger value="booking-rules">Buchungsregeln</TabsTrigger>
                <TabsTrigger value="overtime">Überstunden & Zuschläge</TabsTrigger>
                <TabsTrigger value="approvals">Genehmigungen</TabsTrigger>
                <TabsTrigger value="terminals">Terminal-Verwaltung</TabsTrigger>
                <TabsTrigger value="qr-detection">QR & Detection</TabsTrigger>
                <TabsTrigger value="geofencing">Standort & Geofencing</TabsTrigger>
                <TabsTrigger value="automation">Automatisierung</TabsTrigger>
                <TabsTrigger value="integrations">Integrationen</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            
            <div className="mt-6 px-6 pb-6">
              <TabsContent value="general" className="mt-0">
                <TimeTrackingGeneralSettings />
              </TabsContent>

              <TabsContent value="worktime-laws" className="mt-0">
                <WorkTimeModelsLaws />
              </TabsContent>

              <TabsContent value="breaks" className="mt-0">
                <BreaksRestPeriodsTab />
              </TabsContent>

              <TabsContent value="booking-rules" className="mt-0">
                <BookingRulesCorrectionsTab />
              </TabsContent>

              <TabsContent value="overtime" className="mt-0">
                <OvertimeBonusesTab />
              </TabsContent>

              <TabsContent value="approvals" className="mt-0">
                <ApprovalsControlTab />
              </TabsContent>

              <TabsContent value="terminals" className="mt-0">
                <TerminalDeviceManagement />
              </TabsContent>

              <TabsContent value="qr-detection" className="mt-0">
                <QRCodeSmartDetection />
              </TabsContent>

              <TabsContent value="geofencing" className="mt-0">
                <LocationGeofencing />
              </TabsContent>

              <TabsContent value="automation" className="mt-0">
                <AutomationAI />
              </TabsContent>

              <TabsContent value="integrations" className="mt-0">
                <PayrollIntegrations />
              </TabsContent>

              <TabsContent value="compliance" className="mt-0">
                <TimeTrackingCompliance />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </SettingsPermissionGuard>
  );
}