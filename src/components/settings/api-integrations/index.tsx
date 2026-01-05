import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Server, 
  Plug, 
  Webhook, 
  Workflow, 
  Brain, 
  BarChart3,
  Shield,
  Globe
} from "lucide-react";
import { GlobalApiSettingsTab } from "./tabs/GlobalApiSettingsTab";
import { InternalApisTab } from "./tabs/InternalApisTab";
import { ExternalIntegrationsTab } from "./tabs/ExternalIntegrationsTab";
import { WebhooksTab } from "./tabs/WebhooksTab";
import { IPaasTab } from "./tabs/IPaasTab";
import { AiIntegrationsTab } from "./tabs/AiIntegrationsTab";
import { ApiMonitoringTab } from "./tabs/ApiMonitoringTab";

export function ApiIntegrationsSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6" />
            API & Integrationen
          </h2>
          <p className="text-muted-foreground">
            Verwalten Sie externe Systeme, APIs, Webhooks und Datenflüsse
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Shield className="h-3 w-3" />
          Enterprise
        </Badge>
      </div>

      <Tabs defaultValue="global" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7 h-auto">
          <TabsTrigger value="global" className="flex flex-col gap-1 py-2 px-1 text-xs">
            <Settings className="h-4 w-4" />
            <span>Grundkonfiguration</span>
          </TabsTrigger>
          <TabsTrigger value="internal" className="flex flex-col gap-1 py-2 px-1 text-xs">
            <Server className="h-4 w-4" />
            <span>Interne APIs</span>
          </TabsTrigger>
          <TabsTrigger value="external" className="flex flex-col gap-1 py-2 px-1 text-xs">
            <Plug className="h-4 w-4" />
            <span>Externe Integrationen</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex flex-col gap-1 py-2 px-1 text-xs">
            <Webhook className="h-4 w-4" />
            <span>Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="ipaas" className="flex flex-col gap-1 py-2 px-1 text-xs">
            <Workflow className="h-4 w-4" />
            <span>iPaaS</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex flex-col gap-1 py-2 px-1 text-xs">
            <Brain className="h-4 w-4" />
            <span>KI</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex flex-col gap-1 py-2 px-1 text-xs">
            <BarChart3 className="h-4 w-4" />
            <span>Monitoring</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          <GlobalApiSettingsTab />
        </TabsContent>

        <TabsContent value="internal">
          <InternalApisTab />
        </TabsContent>

        <TabsContent value="external">
          <ExternalIntegrationsTab />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhooksTab />
        </TabsContent>

        <TabsContent value="ipaas">
          <IPaasTab />
        </TabsContent>

        <TabsContent value="ai">
          <AiIntegrationsTab />
        </TabsContent>

        <TabsContent value="monitoring">
          <ApiMonitoringTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
