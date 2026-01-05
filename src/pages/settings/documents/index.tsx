import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import DocumentGeneralSettings from "./components/DocumentGeneralSettings";
import CategoriesMetadataSettings from "./components/CategoriesMetadataSettings";
import UploadStorageSettings from "./components/UploadStorageSettings";
import AccessRightsSettings from "./components/AccessRightsSettings";
import DocumentAutomationAI from "./components/DocumentAutomationAI";
import DocumentCompliance from "./components/DocumentCompliance";
import DocumentIntegrations from "./components/DocumentIntegrations";
import DocumentNotifications from "./components/DocumentNotifications";
import DocumentReporting from "./components/DocumentReporting";
import DocumentIncomingTab from "./components/DocumentIncomingTab";
import DocumentManagementTab from "./components/DocumentManagementTab";
import DocumentWorkflowsTab from "./components/DocumentWorkflowsTab";
import DocumentArchiveTab from "./components/DocumentArchiveTab";
import DocumentAnalyticsTab from "./components/DocumentAnalyticsTab";

export default function DocumentsSettingsPage() {
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
          <h1 className="text-2xl font-semibold text-gray-900">Dokumente</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Dokumenteneinstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-14">
              <TabsTrigger value="incoming">Eingang</TabsTrigger>
              <TabsTrigger value="management">Verwaltung</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="archive">Archiv</TabsTrigger>
              <TabsTrigger value="analytics">Analysen</TabsTrigger>
              <TabsTrigger value="general">Allgemein</TabsTrigger>
              <TabsTrigger value="categories">Kategorien</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="access">Zugriff</TabsTrigger>
              <TabsTrigger value="automation">KI & Auto</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="integrations">Integration</TabsTrigger>
              <TabsTrigger value="notifications">Meldungen</TabsTrigger>
              <TabsTrigger value="reporting">Reporting</TabsTrigger>
            </TabsList>

            <TabsContent value="incoming">
              <DocumentIncomingTab />
            </TabsContent>

            <TabsContent value="management">
              <DocumentManagementTab />
            </TabsContent>

            <TabsContent value="workflows">
              <DocumentWorkflowsTab />
            </TabsContent>

            <TabsContent value="archive">
              <DocumentArchiveTab />
            </TabsContent>

            <TabsContent value="analytics">
              <DocumentAnalyticsTab />
            </TabsContent>

            <TabsContent value="general">
              <DocumentGeneralSettings />
            </TabsContent>

            <TabsContent value="categories">
              <CategoriesMetadataSettings />
            </TabsContent>

            <TabsContent value="upload">
              <UploadStorageSettings />
            </TabsContent>

            <TabsContent value="access">
              <AccessRightsSettings />
            </TabsContent>

            <TabsContent value="automation">
              <DocumentAutomationAI />
            </TabsContent>

            <TabsContent value="compliance">
              <DocumentCompliance />
            </TabsContent>

            <TabsContent value="integrations">
              <DocumentIntegrations />
            </TabsContent>

            <TabsContent value="notifications">
              <DocumentNotifications />
            </TabsContent>

            <TabsContent value="reporting">
              <DocumentReporting />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}