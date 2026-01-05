import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, User, Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NotificationCenterRedesigned from "@/components/notifications/NotificationCenterRedesigned";
import UserPreferencesTab from "@/components/notifications/UserPreferencesTab";
import { useIsMobile } from '@/hooks/use-device-type';
import MobileNotificationsPage from './mobile';

export default function NotificationsPage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('center');

  if (isMobile) {
    return <MobileNotificationsPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Benachrichtigungen</h1>
              <p className="text-sm text-gray-600 mt-1">
                Intelligentes Ereignis- & Eskalationssystem
              </p>
            </div>
          </div>

          {/* Tabs Navigation - Abwesenheits-Stil */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
            <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
              <TabsTrigger 
                value="center"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Benachrichtigungszentrale
              </TabsTrigger>
              <TabsTrigger 
                value="preferences"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Benutzerpräferenzen
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="center" className="mt-0">
                <NotificationCenterRedesigned />
              </TabsContent>

              <TabsContent value="preferences" className="mt-0">
                <UserPreferencesTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
