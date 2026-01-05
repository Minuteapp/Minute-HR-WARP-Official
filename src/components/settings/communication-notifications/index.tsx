
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  FileText, 
  Users, 
  AlertTriangle, 
  UserCog, 
  Brain,
  ClipboardList
} from "lucide-react";
import ChannelsTab from "./tabs/ChannelsTab";
import EventRulesTab from "./tabs/EventRulesTab";
import TemplatesTab from "./tabs/TemplatesTab";
import RoleContextTab from "./tabs/RoleContextTab";
import EscalationsTab from "./tabs/EscalationsTab";
import UserPreferencesTab from "./tabs/UserPreferencesTab";
import AiAssistanceTab from "./tabs/AiAssistanceTab";
import AuditTab from "./tabs/AuditTab";

export default function CommunicationNotificationsSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Kommunikation & Benachrichtigungen</h2>
          <p className="text-muted-foreground">
            Die richtige Information – zur richtigen Zeit – an die richtige Person
          </p>
        </div>
      </div>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 h-auto p-2">
          <TabsTrigger value="channels" className="flex flex-col gap-1 py-2 px-3">
            <Mail className="h-4 w-4" />
            <span className="text-xs">Kanäle</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex flex-col gap-1 py-2 px-3">
            <Bell className="h-4 w-4" />
            <span className="text-xs">Events</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex flex-col gap-1 py-2 px-3">
            <FileText className="h-4 w-4" />
            <span className="text-xs">Vorlagen</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex flex-col gap-1 py-2 px-3">
            <Users className="h-4 w-4" />
            <span className="text-xs">Rollen</span>
          </TabsTrigger>
          <TabsTrigger value="escalations" className="flex flex-col gap-1 py-2 px-3">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs">Eskalation</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex flex-col gap-1 py-2 px-3">
            <UserCog className="h-4 w-4" />
            <span className="text-xs">User-Prefs</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex flex-col gap-1 py-2 px-3">
            <Brain className="h-4 w-4" />
            <span className="text-xs">KI</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex flex-col gap-1 py-2 px-3">
            <ClipboardList className="h-4 w-4" />
            <span className="text-xs">Audit</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels">
          <ChannelsTab />
        </TabsContent>

        <TabsContent value="events">
          <EventRulesTab />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>

        <TabsContent value="roles">
          <RoleContextTab />
        </TabsContent>

        <TabsContent value="escalations">
          <EscalationsTab />
        </TabsContent>

        <TabsContent value="preferences">
          <UserPreferencesTab />
        </TabsContent>

        <TabsContent value="ai">
          <AiAssistanceTab />
        </TabsContent>

        <TabsContent value="audit">
          <AuditTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
