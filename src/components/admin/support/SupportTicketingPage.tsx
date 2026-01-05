import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Ticket, Clock, Book, BarChart3, Settings } from "lucide-react";
import SupportDashboardTab from "./tabs/SupportDashboardTab";
import SupportTicketsTab from "./tabs/SupportTicketsTab";
import SupportSLATab from "./tabs/SupportSLATab";
import SupportKnowledgeBaseTab from "./tabs/SupportKnowledgeBaseTab";
import SupportAnalyticsTab from "./tabs/SupportAnalyticsTab";
import SupportSettingsTab from "./tabs/SupportSettingsTab";

const SupportTicketingPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Support & Ticketing</h1>
        <p className="text-sm text-gray-600">Zentrales Support-System für alle Mandanten</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none p-0 h-auto">
          <TabsTrigger
            value="dashboard"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 flex items-center gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            Support Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="tickets"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 flex items-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            Tickets
          </TabsTrigger>
          <TabsTrigger
            value="sla"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            SLA & Prioritäten
          </TabsTrigger>
          <TabsTrigger
            value="knowledge"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 flex items-center gap-2"
          >
            <Book className="w-4 h-4" />
            Wissensdatenbank
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Auswertungen
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 pt-2 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Einstellungen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <SupportDashboardTab />
        </TabsContent>
        <TabsContent value="tickets" className="mt-6">
          <SupportTicketsTab />
        </TabsContent>
        <TabsContent value="sla" className="mt-6">
          <SupportSLATab />
        </TabsContent>
        <TabsContent value="knowledge" className="mt-6">
          <SupportKnowledgeBaseTab />
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <SupportAnalyticsTab />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <SupportSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportTicketingPage;
