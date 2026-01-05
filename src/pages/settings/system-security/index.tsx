import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthenticationAccess from "./components/AuthenticationAccess";
import DeviceLocationManagement from "./components/DeviceLocationManagement";
import RoleBasedSecurity from "./components/RoleBasedSecurity";
import NetworkSecurityZeroTrust from "./components/NetworkSecurityZeroTrust";
import DataProtectionCompliance from "./components/DataProtectionCompliance";
import MonitoringAudit from "./components/MonitoringAudit";
import ExternalIntegrations from "./components/ExternalIntegrations";
import EmergencyBusinessContinuity from "./components/EmergencyBusinessContinuity";

export default function SystemSecurityPage() {
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

      <Tabs defaultValue="authentication" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="authentication">Authentifizierung</TabsTrigger>
          <TabsTrigger value="device-location">Geräte & Standort</TabsTrigger>
          <TabsTrigger value="rbac">RBAC</TabsTrigger>
          <TabsTrigger value="network-security">Netzwerksicherheit</TabsTrigger>
          <TabsTrigger value="data-protection">Datenschutz</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="integrations">Integrationen</TabsTrigger>
          <TabsTrigger value="emergency">Notfall</TabsTrigger>
        </TabsList>

        <TabsContent value="authentication">
          <AuthenticationAccess />
        </TabsContent>

        <TabsContent value="device-location">
          <DeviceLocationManagement />
        </TabsContent>

        <TabsContent value="rbac">
          <RoleBasedSecurity />
        </TabsContent>

        <TabsContent value="network-security">
          <NetworkSecurityZeroTrust />
        </TabsContent>

        <TabsContent value="data-protection">
          <DataProtectionCompliance />
        </TabsContent>

        <TabsContent value="monitoring">
          <MonitoringAudit />
        </TabsContent>

        <TabsContent value="integrations">
          <ExternalIntegrations />
        </TabsContent>

        <TabsContent value="emergency">
          <EmergencyBusinessContinuity />
        </TabsContent>
      </Tabs>
    </div>
  );
}