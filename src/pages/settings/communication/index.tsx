import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import CommunicationGeneralSettings from "./components/CommunicationGeneralSettings";
import NotificationChannelsSettings from "./components/NotificationChannelsSettings";
import EventBasedNotifications from "./components/EventBasedNotifications";
import CommunicationRoleVisibility from "./components/CommunicationRoleVisibility";
import AutomationAISettings from "./components/AutomationAISettings";
import CompliancePrivacySettings from "./components/CompliancePrivacySettings";
import CommunicationIntegrations from "./components/CommunicationIntegrations";
import ReportingMonitoring from "./components/ReportingMonitoring";

export default function CommunicationSettingsPage() {
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
          <h1 className="text-2xl font-semibold text-gray-900">Kommunikation & Benachrichtigungen</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Kommunikations- und Benachrichtigungseinstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="general">Allgemein</TabsTrigger>
              <TabsTrigger value="channels">Kanäle</TabsTrigger>
              <TabsTrigger value="events">Ereignisse</TabsTrigger>
              <TabsTrigger value="roles">Rollen</TabsTrigger>
              <TabsTrigger value="automation">KI & Auto</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="integrations">Integration</TabsTrigger>
              <TabsTrigger value="reporting">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <CommunicationGeneralSettings />
            </TabsContent>

            <TabsContent value="channels">
              <NotificationChannelsSettings />
            </TabsContent>

            <TabsContent value="events">
              <EventBasedNotifications />
            </TabsContent>

            <TabsContent value="roles">
              <CommunicationRoleVisibility />
            </TabsContent>

            <TabsContent value="automation">
              <AutomationAISettings />
            </TabsContent>

            <TabsContent value="compliance">
              <CompliancePrivacySettings />
            </TabsContent>

            <TabsContent value="integrations">
              <CommunicationIntegrations />
            </TabsContent>

            <TabsContent value="reporting">
              <ReportingMonitoring />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}